export default function MouvementsStockTable({
    mouvements,
    loading,
    pagination,
    onPageChange,
}) {
    function formaterDate(date) {
        if (!date) return "—";

        const valeur = new Date(date);

        if (Number.isNaN(valeur.getTime())) return "—";

        return valeur.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function afficherNombre(valeur) {
        if (valeur === null || valeur === undefined) {
            return "—";
        }

        return Number(valeur).toLocaleString("fr-FR", {
            maximumFractionDigits: 3,
        });
    }

    function afficherPrix(valeur) {
        if (valeur === null || valeur === undefined) {
            return "—";
        }

        return `${Number(valeur).toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} DH`;
    }

    function libelleType(type) {
        const types = {
            entree: "Entrée",
            sortie: "Sortie",
            ajustement: "Ajustement",
        };

        return types[type] || type || "—";
    }

    const pageActuelle = pagination?.current_page || 1;
    const dernierePage = pagination?.last_page || 1;

    const debutPages = Math.max(
        1,
        Math.min(pageActuelle - 2, dernierePage - 4)
    );

    const finPages = Math.min(
        dernierePage,
        debutPages + 4
    );

    const pages = Array.from(
        { length: finPages - debutPages + 1 },
        (_, index) => debutPages + index
    );

    return (
        <>
            <div className="mouvements-table-wrapper">
                <table className="mouvements-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Référence</th>
                            <th>Produit</th>
                            <th>Type</th>
                            <th>Quantité</th>
                            <th>Stock avant</th>
                            <th>Stock après</th>
                            <th>Prix unitaire</th>
                            <th>Motif</th>
                            <th>Document lié</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="mouvement-vide">
                                    Chargement...
                                </td>
                            </tr>
                        ) : mouvements.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="mouvement-vide">
                                    Aucun mouvement trouvé.
                                </td>
                            </tr>
                        ) : (
                            mouvements.map((mouvement) => (
                                <tr key={mouvement.id_mouvement}>
                                    <td>
                                        {formaterDate(
                                            mouvement.date_mouvement
                                        )}
                                    </td>

                                    <td>#{mouvement.id_mouvement}</td>

                                    <td>
                                        <strong>
                                            {mouvement.produit?.nom_prd ||
                                                "Produit inconnu"}
                                        </strong>

                                        <small className="mouvement-reference">
                                            {mouvement.produit?.ref_prd || ""}
                                        </small>
                                    </td>

                                    <td>
                                        <span
                                            className={`mouvement-badge ${
                                                mouvement.type || ""
                                            }`}
                                        >
                                            {libelleType(mouvement.type)}
                                        </span>
                                    </td>

                                    <td>{afficherNombre(mouvement.qte)}</td>
                                    <td>
                                        {afficherNombre(mouvement.qte_avant)}
                                    </td>
                                    <td>
                                        {afficherNombre(mouvement.qte_apres)}
                                    </td>
                                    <td>{afficherPrix(mouvement.pu)}</td>
                                    <td>{mouvement.motif || "—"}</td>

                                    <td>
                                        {mouvement.achat_id
                                            ? `Achat #${mouvement.achat_id}`
                                            : mouvement.production_id
                                              ? `Production #${mouvement.production_id}`
                                              : "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && pagination && pagination.total > 0 && (
                <div className="pagination-mouvements">
                    <div className="pagination-boutons">
                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={pageActuelle <= 1 || loading}
                            onClick={() => onPageChange(pageActuelle - 1)}
                        >
                            Précédent
                        </button>
                        
                        {pages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={`pagination-btn ${
                                    page === pageActuelle ? "active" : ""
                                }`}
                                disabled={loading}
                                onClick={() => onPageChange(page)}
                                aria-current={
                                    page === pageActuelle ? "page" : undefined
                                }
                            >
                                {page}
                            </button>
                        ))}
            
                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={pageActuelle >= dernierePage || loading}
                            onClick={() => onPageChange(pageActuelle + 1)}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}