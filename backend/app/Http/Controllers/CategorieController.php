<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategorieController extends Controller
{
    // 1. Afficher toutes les catégories
    public function index()
    {
        $categories = Categorie::orderBy('id_cat', 'desc')
            ->get();

        return response()->json($categories);
    }

    // 2. Ajouter une catégorie
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_cat' => 'required|string|max:255',
            'desc_cat' => 'nullable|string',
        ]);

        $categorie = Categorie::create($validated);

        return response()->json([
            'message' => 'Catégorie ajoutée avec succès.',
            'categorie' => $categorie,
        ], 201);
    }

    // 3. Afficher une seule catégorie
    public function show(int $id)
    {
        $categorie = Categorie::findOrFail($id);

        return response()->json($categorie);
    }

    // 4. Modifier une catégorie
    public function update(Request $request, int $id)
    {
        $categorie = Categorie::findOrFail($id);

        $validated = $request->validate([
            'nom_cat' => 'required|string|max:255',
            'desc_cat' => 'nullable|string',
        ]);

        $categorie->update($validated);

        return response()->json([
            'message' => 'Catégorie modifiée avec succès.',
            'categorie' => $categorie,
        ]);
    }

    // 5. Supprimer une catégorie
    public function destroy(int $id)
    {
        $categorie = Categorie::findOrFail($id);

        if ($categorie->produits()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des produits.',
            ], 409);
        }

        $categorie->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès.',
        ]);
    }
}
