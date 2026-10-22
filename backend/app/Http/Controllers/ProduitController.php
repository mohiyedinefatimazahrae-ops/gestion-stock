<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    // Afficher tous les produits
    public function index()
    {
        $produits = Produit::with(['categorie', 'unite'])
            ->orderByDesc('id_prd')
            ->get();

        return response()->json($produits);
    }

    // Ajouter un produit

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ref_prd' => 'required|string|max:50|unique:produits,ref_prd',
            'nom_prd' => 'required|string|max:150',
            'desc_prd' => 'nullable|string',

            'img_prd' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'categorie_id' => 'required|exists:categories,id_cat',
            'unite_id' => 'required|exists:unites,id_unt',
            'type' => 'required|in:matiere_premiere,produit_fini',
            'marque' => 'nullable|string|max:100',
            'code_barres' => 'nullable|string|max:100',
            'qte_stock' => 'required|numeric|min:0',
            'qte_min' => 'required|numeric|min:0',
            'prix_achat' => 'required|numeric|min:0',
            'date_peremption' => 'nullable|date',
            'actif' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('img_prd')) {
            $validated['img_prd'] = $request
                ->file('img_prd')
                ->store('produits', 'public');
        }

        $produit = Produit::create($validated);

        return response()->json([
            'message' => 'Produit ajouté avec succès.',
            'produit' => $produit->load(['categorie', 'unite']),
        ], 201);
    }


    // Afficher un produit précis
    public function show(Produit $produit)
    {
        return response()->json(
            $produit->load(['categorie', 'unite'])
        );
    }

    // Modifier un produit

    public function update(Request $request, Produit $produit)
    {
        $validated = $request->validate([
            'ref_prd' => [
                'required',
                'string',
                'max:50',
                Rule::unique('produits', 'ref_prd')
                    ->ignore($produit->id_prd, 'id_prd'),
            ],

            'nom_prd' => 'required|string|max:150',
            'desc_prd' => 'nullable|string',
            'img_prd' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'categorie_id' => 'required|exists:categories,id_cat',
            'unite_id' => 'required|exists:unites,id_unt',
            'type' => 'required|in:matiere_premiere,produit_fini',
            'marque' => 'nullable|string|max:100',
            'code_barres' => 'nullable|string|max:100',
            'qte_stock' => 'required|numeric|min:0',
            'qte_min' => 'required|numeric|min:0',
            'prix_achat' => 'required|numeric|min:0',
            'date_peremption' => 'nullable|date',
            'actif' => 'required|boolean',
        ]);

        if ($request->hasFile('img_prd')) {
            $ancienneImage = $produit->img_prd;

            $nouvelleImage = $request
                ->file('img_prd')
                ->store('produits', 'public');

            $validated['img_prd'] = $nouvelleImage;

            if ($ancienneImage) {
                Storage::disk('public')->delete($ancienneImage);
            }
        } else {
            unset($validated['img_prd']);
        }

        $produit->update($validated);

        return response()->json([
            'message' => 'Produit modifié avec succès.',
            'produit' => $produit->fresh()->load(['categorie', 'unite']),
        ]);
    }


    // Supprimer un produit
    public function destroy(Produit $produit)
    {
        // Vérifier si le produit est utilisé ailleurs
        if (
            $produit->achatDetails()->exists() ||
            $produit->mouvementsStock()->exists() ||
            $produit->productionMatieres()->exists()
        ) {
            return response()->json([
                'message' => 'Impossible de supprimer ce produit, car il est lié à des achats, mouvements de stock ou productions.',
            ], 409);
        }

        if ($produit->img_prd) {
            Storage::disk('public')->delete($produit->img_prd);
        }

        $produit->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès.',
        ]);
    }
}
