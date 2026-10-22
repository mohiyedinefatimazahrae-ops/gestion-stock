<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AchatController extends Controller
{
    // Afficher tous les achats
    public function index()
    {
        return response()->json(
            Achat::with('fournisseur')
                ->withCount('details')
                ->orderByDesc('id_achat')
                ->get()
        );
    }

    // Afficher un achat avec ses détails
    public function show(int $id)
    {
        $achat = Achat::with([
            'fournisseur',
            'details.produit',
        ])->findOrFail($id);

        return response()->json($achat);
    }

    // Créer un achat en brouillon
    public function store(Request $request)
    {
        $validated = $request->validate([
            'num_achat' => [
                'required',
                'string',
                'max:50',
                'unique:achats,num_achat',
            ],
            'fournisseur_id' => [
                'required',
                'integer',
                'exists:fournisseurs,id_frn',
            ],
            'date_achat' => ['required', 'date'],
            'numero_facture' => ['nullable', 'string', 'max:100'],
            'img_facture' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
            'total_ht' => ['sometimes', 'numeric', 'min:0'],
            'tva' => ['sometimes', 'numeric', 'min:0'],
            'total_ttc' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('img_facture')) {
            $validated['img_facture'] = $request
                ->file('img_facture')
                ->store('factures', 'public');
        }

        // Le statut est défini côté serveur
        $validated['statut'] = 'brouillon';

        $achat = Achat::create($validated);

        return response()->json([
            'message' => 'Achat créé avec succès.',
            'data' => $achat->load('fournisseur'),
        ], 201);
    }

    // Modifier un achat en brouillon
    public function update(Request $request, int $id)
    {
        $achat = Achat::where('id_achat', $id)->firstOrFail();

        if ($achat->statut !== 'brouillon') {
            return response()->json([
                'message' => 'Seuls les achats en brouillon peuvent être modifiés.',
            ], 409);
        }

        $validated = $request->validate([
            'num_achat' => [
                'required',
                'string',
                'max:50',
                Rule::unique('achats', 'num_achat')
                    ->ignore($achat->id_achat, 'id_achat'),
            ],
            'fournisseur_id' => [
                'required',
                'integer',
                'exists:fournisseurs,id_frn',
            ],
            'date_achat' => ['required', 'date'],
            'numero_facture' => ['nullable', 'string', 'max:100'],
            'img_facture' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
            'total_ht' => ['sometimes', 'numeric', 'min:0'],
            'tva' => ['sometimes', 'numeric', 'min:0'],
            'total_ttc' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('img_facture')) {
            if ($achat->img_facture) {
                Storage::disk('public')->delete($achat->img_facture);
            }

            $validated['img_facture'] = $request
                ->file('img_facture')
                ->store('factures', 'public');
        } else {
            unset($validated['img_facture']);
        }

        $achat->update($validated);

        return response()->json([
            'message' => 'Achat modifié avec succès.',
            'data' => $achat->fresh()->load('fournisseur'),
        ]);
    }

    // Valider l'achat et mettre à jour le stock
    public function validerAchat(int $id)
    {
        return DB::transaction(function () use ($id) {
            $achat = Achat::where('id_achat', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($achat->statut !== 'brouillon') {
                throw ValidationException::withMessages([
                    'statut' => 'Cet achat a déjà été traité.',
                ]);
            }

            // Charger les détails après verrouillage de l'achat
            $details = $achat->details()->get();

            if ($details->isEmpty()) {
                throw ValidationException::withMessages([
                    'details' => 'Impossible de valider un achat sans produits.',
                ]);
            }

            foreach ($details as $detail) {
                $produit = $detail->produit()
                    ->lockForUpdate()
                    ->firstOrFail();

                $qte = (float) $detail->qte;
                $pu = (float) $detail->pu;

                if ($qte <= 0) {
                    throw ValidationException::withMessages([
                        'details' => 'Chaque quantité achetée doit être supérieure à zéro.',
                    ]);
                }

                $qteAvant = (float) $produit->qte_stock;
                $qteApres = $qteAvant + $qte;

                $produit->qte_stock = $qteApres;
                $produit->save();

                MouvementStock::create([
                    'produit_id' => $produit->id_prd,
                    'achat_id' => $achat->id_achat,
                    'type' => 'entree',
                    'qte' => $qte,
                    'qte_avant' => $qteAvant,
                    'qte_apres' => $qteApres,
                    'pu' => $pu,
                    'motif' => 'Validation achat ' . $achat->num_achat,
                    'date_mouvement' => now(),
                ]);
            }

            $achat->statut = 'valide';
            $achat->save();

            return response()->json([
                'message' => 'Achat validé et stock mis à jour.',
                'achat' => $achat->load([
                    'fournisseur',
                    'details.produit',
                ]),
            ]);
        });
    }

    // Supprimer uniquement les achats sans mouvements de stock
    public function destroy(int $id)
    {
        $achat = Achat::where('id_achat', $id)->firstOrFail();

        if (
            $achat->statut === 'valide'
            || $achat->mouvementsStock()->exists()
        ) {
            return response()->json([
                'message' => 'Impossible de supprimer cet achat car il est validé ou possède des mouvements de stock.',
            ], 409);
        }

        DB::transaction(function () use ($achat) {
            $achat->details()->delete();
            $achat->delete();
        });

        if ($achat->img_facture) {
            Storage::disk('public')->delete($achat->img_facture);
        }

        return response()->json([
            'message' => 'Achat supprimé avec succès.',
        ]);
    }
}
