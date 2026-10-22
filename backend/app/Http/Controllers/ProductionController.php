<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\MouvementStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionController extends Controller
{
    public function demarrerProduction(int $id)
    {
        return DB::transaction(function () use ($id) {

            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => 'Cette production a déjà été démarrée ou traitée.',
                ]);
            }

            $matieres = $production->matieres;

            if ($matieres->isEmpty()) {
                throw ValidationException::withMessages([
                    'matieres' => 'Ajoute les matières nécessaires avant de démarrer.',
                ]);
            }

            // Vérifier toutes les quantités avant de modifier le stock
            foreach ($matieres as $matiere) {
                $produit = $matiere->produit()
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((float) $produit->qte_stock < (float) $matiere->qte) {
                    throw ValidationException::withMessages([
                        'stock' => 'Stock insuffisant pour : '
                            . $produit->nom_prd,
                    ]);
                }
            }

            // Déduire les matières et enregistrer les mouvements
            foreach ($matieres as $matiere) {
                $produit = $matiere->produit()
                    ->lockForUpdate()
                    ->firstOrFail();

                $qteAvant = (float) $produit->qte_stock;
                $qte = (float) $matiere->qte;
                $qteApres = $qteAvant - $qte;

                $produit->qte_stock = $qteApres;
                $produit->save();

                MouvementStock::create([
                    'produit_id' => $produit->id_prd,
                    'production_id' => $production->id_production,
                    'type' => 'sortie',
                    'qte' => $qte,
                    'qte_avant' => $qteAvant,
                    'qte_apres' => $qteApres,
                    'pu' => $produit->prix_achat,
                    'motif' => 'Démarrage production '
                        . $production->ref_production,
                    'date_mouvement' => now(),
                ]);
            }

            $production->statut = 'en_cours';
            $production->save();

            return response()->json([
                'message' => 'Production démarrée et stock mis à jour.',
                'production' => $production->load('matieres.produit'),
            ]);
        });
    }
}

