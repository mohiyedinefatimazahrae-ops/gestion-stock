<?php

namespace App\Http\Controllers;

use App\Models\Unite;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UniteController extends Controller
{
    // Afficher toutes les unités
    public function index()
    {
        return response()->json(
            Unite::withCount('produits')
                ->orderBy('nom_unt')
                ->get()
        );
    }

    // Ajouter une unité
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_unt' => 'required|string|max:50|unique:unites,nom_unt',
            'symbole' => 'nullable|string|max:15',
        ]);

        $unite = Unite::create($validated);

        return response()->json([
            'message' => 'Unité ajoutée avec succès.',
            'unite' => $unite,
        ], 201);
    }

    // Afficher une unité
    public function show(Unite $unite)
    {
        return response()->json($unite);
    }

    // Modifier une unité
    public function update(Request $request, Unite $unite)
    {
        $validated = $request->validate([
            'nom_unt' => [
                'required',
                'string',
                'max:50',
                Rule::unique('unites', 'nom_unt')
                    ->ignore($unite->id_unt, 'id_unt'),
            ],
            'symbole' => 'nullable|string|max:15',
        ]);

        $unite->update($validated);

        return response()->json([
            'message' => 'Unité modifiée avec succès.',
            'unite' => $unite,
        ]);
    }

    // Supprimer une unité
    public function destroy(Unite $unite)
    {
        if ($unite->produits()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette unité, car elle est utilisée par un ou plusieurs produits.',
            ], 409);
        }

        $unite->delete();

        return response()->json([
            'message' => 'Unité supprimée avec succès.',
        ]);
    }
}
