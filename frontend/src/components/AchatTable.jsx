
export default function AchatTable({
    achats = [],
    loading = false,
    onDetails,
    onValider,
    onDelete,
}) {
    const money = (value) =>
        `${Number(value ?? 0).toFixed(2)} DH`;

    function statutLabel(statut) {
        switch (statut) {
            case "brouillon":
                return "Brouillon";
            case "valide":
                return "Validé";
            case "annule":
                return "Annulé";
            default:
                return statut || "Inconnu";
        }
    }

    if (loading) {
        return <p>Chargement des achats...</p>;
    }

    if (achats.length === 0) {
        return <p>Aucun achat enregistré pour le moment.</p>;
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>N° achat</th>
                        <th>Fournisseur</th>
                        <th>Date</th>
                        <th>Facture</th>
                        <th>Total HT</th>
                        <th>TVA</th>
                        <th>Total TTC</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {achats.map((achat) => (
                        <tr key={achat.id_achat}>
                            <td>{achat.num_achat}</td>

                            <td>
                                {achat.fournisseur?.nom_frn || "—"}
                            </td>

                            <td>
                                {String(achat.date_achat || "").slice(0, 10)}
                            </td>

                            <td>
                                {achat.numero_facture || "—"}
                            </td>

                            <td>{money(achat.total_ht)}</td>
                            <td>{money(achat.tva)}</td>
                            <td>{money(achat.total_ttc)}</td>

                            <td>
                                <span
                                    className={`status status-${achat.statut}`}
                                >
                                    {statutLabel(achat.statut)}
                                </span>
                            </td>

                            <td>
                                <div className="table-actions">
                                    <button
                                        type="button"
                                        onClick={() => onDetails(achat)}
                                    >
                                        Détails
                                    </button>

                                    {achat.statut === "brouillon" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => onValider(achat)}
                                            >
                                                Valider
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(achat)}
                                            >
                                                Supprimer
                                            </button>
                                        </>
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
