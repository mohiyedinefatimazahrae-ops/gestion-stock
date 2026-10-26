<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\MouvementStock;
use App\Models\Production;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $valeurStock = Produit::query()
            ->selectRaw(
                'COALESCE(SUM(qte_stock * prix_achat), 0) as valeur'
            )
            ->value('valeur');

        $stats = [
            'total_produits' => Produit::count(),

            'valeur_stock' => (float) $valeurStock,

            'stock_faible' => Produit::where('actif', true)
                ->whereColumn('qte_stock', '<=', 'qte_min')
                ->count(),

            'productions_en_cours' => Production::where(
                'statut',
                'en_cours'
            )->count(),
        ];

        $alertesStock = Produit::with('unite')
            ->where('actif', true)
            ->whereColumn('qte_stock', '<=', 'qte_min')
            ->orderBy('qte_stock')
            ->limit(6)
            ->get([
                'id_prd',
                'ref_prd',
                'nom_prd',
                'qte_stock',
                'qte_min',
                'unite_id',
            ]);

        $mouvementsRecents = MouvementStock::with([
            'produit:id_prd,ref_prd,nom_prd',
            'achat:id_achat,num_achat',
            'production:id_production,ref_production',
        ])
            ->orderByDesc('date_mouvement')
            ->limit(7)
            ->get();

        $productionsRecentes = Production::with([
            'produitFini:id_prd,nom_prd',
        ])
            ->whereIn('statut', ['en_attente', 'en_cours'])
            ->orderByDesc('date_commande')
            ->limit(5)
            ->get([
                'id_production',
                'ref_production',
                'client_nom',
                'statut',
                'date_commande',
                'date_livraison',
                'produit_fini_id',
                'qte_produite',
            ]);

        $achatsRecents = Achat::with([
            'fournisseur:id_frn,nom_frn',
        ])
            ->orderByDesc('date_achat')
            ->limit(5)
            ->get([
                'id_achat',
                'num_achat',
                'fournisseur_id',
                'date_achat',
                'total_ttc',
                'statut',
            ]);

        $mouvementsParType = MouvementStock::query()
            ->select('type', DB::raw('COUNT(*) as total'))
            ->groupBy('type')
            ->pluck('total', 'type');

        return response()->json([
            'stats' => $stats,
            'alertes_stock' => $alertesStock,
            'mouvements_recents' => $mouvementsRecents,
            'productions_recentes' => $productionsRecentes,
            'achats_recents' => $achatsRecents,
            'mouvements_par_type' => [
                'entree' => (int) ($mouvementsParType['entree'] ?? 0),
                'sortie' => (int) ($mouvementsParType['sortie'] ?? 0),
                'ajustement' => (int) ($mouvementsParType['ajustement'] ?? 0),
            ],
        ]);
    }
}

