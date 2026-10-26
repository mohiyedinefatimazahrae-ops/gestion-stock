<?php

namespace App\Http\Controllers;

use App\Models\NotificationStock;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class NotificationStockController extends Controller
{
    /**
     * Synchroniser l'état du stock et retourner les notifications.
     */
    public function index(): JsonResponse
    {
        DB::transaction(function () {
            $produits = Produit::query()
                ->lockForUpdate()
                ->get();

            foreach ($produits as $produit) {
                $stockFaible = $produit->actif
                    && (float) $produit->qte_stock
                        <= (float) $produit->qte_min;

                if ($stockFaible && !$produit->alerte_stock_active) {
                    NotificationStock::create([
                        'produit_id' => $produit->id_prd,
                        'message' => 'Stock minimum atteint : '
                            . $produit->nom_prd,
                        'qte_stock' => $produit->qte_stock,
                        'qte_min' => $produit->qte_min,
                        'lu' => false,
                    ]);

                    $produit->alerte_stock_active = true;
                    $produit->save();
                } elseif (
                    !$stockFaible && $produit->alerte_stock_active
                ) {
                    $produit->alerte_stock_active = false;
                    $produit->save();
                }
            }
        });

        $notifications = NotificationStock::with([
            'produit:id_prd,nom_prd,ref_prd',
        ])
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'non_lues' => NotificationStock::where('lu', false)->count(),
        ]);
    }

    /**
     * Marquer une notification comme lue.
     */
    public function marquerCommeLue(int $id): JsonResponse
    {
        $notification = NotificationStock::findOrFail($id);

        if (!$notification->lu) {
            $notification->lu = true;
            $notification->date_lecture = now();
            $notification->save();
        }

        return response()->json([
            'message' => 'Notification marquée comme lue.',
            'non_lues' => NotificationStock::where('lu', false)->count(),
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues.
     */
    public function toutMarquerCommeLu(): JsonResponse
    {
        NotificationStock::where('lu', false)->update([
            'lu' => true,
            'date_lecture' => now(),
        ]);

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues.',
            'non_lues' => 0,
        ]);
    }
}
