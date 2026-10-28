<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AchatDetail;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
// use Illuminate\Support\Facades\Response;
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

    public function telechargerFacture(int $id)
    {
        $achat = Achat::findOrFail($id);

        if (!$achat->img_facture) {
            return response()->json([
                'message' => 'Aucune facture disponible.',
            ], 404);
        }

        $chemin = $achat->img_facture;

        if (!Storage::disk('public')->exists($chemin)) {
            return response()->json([
                'message' => 'Le fichier de facture est introuvable.',
            ], 404);
        }

        $nomFichier = 'facture-achat-' . $achat->id_achat
            . '.' . pathinfo($chemin, PATHINFO_EXTENSION);

        $cheminComplet = Storage::disk('public')->path($chemin);

        return response()->download(
            $cheminComplet,
            $nomFichier
        );
    }

    public function enregistrerComplet(Request $request)
    {
        $validated = $request->validate([
            'id_achat' => ['nullable', 'integer', 'exists:achats,id_achat'],
            'num_achat' => ['required', 'string', 'max:50'],
            'fournisseur_id' => [
                'required',
                'integer',
                'exists:fournisseurs,id_frn',
            ],
            'date_achat' => ['required', 'date'],
            'numero_facture' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'img_facture' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
            'details' => ['required', 'string'],
        ]);

        $details = json_decode($validated['details'], true);

        if (!is_array($details) || empty($details)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'details' => 'Ajoute au moins un produit à cet achat.',
            ]);
        }

        $validator = \Illuminate\Support\Facades\Validator::make(
            ['details' => $details],
            [
                'details' => ['required', 'array', 'min:1'],
                'details.*.id' => ['nullable', 'integer'],
                'details.*.produit_id' => [
                    'required',
                    'integer',
                    'exists:produits,id_prd',
                ],
                'details.*.qte' => ['required', 'numeric', 'min:0.001'],
                'details.*.pu' => ['required', 'numeric', 'min:0'],
                'details.*.remise' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'details.*.tva_pourcentage' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:100',
                ],
            ]
        );

        $validator->validate();

        // منع تكرار نفس المنتج داخل الفورم بنفس ID ديال السطر.
        $ids = collect($details)
            ->pluck('id')
            ->filter(fn ($id) => $id !== null && $id !== '')
            ->map(fn ($id) => (int) $id);

        if ($ids->count() !== $ids->unique()->count()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'details' => 'Un même détail ne peut pas être envoyé plusieurs fois.',
            ]);
        }

        $idAchat = $validated['id_achat'] ?? null;

        // نتحققو من رقم الشراء قبل تخزين الصورة.
        $numExiste = Achat::where('num_achat', $validated['num_achat'])
            ->when($idAchat, fn ($query) =>
                $query->where('id_achat', '<>', $idAchat)
            )
            ->exists();

        if ($numExiste) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'num_achat' => 'Ce numéro d’achat existe déjà.',
            ]);
        }

        $ancienneFacture = null;
        $nouvelleFacture = null;

        if ($request->hasFile('img_facture')) {
            $nouvelleFacture = $request
                ->file('img_facture')
                ->store('factures', 'public');
        }

        try {
            $achat = DB::transaction(function () use (
                $validated,
                $details,
                $idAchat,
                $nouvelleFacture,
                &$ancienneFacture
            ) {
                if ($idAchat) {
                    $achat = Achat::where('id_achat', $idAchat)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($achat->statut !== 'brouillon') {
                        throw ValidationException::withMessages([
                            'statut' => 'Seuls les achats en brouillon peuvent être modifiés.',
                        ]);
                    }
                } else {
                    $achat = new Achat();
                    $achat->statut = 'brouillon';
                }

                $achat->num_achat = $validated['num_achat'];
                $achat->fournisseur_id = $validated['fournisseur_id'];
                $achat->date_achat = $validated['date_achat'];
                $achat->numero_facture = $validated['numero_facture'] ?? null;
                $achat->notes = $validated['notes'] ?? null;

                if ($nouvelleFacture) {
                    $ancienneFacture = $achat->img_facture;
                    $achat->img_facture = $nouvelleFacture;
                }

                $achat->save();

                $idsConserves = [];

                foreach ($details as $ligne) {
                    $detailId = $ligne['id'] ?? null;

                    $valeurs = [
                        'produit_id' => $ligne['produit_id'],
                        'qte' => $ligne['qte'],
                        'pu' => $ligne['pu'],
                        'remise' => $ligne['remise'] ?? 0,
                        'tva_pourcentage' => $ligne['tva_pourcentage'] ?? 0,
                        'sous_total' => round(
                            (float) $ligne['qte']
                            * (float) $ligne['pu']
                            * (1 - (float) ($ligne['remise'] ?? 0) / 100),
                            2
                        ),
                    ];

                    if ($detailId) {
                        $detail = AchatDetail::where('achat_id', $achat->id_achat)
                            ->whereKey($detailId)
                            ->firstOrFail();

                        $detail->update($valeurs);
                    } else {
                        $detail = $achat->details()->create($valeurs);
                    }

                    $idsConserves[] = $detail->getKey();
                }

                // Supprimer les anciennes lignes retirées du formulaire.
                $achat->details()
                    ->whereNotIn('id', $idsConserves)
                    ->delete();

                // Recalculer les totaux à partir des lignes enregistrées.
                $lignesEnregistrees = $achat->details()->get();

                $totalHT = 0;
                $totalTVA = 0;

                foreach ($lignesEnregistrees as $ligne) {
                    $sousTotal = (float) $ligne->sous_total;

                    $totalHT += $sousTotal;
                    $totalTVA += round(
                        $sousTotal * (float) $ligne->tva_pourcentage / 100,
                        2
                    );
                }

                $achat->update([
                    'total_ht' => round($totalHT, 2),
                    'tva' => round($totalTVA, 2),
                    'total_ttc' => round($totalHT + $totalTVA, 2),
                ]);

                return $achat->fresh()->load([
                    'fournisseur',
                    'details.produit',
                ]);
            });
        } catch (\Throwable $e) {
            // Si la transaction échoue, supprimer la nouvelle image ajoutée.
            if ($nouvelleFacture) {
                Storage::disk('public')->delete($nouvelleFacture);
            }

            throw $e;
        }

        // Supprimer l'ancienne facture uniquement après le succès de la transaction.
        if (
            $nouvelleFacture
            && $ancienneFacture
            && $ancienneFacture !== $nouvelleFacture
        ) {
            Storage::disk('public')->delete($ancienneFacture);
        }

        return response()->json([
            'message' => 'Achat et détails enregistrés avec succès.',
            'data' => $achat,
        ], $idAchat ? 200 : 201);
    }
}
