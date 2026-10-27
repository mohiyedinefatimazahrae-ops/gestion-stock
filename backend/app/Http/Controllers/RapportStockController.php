<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Barryvdh\DomPDF\Facade\Pdf;

class RapportStockController extends Controller
{
    // Rapport complet du stock
    public function stock()
    {
        $produits = Produit::with(['categorie', 'unite'])
            ->orderBy('nom_prd')
            ->get();

        $valeurTotale = $produits->sum(
            fn ($produit) =>
                (float) $produit->qte_stock
                * (float) $produit->prix_achat
        );

        $pdf = Pdf::loadView('pdf.stock', [
            'produits' => $produits,
            'valeurTotale' => $valeurTotale,
            'dateRapport' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('rapport-stock.pdf');
    }

    // Rapport des produits à acheter
    public function produitsAAcheter()
    {
        $produits = Produit::with(['categorie', 'unite'])
            ->where('actif', true)
            ->whereColumn('qte_stock', '<=', 'qte_min')
            ->orderBy('qte_stock')
            ->get();

        $pdf = Pdf::loadView('pdf.produits-a-acheter', [
            'produits' => $produits,
            'dateRapport' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('produits-a-acheter.pdf');
    }
}

