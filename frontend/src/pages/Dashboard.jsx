import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";

const formatNombre = (valeur) =>
    new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
    }).format(Number(valeur || 0));

const formatPrix = (valeur) =>
    `${new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(valeur || 0))} DH`;

const formatDate = (date) => {
    if (!date) return "—";

    const valeur = new Date(date);

    return Number.isNaN(valeur.getTime())
        ? "—"
        : valeur.toLocaleDateString("fr-FR");
};

const typeMouvement = {
    entree: "Entrée",
    sortie: "Sortie",
    ajustement: "Ajustement",
};

const statutProduction = {
    en_attente: "En attente",
    en_cours: "En cours",
};

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    async function chargerDashboard() {
        try {
            setChargement(true);
            setErreur("");

            const data = await getDashboard();
            setDashboard(data);
        } catch (error) {
            setErreur(
                error.message ||
                "Impossible de charger le tableau de bord."
            );
        } finally {
            setChargement(false);
        }
    }

    useEffect(() => {
        chargerDashboard();
    }, []);

    if (chargement) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Chargement du tableau de bord...
                </div>
            </div>
        );
    }

    if (erreur) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-error">
                    <p>{erreur}</p>
                    <button
                        type="button"
                        onClick={chargerDashboard}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const stats = dashboard?.stats || {};
    const alertes = dashboard?.alertes_stock || [];
    const mouvements = dashboard?.mouvements_recents || [];
    const productions = dashboard?.productions_recentes || [];
    const achats = dashboard?.achats_recents || [];
    const types = dashboard?.mouvements_par_type || {};

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p>
                        Vue d'ensemble de votre stock et de votre activité.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={chargerDashboard}
                >
                    ↻ Actualiser
                </button>
            </div>

            <div className="dashboard-stats">
                <div className="dashboard-stat">
                    <div className="dashboard-stat-icon blue">▦</div>
                    <div>
                        <span>Total des produits</span>
                        <strong>
                            {formatNombre(stats.total_produits)}
                        </strong>
                        <small>Produits enregistrés</small>
                    </div>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat-icon green">◈</div>
                    <div>
                        <span>Valeur du stock</span>
                        <strong className="dashboard-stat-price">
                            {formatPrix(stats.valeur_stock)}
                        </strong>
                        <small>Calculée au prix d'achat</small>
                    </div>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat-icon orange">!</div>
                    <div>
                        <span>Stock faible</span>
                        <strong>{formatNombre(stats.stock_faible)}</strong>
                        <small>Produits à surveiller</small>
                    </div>
                </div>

                <div className="dashboard-stat">
                    <div className="dashboard-stat-icon purple">⚙</div>
                    <div>
                        <span>Productions en cours</span>
                        <strong>
                            {formatNombre(stats.productions_en_cours)}
                        </strong>
                        <small>Fabrications démarrées</small>
                    </div>
                </div>
            </div>

            <div className="dashboard-middle-grid">
                <section className="dashboard-card">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Alertes de stock</h2>
                            <p>Produits ayant atteint leur seuil minimum</p>
                        </div>
                        <span className="dashboard-count">
                            {alertes.length}
                        </span>
                    </div>

                    {alertes.length === 0 ? (
                        <div className="dashboard-empty">
                            Aucun produit en stock faible.
                        </div>
                    ) : (
                        <div className="dashboard-table-wrapper">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Stock actuel</th>
                                        <th>Seuil min.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alertes.map((produit) => (
                                        <tr key={produit.id_prd}>
                                            <td>
                                                <strong>
                                                    {produit.nom_prd}
                                                </strong>
                                                <small>
                                                    {produit.ref_prd || "Sans référence"}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="dashboard-low-stock">
                                                    {formatNombre(produit.qte_stock)}
                                                    {" "}
                                                    {produit.unite?.symbole || ""}
                                                </span>
                                            </td>
                                            <td>
                                                {formatNombre(produit.qte_min)}
                                                {" "}
                                                {produit.unite?.symbole || ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="dashboard-card">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Répartition des mouvements</h2>
                            <p>Nombre de mouvements enregistrés</p>
                        </div>
                    </div>

                    <div className="dashboard-movement-summary">
                        <div>
                            <span className="dashboard-dot entree" />
                            <span>Entrées</span>
                            <strong>{formatNombre(types.entree)}</strong>
                        </div>
                        <div>
                            <span className="dashboard-dot sortie" />
                            <span>Sorties</span>
                            <strong>{formatNombre(types.sortie)}</strong>
                        </div>
                        <div>
                            <span className="dashboard-dot ajustement" />
                            <span>Ajustements</span>
                            <strong>{formatNombre(types.ajustement)}</strong>
                        </div>
                    </div>

                    <p className="dashboard-note">
                        Ces chiffres représentent le nombre total de
                        mouvements enregistrés, et non les quantités
                        de produits déplacées.
                    </p>
                </section>
            </div>

            <section className="dashboard-card dashboard-full-card">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Derniers mouvements de stock</h2>
                        <p>Les 7 mouvements les plus récents</p>
                    </div>
                </div>

                {mouvements.length === 0 ? (
                    <div className="dashboard-empty">
                        Aucun mouvement de stock enregistré.
                    </div>
                ) : (
                    <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Produit</th>
                                    <th>Type</th>
                                    <th>Quantité</th>
                                    <th>Avant</th>
                                    <th>Après</th>
                                    <th>Motif</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mouvements.map((mouvement) => (
                                    <tr key={mouvement.id_mouvement}>
                                        <td>
                                            {formatDate(
                                                mouvement.date_mouvement
                                            )}
                                        </td>
                                        <td>
                                            {mouvement.produit?.nom_prd ||
                                                "Produit supprimé"}
                                            {mouvement.produit?.ref_prd && (
                                                <small>
                                                    {mouvement.produit.ref_prd}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`dashboard-movement-badge ${mouvement.type}`}
                                            >
                                                {typeMouvement[mouvement.type] ||
                                                    mouvement.type}
                                            </span>
                                        </td>
                                        <td>
                                            {formatNombre(mouvement.qte)}
                                        </td>
                                        <td>
                                            {formatNombre(mouvement.qte_avant)}
                                        </td>
                                        <td>
                                            {formatNombre(mouvement.qte_apres)}
                                        </td>
                                        <td>{mouvement.motif || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="dashboard-bottom-grid">
                <section className="dashboard-card">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Productions à suivre</h2>
                            <p>Productions en attente ou en cours</p>
                        </div>
                    </div>

                    {productions.length === 0 ? (
                        <div className="dashboard-empty">
                            Aucune production à suivre.
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {productions.map((production) => (
                                <div
                                    className="dashboard-list-item"
                                    key={production.id_production}
                                >
                                    <div className="dashboard-list-main">
                                        <strong>
                                            {production.ref_production}
                                        </strong>
                                        <span>
                                            {production.client_nom || "Client non renseigné"}
                                        </span>
                                        <small>
                                            {production.produit_fini?.nom_prd ||
                                                "Produit fini non renseigné"}
                                        </small>
                                    </div>
                                    <div className="dashboard-list-side">
                                        <span
                                            className={`dashboard-production-status ${production.statut}`}
                                        >
                                            {statutProduction[production.statut] ||
                                                production.statut}
                                        </span>
                                        <small>
                                            Livraison :{" "}
                                            {formatDate(production.date_livraison)}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-card">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Derniers achats</h2>
                            <p>Les 5 achats les plus récents</p>
                        </div>
                    </div>

                    {achats.length === 0 ? (
                        <div className="dashboard-empty">
                            Aucun achat enregistré.
                        </div>
                    ) : (
                        <div className="dashboard-list">
                            {achats.map((achat) => (
                                <div
                                    className="dashboard-list-item"
                                    key={achat.id_achat}
                                >
                                    <div className="dashboard-list-main">
                                        <strong>
                                            {achat.num_achat ||
                                                `Achat #${achat.id_achat}`}
                                        </strong>
                                        <span>
                                            {achat.fournisseur?.nom_frn ||
                                                "Fournisseur non renseigné"}
                                        </span>
                                        <small>
                                            {formatDate(achat.date_achat)}
                                        </small>
                                    </div>
                                    <div className="dashboard-list-side">
                                        <strong>
                                            {formatPrix(achat.total_ttc)}
                                        </strong>
                                        <small>
                                            {achat.statut || "Sans statut"}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
