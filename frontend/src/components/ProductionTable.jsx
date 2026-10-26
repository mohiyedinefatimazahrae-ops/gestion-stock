const statusLabels = {
    en_attente: "En attente",
    en_cours: "En cours",
    terminee: "Terminée",
    livree: "Livrée",
    annulee: "Annulée",
};

export default function ProductionTable({
    productions = [],
    onDetails,
    onEdit,
    onDelete,
    onStart,
    onFinish,
    onDeliver,
}) {
    if (!productions.length) {
        return (
            <div className="production-empty">
                <h3>Aucune production</h3>
                <p>Crée une nouvelle commande pour commencer.</p>
            </div>
        );
    }

    return (
        <div className="production-table-wrapper">
            <table className="production-table">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Client</th>
                        <th>Produit fini</th>
                        <th>Quantité</th>
                        <th>Date commande</th>
                        <th>Prix total</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {productions.map((production) => (
                        <tr key={production.id_production}>
                            <td>{production.ref_production}</td>
                            <td>
                                <strong>{production.client_nom}</strong>
                                <small className="production-cell-subtitle">
                                    {production.client_tel || "Sans téléphone"}
                                </small>
                            </td>
                            <td>
                                {production.produit_fini?.nom_prd || "—"}
                            </td>
                            <td>{production.qte_produite}</td>
                            <td>{production.date_commande?.slice(0, 10)}</td>
                            <td>
                                {Number(production.prix_total).toFixed(2)} DH
                            </td>
                            <td>
                                <span
                                    className={`production-status status-${production.statut}`}
                                >
                                    {statusLabels[production.statut] || production.statut}
                                </span>
                            </td>
                            <td>
                                <div className="production-actions">
                                    <button
                                        type="button"
                                        className="production-btn production-btn-info"
                                        onClick={() => onDetails(production)}
                                    >
                                        Détails
                                    </button>

                                    {production.statut === "en_attente" && (
                                        <>
                                            <button
                                                type="button"
                                                className="production-btn production-btn-secondary"
                                                onClick={() => onEdit(production)}
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                type="button"
                                                className="production-btn production-btn-danger"
                                                onClick={() => onDelete(production)}
                                            >
                                                Supprimer
                                            </button>

                                            <button
                                                type="button"
                                                className="production-btn production-btn-primary"
                                                onClick={() => onStart(production)}
                                            >
                                                Démarrer
                                            </button>
                                        </>
                                    )}

                                    {production.statut === "en_cours" && (
                                        <button
                                            type="button"
                                            className="production-btn production-btn-success"
                                            onClick={() => onFinish(production)}
                                        >
                                            Terminer
                                        </button>
                                    )}

                                    {production.statut === "terminee" && (
                                        <button
                                            type="button"
                                            className="production-btn production-btn-primary"
                                            onClick={() => onDeliver(production)}
                                        >
                                            Livrer
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
