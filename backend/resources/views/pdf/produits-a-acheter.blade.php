{{-- هاد التقرير غادي يعاونك تعرف المنتجات اللي خاصها إعادة التموين. --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 25px; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #263238;
        }

        h1 {
            color: #a93226;
            text-align: center;
            font-size: 20px;
        }

        .date {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #d5dce5;
            padding: 9px 7px;
            text-align: left;
        }

        th {
            background: #a93226;
            color: white;
        }

        tr:nth-child(even) {
            background: #fff5f4;
        }

        .number { text-align: right; }

        .empty {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>Liste des produits à acheter</h1>

    <div class="date">
        Date du rapport :
        {{ $dateRapport->format('d/m/Y H:i') }}
    </div>

    <p>
        Nombre de produits à réapprovisionner :
        <strong>{{ $produits->count() }}</strong>
    </p>

    <table>
        <thead>
            <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Unité</th>
                <th>Stock actuel</th>
                <th>Stock minimum</th>
                {{-- <th>Quantité à acheter</th> --}}
                <th>Prix unitaire (DH)</th>
                {{-- <th>Coût estimé (DH)</th> --}}
            </tr>
        </thead>
        <tbody>
            @forelse ($produits as $produit)
                @php
                    $quantiteAacheter = max(
                        0,
                        (float) $produit->qte_min
                        - (float) $produit->qte_stock
                    );
                @endphp

                <tr>
                    <td>{{ $produit->ref_prd }}</td>
                    <td>{{ $produit->nom_prd }}</td>
                    <td>{{ $produit->categorie?->nom_cat ?? '—' }}</td>
                    <td>
                        {{ $produit->unite?->symbole
                            ?? $produit->unite?->nom_unt
                            ?? '—' }}
                    </td>
                    <td class="number">
                        {{ number_format((float) $produit->qte_stock, 3, ',', ' ') }}
                    </td>
                    <td class="number">
                        {{ number_format((float) $produit->qte_min, 3, ',', ' ') }}
                    </td>
                    {{-- <td class="number">
                        {{ number_format($quantiteAacheter, 3, ',', ' ') }}
                    </td> --}}
                    <td class="number">
                        {{ number_format((float) $produit->prix_achat, 2, ',', ' ') }}
                    </td>
                    {{-- <td class="number">
                        {{ number_format(
                            $quantiteAacheter * (float) $produit->prix_achat,
                            2, ',', ' '
                        ) }}
                    </td> --}}
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="empty">
                        Aucun produit ne nécessite de réapprovisionnement.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
