<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\MouvementStock;
use App\Models\Production;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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


        // Période des 12 derniers mois, mois courant inclus
        $debutPeriode = Carbon::now()
            ->startOfMonth()
            ->subMonths(11);

        $finPeriode = Carbon::now();

        // Générer les 12 mois, même s'il n'y a aucune activité
        $moisListe = [];
        $curseur = $debutPeriode->copy();

        for ($i = 0; $i < 12; $i++) {
            $moisListe[] = [
                'cle' => $curseur->format('Y-m'),
                'mois' => $curseur->format('m/Y'),
                'achats' => 0,
                'entrees' => 0,
                'sorties' => 0,
            ];

            $curseur->addMonth();
        }

        // Achats mensuels en DH
        $achatsParMois = Achat::query()
            ->whereBetween('date_achat', [
                $debutPeriode->toDateString(),
                $finPeriode->toDateString(),
            ])
            ->selectRaw(
                "DATE_FORMAT(date_achat, '%Y-%m') as mois, COALESCE(SUM(total_ttc), 0) as total"
            )
            ->groupBy('mois')
            ->pluck('total', 'mois');

        // Quantités entrées et sorties par mois
        $mouvementsParMois = MouvementStock::query()
            ->whereBetween('date_mouvement', [
                $debutPeriode->toDateTimeString(),
                $finPeriode->toDateTimeString(),
            ])
            ->whereIn('type', ['entree', 'sortie'])
            ->selectRaw(
                "DATE_FORMAT(date_mouvement, '%Y-%m') as mois, type, COALESCE(SUM(qte), 0) as total"
            )
            ->groupBy('mois', 'type')
            ->get();

        // Produits les plus consommés : sorties sur la période
        $produitsConsommes = MouvementStock::query()
            ->join(
                'produits',
                'mouvements_stock.produit_id',
                '=',
                'produits.id_prd'
            )
            ->where('mouvements_stock.type', 'sortie')
            ->whereBetween('mouvements_stock.date_mouvement', [
                $debutPeriode->toDateTimeString(),
                $finPeriode->toDateTimeString(),
            ])
            ->selectRaw(
                'produits.id_prd, produits.nom_prd, SUM(mouvements_stock.qte) as quantite'
            )
            ->groupBy('produits.id_prd', 'produits.nom_prd')
            ->orderByDesc('quantite')
            ->limit(5)
            ->get();

        // Préparer les données pour React
        foreach ($moisListe as &$ligne) {
            $ligne['achats'] = (float) ($achatsParMois[$ligne['cle']] ?? 0);

            foreach ($mouvementsParMois as $mouvement) {
                if ($mouvement->mois === $ligne['cle']) {
                    if ($mouvement->type === 'entree') {
                        $ligne['entrees'] = (float) $mouvement->total;
                    } elseif ($mouvement->type === 'sortie') {
                        $ligne['sorties'] = (float) $mouvement->total;
                    }
                }
            }

            unset($ligne['cle']);
        }
        unset($ligne);


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
            'graphiques' => [
                'activite_mensuelle' => $moisListe,
                'produits_consommes' => $produitsConsommes,
            ],
        ]);
    }
}

