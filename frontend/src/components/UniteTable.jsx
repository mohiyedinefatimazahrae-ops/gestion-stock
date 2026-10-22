
export default function UniteTable({
    unites,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (unites.length === 0) {
        return (
            <div className="table-card">
                <p>Aucune unité enregistrée.</p>
            </div>
        );
    }

    return (
        <div className="table-card">
            <h2>Liste des unités</h2>

            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Symbole</th>
                            <th>Nombre de produits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {unites.map((unite) => (
                            <tr key={unite.id_unt}>
                                <td>{unite.id_unt}</td>
                                <td>{unite.nom_unt}</td>
                                <td>{unite.symbole || "—"}</td>
                                <td>{unite.produits_count ?? 0}</td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(unite)}
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-danger"
                                            disabled={
                                                deletingId === unite.id_unt
                                            }
                                            onClick={() => onDelete(unite)}
                                        >
                                            {deletingId === unite.id_unt
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
        </div>
    );
}
