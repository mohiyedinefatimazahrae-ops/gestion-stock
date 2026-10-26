import { useCallback, useEffect, useState } from "react";

import ProductionForm from "../components/ProductionForm";
import ProductionTable from "../components/ProductionTable";

import {
    getProductions,
    getProduction,
    createProduction,
    updateProduction,
    deleteProduction,
    getProductionMatieres,
    ajouterMatiere,
    modifierMatiere,
    supprimerMatiere,
    demarrerProduction,
    terminerProduction,
    livrerProduction,
} from "../api/productionsApi";

import { getProduits } from "../api/produitsApi";

export default function Productions() {
    const [productions, setProductions] = useState([]);
    const [produits, setProduits] = useState([]);
    const [matieres, setMatieres] = useState([]);

    const [formVisible, setFormVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selected, setSelected] = useState(null);

    const [produitId, setProduitId] = useState("");
    const [qte, setQte] = useState("1");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const chargerDonnees = useCallback(async () => {
        try {
            setError("");

            const [productionsData, produitsData] = await Promise.all([
                getProductions(),
                getProduits(),
            ]);

            setProductions(Array.isArray(productionsData) ? productionsData : []);
            setProduits(Array.isArray(produitsData) ? produitsData : []);
        } catch (err) {
            setError(err.message || "Erreur de chargement des données.");
        }
    }, []);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    async function ouvrirDetails(production) {
        try {
            setError("");
            setMessage("");

            const [productionData, matieresData] = await Promise.all([
                getProduction(production.id_production),
                getProductionMatieres(production.id_production),
            ]);

            setSelected(productionData);
            setMatieres(Array.isArray(matieresData) ? matieresData : []);
            setProduitId("");
            setQte("1");
        } catch (err) {
            setError(err.message);
        }
    }

    function nouvelleProduction() {
        setEditing(null);
        setFormVisible(true);
        setSelected(null);
        setError("");
        setMessage("");
    }

    function modifierProduction(production) {
        setEditing(production);
        setFormVisible(true);
        setSelected(null);
        setError("");
        setMessage("");
    }

    async function enregistrerProduction(data) {
        setLoading(true);
        setError("");

        try {
            if (editing) {
                await updateProduction(editing.id_production, data);
                setMessage("Production modifiée avec succès.");
            } else {
                await createProduction(data);
                setMessage("Production créée. Ajoute maintenant ses matières premières.");
            }

            setFormVisible(false);
            setEditing(null);
            await chargerDonnees();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function supprimerProduction(production) {
        if (!window.confirm(`Supprimer la production ${production.ref_production} ?`)) {
            return;
        }

        try {
            setError("");
            await deleteProduction(production.id_production);
            setMessage("Production supprimée.");
            if (selected?.id_production === production.id_production) {
                setSelected(null);
            }
            await chargerDonnees();
        } catch (err) {
            setError(err.message);
        }
    }

    async function rechargerDetails() {
        if (!selected) return;

        const [productionData, matieresData] = await Promise.all([
            getProduction(selected.id_production),
            getProductionMatieres(selected.id_production),
        ]);

        setSelected(productionData);
        setMatieres(Array.isArray(matieresData) ? matieresData : []);
    }

    async function ajouterMatiereForm(event) {
        event.preventDefault();

        if (!selected || !produitId || Number(qte) <= 0) {
            setError("Choisis une matière première et une quantité valide.");
            return;
        }

        try {
            setError("");
            setMessage("");

            await ajouterMatiere(selected.id_production, {
                produit_id: Number(produitId),
                qte: Number(qte),
            });

            setMessage("Matière ajoutée.");
            setProduitId("");
            setQte("1");
            await rechargerDetails();
        } catch (err) {
            setError(err.message);
        }
    }

    async function changerQuantite(matiere) {
        const nouvelleQte = window.prompt(
            "Nouvelle quantité :",
            String(matiere.qte)
        );

        if (nouvelleQte === null) return;

        if (!Number.isFinite(Number(nouvelleQte)) || Number(nouvelleQte) <= 0) {
            setError("La quantité doit être supérieure à zéro.");
            return;
        }

        try {
            setError("");
            await modifierMatiere(
                selected.id_production,
                matiere.id,
                { qte: Number(nouvelleQte) }
            );
            setMessage("Quantité modifiée.");
            await rechargerDetails();
        } catch (err) {
            setError(err.message);
        }
    }

    async function supprimerMatiereAction(matiere) {
        if (!window.confirm("Supprimer cette matière de la production ?")) return;

        try {
            setError("");
            await supprimerMatiere(
                selected.id_production,
                matiere.id
            );
            setMessage("Matière supprimée.");
            await rechargerDetails();
        } catch (err) {
            setError(err.message);
        }
    }

    async function executerAction(action, production, confirmation) {
        if (!window.confirm(confirmation)) return;

        try {
            setError("");
            setMessage("");

            await action(production.id_production);

            setMessage("Opération effectuée avec succès.");
            await chargerDonnees();

            if (selected?.id_production === production.id_production) {
                await ouvrirDetails(production);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    const matieresPremieres = produits.filter(
        (produit) => produit.type === "matiere_premiere"
    );

    return (
        <main className="productions-page">
            <header className="productions-header">
                <div>
                    <h1>Gestion des productions</h1>
                    <p>Suivi des commandes, des matières premières et du stock fini.</p>
                </div>

                {!formVisible && (
                    <button
                        type="button"
                        className="production-btn production-btn-primary"
                        onClick={nouvelleProduction}
                    >
                        + Nouvelle production
                    </button>
                )}
            </header>

            {error && (
                <div className="production-alert">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>×</button>
                </div>
            )}

            {message && (
                <div className="production-success-message">
                    <span>{message}</span>
                    <button type="button" onClick={() => setMessage("")}>×</button>
                </div>
            )}

            {formVisible && (
                <section className="production-card">
                    <ProductionForm
                        production={editing}
                        produits={produits}
                        loading={loading}
                        onSubmit={enregistrerProduction}
                        onCancel={() => {
                            setFormVisible(false);
                            setEditing(null);
                        }}
                    />
                </section>
            )}

            {!formVisible && (
                <section className="production-card">
                    <div className="production-section-heading">
                        <h2>Liste des productions</h2>
                        <button
                            type="button"
                            className="production-btn production-btn-secondary"
                            onClick={chargerDonnees}
                        >
                            Actualiser
                        </button>
                    </div>

                    <ProductionTable
                        productions={productions}
                        onDetails={ouvrirDetails}
                        onEdit={modifierProduction}
                        onDelete={supprimerProduction}
                        onStart={(p) => executerAction(
                            demarrerProduction,
                            p,
                            `Démarrer ${p.ref_production} ? Les matières seront déduites du stock.`
                        )}
                        onFinish={(p) => executerAction(
                            terminerProduction,
                            p,
                            `Terminer ${p.ref_production} ? La quantité produite sera ajoutée au stock.`
                        )}
                        onDeliver={(p) => executerAction(
                            livrerProduction,
                            p,
                            `Confirmer la livraison de ${p.ref_production} ?`
                        )}
                    />
                </section>
            )}

            {selected && !formVisible && (
                <section className="production-card production-details">
                    <div className="production-section-heading">
                        <div>
                            <h2>Détails : {selected.ref_production}</h2>
                            <p>Client : {selected.client_nom}</p>
                        </div>

                        <button
                            type="button"
                            className="production-btn production-btn-secondary"
                            onClick={() => setSelected(null)}
                        >
                            Fermer
                        </button>
                    </div>

                    <div className="production-summary-grid">
                        <div>
                            <span>Produit fini</span>
                            <strong>{selected.produit_fini?.nom_prd || "—"}</strong>
                        </div>
                        <div>
                            <span>Quantité prévue</span>
                            <strong>{selected.qte_produite}</strong>
                        </div>
                        <div>
                            <span>Prix total</span>
                            <strong>{Number(selected.prix_total).toFixed(2)} DH</strong>
                        </div>
                        <div>
                            <span>Reste à payer</span>
                            <strong>{Number(selected.prix_reste).toFixed(2)} DH</strong>
                        </div>
                    </div>

                    <div className="production-section-heading">
                        <h3>Matières premières nécessaires</h3>
                    </div>

                    {selected.statut === "en_attente" && (
                        <form
                            className="production-add-material"
                            onSubmit={ajouterMatiereForm}
                        >
                            <label>
                                Matière première
                                <select
                                    value={produitId}
                                    onChange={(event) => setProduitId(event.target.value)}
                                    required
                                >
                                    <option value="">-- Choisir --</option>
                                    {matieresPremieres.map((produit) => (
                                        <option
                                            key={produit.id_prd}
                                            value={produit.id_prd}
                                        >
                                            {produit.nom_prd} — Stock : {produit.qte_stock}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Quantité
                                <input
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    value={qte}
                                    onChange={(event) => setQte(event.target.value)}
                                    required
                                />
                            </label>

                            <button
                                type="submit"
                                className="production-btn production-btn-primary"
                            >
                                Ajouter
                            </button>
                        </form>
                    )}

                    <div className="production-material-list">
                        {matieres.length === 0 ? (
                            <p className="production-muted">
                                Aucune matière première ajoutée.
                            </p>
                        ) : (
                            <div className="production-table-wrapper">
                                <table className="production-table">
                                    <thead>
                                        <tr>
                                            <th>Matière</th>
                                            <th>Quantité nécessaire</th>
                                            {selected.statut === "en_attente" && (
                                                <th>Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matieres.map((matiere) => (
                                            <tr key={matiere.id}>
                                                <td>{matiere.produit?.nom_prd || "—"}</td>
                                                <td>{matiere.qte}</td>
                                                {selected.statut === "en_attente" && (
                                                    <td>
                                                        <div className="production-actions">
                                                            <button
                                                                type="button"
                                                                className="production-btn production-btn-secondary"
                                                                onClick={() => changerQuantite(matiere)}
                                                            >
                                                                Quantité
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="production-btn production-btn-danger"
                                                                onClick={() => supprimerMatiereAction(matiere)}
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {selected.statut === "en_attente" && (
                        <p className="production-help">
                            Ajoute les matières avant de démarrer la production.
                        </p>
                    )}
                </section>
            )}
        </main>
    );
}
