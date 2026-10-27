{{-- هاد الملف مسؤول على تقرير المخزون الكامل. --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 25px; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #263238;
        }

        h1 {
            color: #263b59;
            text-align: center;
            font-size: 20px;
            margin-bottom: 5px;
        }

        .date {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
        }

        .summary {
            margin-bottom: 15px;
            padding: 10px;
            background: #f1f5f9;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #d5dce5;
            padding: 7px 5px;
            text-align: left;
        }

        th {
            background: #263b59;
            color: white;
        }

        tr:nth-child(even) {
            background: #f8fafc;
        }

        .number { text-align: right; }
        .footer {
            margin-top: 15px;
            text-align: right;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Rapport complet du stock</h1>

    <div class="date">
        Date du rapport :
        {{ $dateRapport->format('d/m/Y H:i') }}
    </div>

    <div class="summary">
        Nombre de produits : {{ $produits->count() }}
        &nbsp; | &nbsp;
        Valeur totale du stock :
        {{ number_format($valeurTotale, 2, ',', ' ') }} DH
    </div>

    <table>
        <thead>
            <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Unité</th>
                <th>Stock actuel</th>
                <th>Stock minimum</th>
                <th>Prix d'achat (DH)</th>
                <th>Valeur du stock (DH)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($produits as $produit)
                <tr>
                    <td>{{ $produit->ref_prd }}</td>
                    <td>{{ $produit->nom_prd }}</td>
                    <td>{{ $produit->categorie?->nom_cat ?? '—' }}</td>
                    <td>
                        {{ $produit->type === 'matiere_premiere'
                            ? 'Matière première'
                            : 'Produit fini' }}
                    </td>
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
                    <td class="number">
                        {{ number_format((float) $produit->prix_achat, 2, ',', ' ') }}
                    </td>
                    <td class="number">
                        {{ number_format(
                            (float) $produit->qte_stock
                            * (float) $produit->prix_achat,
                            2, ',', ' '
                        ) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9">Aucun produit enregistré.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Rapport généré le {{ $dateRapport->format('d/m/Y à H:i') }}
    </div>
</body>
</html>
