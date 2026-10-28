<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\ProductionMatiere;
use App\Models\Produit;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductionController extends Controller
{
    // 1. Afficher toutes les productions
    public function index()
    {
        return response()->json(
            Production::with([
                'produitFini',
                'matieres.produit',
            ])->orderByDesc('id_production')->get()
        );
    }

    // 2. Afficher une production
    public function show(int $id)
    {
        $production = Production::with([
            'produitFini',
            'matieres.produit',
            'mouvementsStock.produit',
        ])->findOrFail($id);

        return response()->json($production);
    }

    // 3. Créer une production
    public function store(Request $request)
    {
        $data = $request->validate([
            'ref_production' => 'required|string|max:50|unique:productions,ref_production',
            'client_nom' => 'required|string|max:150',
            'client_tel' => 'nullable|string|max:30',
            'details_commande' => 'nullable|string',
            'date_commande' => 'required|date',
            'date_livraison' => 'nullable|date|after_or_equal:date_commande',
            'prix_total' => 'required|numeric|min:0',
            'prix_avance' => 'required|numeric|min:0|lte:prix_total',
            'notes' => 'nullable|string',
            'produit_fini_id' => 'required|exists:produits,id_prd',
            'qte_produite' => 'required|numeric|gt:0',
        ]);

        $produitFini = Produit::findOrFail($data['produit_fini_id']);

        if ($produitFini->type !== 'produit_fini') {
            throw ValidationException::withMessages([
                'produit_fini_id' => 'Choisis un produit de type produit fini.',
            ]);
        }

        $data['prix_reste'] =
            (float) $data['prix_total'] - (float) $data['prix_avance'];

        $data['statut'] = 'en_attente';

        $production = Production::create($data);

        return response()->json(
            $production->load('produitFini'),
            201
        );
    }

    // 4. Modifier une production en attente
    public function update(Request $request, int $id)
    {
        $production = Production::findOrFail($id);

        if ($production->statut !== 'en_attente') {
            throw ValidationException::withMessages([
                'statut' => 'Seules les productions en attente sont modifiables.',
            ]);
        }

        $data = $request->validate([
            'ref_production' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('productions', 'ref_production')
                    ->ignore($production->id_production, 'id_production'),
            ],
            'client_nom' => 'sometimes|required|string|max:150',
            'client_tel' => 'nullable|string|max:30',
            'details_commande' => 'nullable|string',
            'date_commande' => 'sometimes|required|date',
            'date_livraison' => 'nullable|date|after_or_equal:date_commande',
            'prix_total' => 'sometimes|required|numeric|min:0',
            'prix_avance' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
            'produit_fini_id' => 'sometimes|required|exists:produits,id_prd',
            'qte_produite' => 'sometimes|required|numeric|gt:0',
        ]);

        $total = (float) ($data['prix_total'] ?? $production->prix_total);
        $avance = (float) ($data['prix_avance'] ?? $production->prix_avance);

        if ($avance > $total) {
            throw ValidationException::withMessages([
                'prix_avance' => 'L’avance ne peut pas dépasser le prix total.',
            ]);
        }

        if (isset($data['produit_fini_id'])) {
            $produitFini = Produit::findOrFail($data['produit_fini_id']);

            if ($produitFini->type !== 'produit_fini') {
                throw ValidationException::withMessages([
                    'produit_fini_id' => 'Choisis un produit de type produit fini.',
                ]);
            }
        }

        $data['prix_reste'] = $total - $avance;

        $production->update($data);

        return response()->json(
            $production->fresh()->load('produitFini')
        );
    }

    // 5. Supprimer une production qui n'a pas commencé
    public function destroy(int $id)
    {
        return DB::transaction(function () use ($id) {
            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => 'Impossible de supprimer une production déjà démarrée.',
                ]);
            }

            $production->matieres()->delete();
            $production->delete();

            return response()->json([
                'message' => 'Production supprimée avec succès.',
            ]);
        });
    }

    // 6. Afficher les matières d'une production
    public function matieres(int $id)
    {
        $production = Production::findOrFail($id);

        return response()->json(
            $production->matieres()->with('produit')->get()
        );
    }

    // 7. Ajouter une matière première
    public function ajouterMatiere(Request $request, int $id)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produits,id_prd',
            'qte' => 'required|numeric|gt:0',
        ]);

        return DB::transaction(function () use ($id, $data) {
            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => 'Les matières ne peuvent être modifiées qu’en attente.',
                ]);
            }

            $produit = Produit::findOrFail($data['produit_id']);

            if ($produit->type !== 'matiere_premiere') {
                throw ValidationException::withMessages([
                    'produit_id' => 'Choisis une matière première.',
                ]);
            }

            $matiere = ProductionMatiere::firstOrNew([
                'production_id' => $production->id_production,
                'produit_id' => $produit->id_prd,
            ]);

            $matiere->qte =
                (float) $matiere->qte + (float) $data['qte'];

            $matiere->save();

            return response()->json(
                $matiere->fresh()->load('produit'),
                201
            );
        });
    }

    // 8. Modifier la quantité d'une matière
    public function modifierMatiere(
        Request $request,
        int $id,
        int $matiereId
    ) {
        $data = $request->validate([
            'qte' => 'required|numeric|gt:0',
        ]);

        return DB::transaction(function () use ($id, $matiereId, $data) {
            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => 'Les matières ne peuvent être modifiées qu’en attente.',
                ]);
            }

            $matiere = ProductionMatiere::where(
                'production_id',
                $production->id_production
            )->findOrFail($matiereId);

            $matiere->qte = $data['qte'];
            $matiere->save();

            return response()->json(
                $matiere->fresh()->load('produit')
            );
        });
    }

    // 9. Supprimer une matière
    public function supprimerMatiere(int $id, int $matiereId)
    {
        return DB::transaction(function () use ($id, $matiereId) {
            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => 'Les matières ne peuvent être supprimées qu’en attente.',
                ]);
            }

            $matiere = ProductionMatiere::where(
                'production_id',
                $production->id_production
            )->findOrFail($matiereId);

            $matiere->delete();

            return response()->json([
                'message' => 'Matière supprimée avec succès.',
            ]);
        });
    }

    // 10. Démarrer : déduire les matières du stock
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

            $matieres = $production->matieres()->get();

            if ($matieres->isEmpty()) {
                throw ValidationException::withMessages([
                    'matieres' => 'Ajoute les matières nécessaires avant de démarrer.',
                ]);
            }

            // Vérifier toutes les quantités avant de modifier le stock
            foreach ($matieres as $matiere) {
                $produit = Produit::where(
                    'id_prd',
                    $matiere->produit_id
                )->lockForUpdate()->firstOrFail();

                if ($produit->type !== 'matiere_premiere') {
                    throw ValidationException::withMessages([
                        'matieres' => 'Une matière sélectionnée n’est pas une matière première.',
                    ]);
                }

                if ((float) $produit->qte_stock < (float) $matiere->qte) {
                    throw ValidationException::withMessages([
                        'stock' => 'Stock insuffisant pour : ' . $produit->nom_prd,
                    ]);
                }
            }

            // Déduire les matières et enregistrer les mouvements
            foreach ($matieres as $matiere) {
                $produit = Produit::where(
                    'id_prd',
                    $matiere->produit_id
                )->lockForUpdate()->firstOrFail();

                $avant = (float) $produit->qte_stock;
                $qte = (float) $matiere->qte;
                $apres = $avant - $qte;

                $produit->qte_stock = $apres;
                $produit->save();

                MouvementStock::create([
                    'produit_id' => $produit->id_prd,
                    'production_id' => $production->id_production,
                    'type' => 'sortie',
                    'qte' => $qte,
                    'qte_avant' => $avant,
                    'qte_apres' => $apres,
                    'pu' => $produit->prix_achat,
                    'motif' => 'Démarrage production ' . $production->ref_production,
                    'date_mouvement' => now(),
                ]);
            }

            $production->statut = 'en_cours';
            $production->save();

            return response()->json([
                'message' => 'Production démarrée et matières déduites du stock.',
                'production' => $production->fresh()->load([
                    'produitFini',
                    'matieres.produit',
                    'mouvementsStock.produit',
                ]),
            ]);
        });
    }

    // 11. Terminer : ajouter le produit fini au stock
    public function terminerProduction(int $id)
    {
        return DB::transaction(function () use ($id) {
            $production = Production::where(
                'id_production',
                $id
            )->lockForUpdate()->firstOrFail();

            if ($production->statut !== 'en_cours') {
                throw ValidationException::withMessages([
                    'statut' => 'Seule une production en cours peut être terminée.',
                ]);
            }

            if (!$production->produit_fini_id ||
                (float) $production->qte_produite <= 0) {
                throw ValidationException::withMessages([
                    'produit_fini_id' => 'Le produit fini et sa quantité sont obligatoires.',
                ]);
            }

            $produit = Produit::where(
                'id_prd',
                $production->produit_fini_id
            )->lockForUpdate()->firstOrFail();

            if ($produit->type !== 'produit_fini') {
                throw ValidationException::withMessages([
                    'produit_fini_id' => 'Le produit choisi doit être un produit fini.',
                ]);
            }

            $qte = (float) $production->qte_produite;
            $avant = (float) $produit->qte_stock;
            $apres = $avant + $qte;

            $produit->qte_stock = $apres;
            $produit->save();

            MouvementStock::create([
                'produit_id' => $produit->id_prd,
                'production_id' => $production->id_production,
                'type' => 'entree',
                'qte' => $qte,
                'qte_avant' => $avant,
                'qte_apres' => $apres,
                'pu' => $produit->prix_achat,
                'motif' => 'Fin production ' . $production->ref_production,
                'date_mouvement' => now(),
            ]);

            $production->statut = 'terminee';
            $production->save();

            return response()->json([
                'message' => 'Production terminée et stock du produit fini mis à jour.',
                'production' => $production->fresh()->load([
                    'produitFini',
                    'matieres.produit',
                    'mouvementsStock.produit',
                ]),
            ]);
        });
    }


    // 12. Livrer une production terminée
    public function livrerProduction(int $id)
        {
            return DB::transaction(function () use ($id) {
                $production = Production::where(
                    'id_production',
                    $id
                )->lockForUpdate()->firstOrFail();

                if ($production->statut !== 'terminee') {
                    throw ValidationException::withMessages([
                        'statut' => 'Termine la production avant de la livrer.',
                    ]);
                }

                $production->statut = 'livree';
                $production->save();

                return response()->json([
                    'message' => 'Production marquée comme livrée.',
                    'production' => $production->fresh()->load('produitFini'),
                ]);
            });
        }
}
