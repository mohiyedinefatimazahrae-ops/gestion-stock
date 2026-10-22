
export default function FournisseurTable({
    fournisseurs,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (fournisseurs.length === 0) {
        return (
            <section className="table-card">
                <p>Aucun fournisseur enregistré.</p>
            </section>
        );
    }

    return (
        <section className="table-card">
            <div className="table-responsive">
                <table className="fournisseur-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Contact</th>
                            <th>Ville</th>
                            <th>ICE</th>
                            <th>Achats</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {fournisseurs.map((fournisseur) => (
                            <tr key={fournisseur.id_frn}>
                                <td>
                                    <strong>{fournisseur.nom_frn}</strong>
                                    {fournisseur.adr && (
                                        <small className="fournisseur-adresse">
                                            {fournisseur.adr}
                                        </small>
                                    )}
                                </td>

                                <td>
                                    <div>
                                        {fournisseur.tel || "—"}
                                    </div>
                                    <small className="fournisseur-email">
                                        {fournisseur.email || ""}
                                    </small>
                                </td>

                                <td>{fournisseur.ville || "—"}</td>

                                <td>{fournisseur.ice || "—"}</td>

                                <td>{fournisseur.achats_count ?? 0}</td>

                                <td>
                                    <span
                                        className={
                                            fournisseur.actif
                                                ? "status-badge status-active"
                                                : "status-badge status-inactive"
                                        }
                                    >
                                        {fournisseur.actif
                                            ? "Actif"
                                            : "Inactif"}
                                    </span>
                                </td>

                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => onEdit(fournisseur)}
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-danger"
                                            disabled={
                                                deletingId === fournisseur.id_frn
                                            }
                                            onClick={() => onDelete(fournisseur)}
                                        >
                                            {deletingId === fournisseur.id_frn
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
