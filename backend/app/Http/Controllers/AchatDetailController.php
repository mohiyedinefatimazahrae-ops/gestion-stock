<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AchatDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AchatDetailController extends Controller
{
    /**
     * Afficher les lignes d'un achat.
     */
    public function index(int $achatId)
    {
        $achat = Achat::where('id_achat', $achatId)
            ->with('details.produit')
            ->firstOrFail();

        return response()->json($achat->details);
    }

    /**
     * Ajouter un produit à un achat brouillon.
     */
    public function store(Request $request, int $achatId)
    {
        $data = $request->validate([
            'produit_id' => 'required|integer|exists:produits,id_prd',
            'qte' => 'required|numeric|min:0.001',
            'pu' => 'required|numeric|min:0',
            'remise' => 'nullable|numeric|min:0|max:100',
            'tva_pourcentage' => 'nullable|numeric|min:0|max:100',
        ]);

        return DB::transaction(function () use ($data, $achatId) {
            $achat = Achat::where('id_achat', $achatId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->verifierBrouillon($achat);

            $qte = (float) $data['qte'];
            $pu = (float) $data['pu'];
            $remise = (float) ($data['remise'] ?? 0);
            $tva = (float) ($data['tva_pourcentage'] ?? 0);

            // Montant HT après remise en pourcentage.
            $montantBrut = $qte * $pu;
            $montantRemise = $montantBrut * $remise / 100;
            $sousTotal = round($montantBrut - $montantRemise, 2);

            $detail = $achat->details()->create([
                'produit_id' => $data['produit_id'],
                'qte' => $qte,
                'pu' => $pu,
                'remise' => $remise,
                'tva_pourcentage' => $tva,
                'sous_total' => $sousTotal,
            ]);

            $this->recalculerTotaux($achat);

            return response()->json([
                'message' => 'Produit ajouté à l’achat avec succès.',
                'detail' => $detail->load('produit'),
                'achat' => $achat->fresh()->load('details.produit'),
            ], 201);
        });
    }

    /**
     * Modifier une ligne d'achat.
     */
    public function update(
        Request $request,
        int $achatId,
        int $detailId
    ) {
        $data = $request->validate([
            'produit_id' => 'sometimes|required|integer|exists:produits,id_prd',
            'qte' => 'sometimes|required|numeric|min:0.001',
            'pu' => 'sometimes|required|numeric|min:0',
            'remise' => 'sometimes|nullable|numeric|min:0|max:100',
            'tva_pourcentage' => 'sometimes|nullable|numeric|min:0|max:100',
        ]);

        return DB::transaction(function () use (
            $request,
            $data,
            $achatId,
            $detailId
        ) {
            $achat = Achat::where('id_achat', $achatId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->verifierBrouillon($achat);

            $detail = AchatDetail::where('achat_id', $achat->id_achat)
                ->whereKey($detailId)
                ->firstOrFail();

            $qte = (float) ($data['qte'] ?? $detail->qte);
            $pu = (float) ($data['pu'] ?? $detail->pu);
            $remise = (float) (
                $data['remise'] ?? $detail->remise ?? 0
            );
            $tva = (float) (
                $data['tva_pourcentage']
                ?? $detail->tva_pourcentage
                ?? 0
            );

            $montantBrut = $qte * $pu;
            $sousTotal = round(
                $montantBrut * (1 - $remise / 100),
                2
            );

            $detail->update([
                'produit_id' => $data['produit_id']
                    ?? $detail->produit_id,
                'qte' => $qte,
                'pu' => $pu,
                'remise' => $remise,
                'tva_pourcentage' => $tva,
                'sous_total' => $sousTotal,
            ]);

            $this->recalculerTotaux($achat);

            return response()->json([
                'message' => 'Ligne d’achat modifiée avec succès.',
                'detail' => $detail->fresh()->load('produit'),
                'achat' => $achat->fresh()->load('details.produit'),
            ]);
        });
    }

    /**
     * Supprimer une ligne d'achat.
     */
    public function destroy(int $achatId, int $detailId)
    {
        return DB::transaction(function () use ($achatId, $detailId) {
            $achat = Achat::where('id_achat', $achatId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->verifierBrouillon($achat);

            $detail = AchatDetail::where('achat_id', $achat->id_achat)
                ->whereKey($detailId)
                ->firstOrFail();

            $detail->delete();

            $this->recalculerTotaux($achat);

            return response()->json([
                'message' => 'Ligne d’achat supprimée avec succès.',
                'achat' => $achat->fresh()->load('details.produit'),
            ]);
        });
    }

    /**
     * Interdire les modifications après validation.
     */
    private function verifierBrouillon(Achat $achat): void
    {
        if ($achat->statut !== 'brouillon') {
            throw ValidationException::withMessages([
                'statut' => 'Impossible de modifier un achat déjà traité.',
            ]);
        }
    }

    /**
     * Recalculer les totaux de l'achat.
     */
    private function recalculerTotaux(Achat $achat): void
    {
        $details = $achat->details()->get();

        $totalHT = 0;
        $totalTVA = 0;

        foreach ($details as $detail) {
            $sousTotal = (float) $detail->sous_total;
            $tauxTVA = (float) $detail->tva_pourcentage;

            $totalHT += $sousTotal;
            $totalTVA += round($sousTotal * $tauxTVA / 100, 2);
        }

        $totalHT = round($totalHT, 2);
        $totalTVA = round($totalTVA, 2);

        $achat->update([
            'total_ht' => $totalHT,
            'tva' => $totalTVA,
            'total_ttc' => round($totalHT + $totalTVA, 2),
        ]);
    }
}
