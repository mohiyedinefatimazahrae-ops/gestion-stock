<?php

namespace App\Http\Controllers;

use App\Models\MouvementStock;
use Illuminate\Http\Request;
use App\Models\Produit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MouvementStockController extends Controller
{
    public function index(Request $request)
    {
        $query = MouvementStock::with([
            'produit',
            'achat',
            'production',
        ]);
    
        // Filtrer par produit
        if ($request->filled('produit_id')) {
            $query->where('produit_id', $request->produit_id);
        }
    
        // Filtrer par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
    
        // Date de début
        if ($request->filled('date_debut')) {
            $query->whereDate(
                'date_mouvement',
                '>=',
                $request->date_debut
            );
        }
    
        // Date de fin
        if ($request->filled('date_fin')) {
            $query->whereDate(
                'date_mouvement',
                '<=',
                $request->date_fin
            );
        }
    
        // Pagination : 10 mouvements par page
        $mouvements = $query
            ->orderByDesc('date_mouvement')
            ->orderByDesc('id_mouvement')
            ->paginate(10)
            ->withQueryString();
    
        return response()->json($mouvements);
    }

    public function show(int $id)
    {
        $mouvement = MouvementStock::with([
            'produit',
            'achat',
            'production',
        ])->findOrFail($id);

        return response()->json($mouvement);
    }

    public function ajusterStock(Request $request)
    {
        $validated = $request->validate([
            'produit_id' => 'required|integer|exists:produits,id_prd',
            'qte_stock' => 'required|numeric|min:0',
            'motif' => 'required|string|max:150',
        ]);

        $mouvement = DB::transaction(function () use ($validated) {
            $produit = Produit::where(
                'id_prd',
                $validated['produit_id']
            )->lockForUpdate()->firstOrFail();

            $qteAvant = (float) $produit->qte_stock;
            $qteApres = (float) $validated['qte_stock'];

            if (abs($qteAvant - $qteApres) < 0.0005) {
                throw ValidationException::withMessages([
                    'qte_stock' => [
                        'La nouvelle quantité est identique au stock actuel.',
                    ],
                ]);
            }

            // Calcul de la différence : positive ou négative
            $difference = round($qteApres - $qteAvant, 3);

            // Mise à jour du stock réel
            $produit->qte_stock = $qteApres;
            $produit->save();

            // Enregistrement de l'historique
            return MouvementStock::create([
                'produit_id' => $produit->id_prd,
                'achat_id' => null,
                'production_id' => null,
                'type' => 'ajustement',
                'qte' => $difference,
                'qte_avant' => $qteAvant,
                'qte_apres' => $qteApres,
                'pu' => $produit->prix_achat,
                'motif' => $validated['motif'],
                'date_mouvement' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Stock ajusté avec succès.',
            'mouvement' => $mouvement->load('produit'),
        ], 201);
    }
}



