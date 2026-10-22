
const API_BASE = "http://127.0.0.1:8000";

export default function ProduitTable({
    produits,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (produits.length === 0) {
        return (
            <section className="table-card">
                <h2>Liste des produits</h2>
                <p>Aucun produit enregistré.</p>
            </section>
        );
    }

    return (
        <section className="table-card">
            <h2>Liste des produits ({produits.length})</h2>

            <div className="table-responsive">
                <table className="produit-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Référence</th>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Unité</th>
                            <th>Type</th>
                            <th>Stock</th>
                            <th>Prix d'achat</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {produits.map((produit) => (
                            <tr key={produit.id_prd}>
                                <td>
                                    {produit.img_prd ? (
                                        <img
                                            className="produit-thumbnail"
                                            src={`${API_BASE}/storage/${produit.img_prd}`}
                                            alt={produit.nom_prd}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="no-image">—</div>
                                    )}
                                </td>

                                <td>{produit.ref_prd}</td>
                                <td>
                                    <strong>{produit.nom_prd}</strong>
                                    {produit.marque && (
                                        <small className="product-brand">
                                            {produit.marque}
                                        </small>
                                    )}
                                </td>

                                <td>
                                    {produit.categorie?.nom_cat ?? "—"}
                                </td>

                                <td>
                                    {produit.unite?.nom_unt ?? "—"}
                                    {produit.unite?.symbole
                                        ? ` (${produit.unite.symbole})`
                                        : ""}
                                </td>

                                <td>
                                    {produit.type === "matiere_premiere"
                                        ? "Matière première"
                                        : "Produit fini"}
                                </td>

                                <td>
                                    <span
                                        className={
                                            Number(produit.qte_stock) <=
                                            Number(produit.qte_min)
                                                ? "stock-badge stock-low"
                                                : "stock-badge stock-ok"
                                        }
                                    >
                                        {produit.qte_stock}
                                    </span>
                                </td>

                                <td>
                                    {Number(produit.prix_achat).toFixed(2)}
                                </td>

                                <td>
                                    <span
                                        className={
                                            produit.actif
                                                ? "status-badge status-active"
                                                : "status-badge status-inactive"
                                        }
                                    >
                                        {produit.actif ? "Actif" : "Inactif"}
                                    </span>
                                </td>

                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(produit)}
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-danger"
                                            disabled={
                                                deletingId === produit.id_prd
                                            }
                                            onClick={() => onDelete(produit)}
                                        >
                                            {deletingId === produit.id_prd
                                                ? "Suppression..."
                                                : "Supprimer"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
