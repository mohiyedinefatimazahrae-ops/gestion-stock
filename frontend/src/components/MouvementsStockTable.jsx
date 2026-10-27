
export default function MouvementsStockTable({
    mouvements,
    loading,
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

    return (
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
    );
}
