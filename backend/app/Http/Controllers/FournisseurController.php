<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FournisseurController extends Controller
{
    // Afficher tous les fournisseurs
    public function index(Request $request)
        {
            $query = Fournisseur::withCount('achats');

            // Recherche par numéro de téléphone
            if ($request->filled('telephone')) {
                $query->where(
                    'tel',
                    'LIKE',
                    '%' . $request->telephone . '%'
                );
            }

            // Recherche par nom : recherche partielle
            if ($request->filled('nom')) {
                $query->where(
                    'nom_frn',
                    'LIKE',
                    '%' . $request->nom . '%'
                );
            }

            return response()->json(
                $query->orderByDesc('id_frn')
                    ->paginate(5)
                    ->withQueryString()
            );
        }

    // Ajouter un fournisseur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_frn' => ['required', 'string', 'max:150'],
            'tel' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'adr' => ['nullable', 'string'],
            'ville' => ['nullable', 'string', 'max:100'],
            'ice' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string'],
            'actif' => ['sometimes', 'boolean'],
        ]);

        $fournisseur = Fournisseur::create($validated);

        return response()->json([
            'message' => 'Fournisseur ajouté avec succès.',
            'data' => $fournisseur,
        ], 201);
    }

    // Afficher un fournisseur
    public function show(Fournisseur $fournisseur)
    {
        return response()->json(
            $fournisseur->loadCount('achats')
        );
    }

    // Modifier un fournisseur
    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'nom_frn' => ['required', 'string', 'max:150'],
            'tel' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'adr' => ['nullable', 'string'],
            'ville' => ['nullable', 'string', 'max:100'],
            'ice' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string'],
            'actif' => ['required', 'boolean'],
        ]);

        $fournisseur->update($validated);

        return response()->json([
            'message' => 'Fournisseur modifié avec succès.',
            'data' => $fournisseur->fresh(),
        ]);
    }

    // Supprimer un fournisseur
    public function destroy(Fournisseur $fournisseur)
    {
        if ($fournisseur->achats()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce fournisseur car il possède déjà des achats. Désactivez-le plutôt.',
            ], 409);
        }

        $fournisseur->delete();

        return response()->json([
            'message' => 'Fournisseur supprimé avec succès.',
        ]);
    }
}
