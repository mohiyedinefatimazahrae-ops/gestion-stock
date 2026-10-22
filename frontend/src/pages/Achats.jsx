
import { useCallback, useEffect, useState } from "react";

import AchatForm from "../components/AchatForm";
import AchatTable from "../components/AchatTable";

import {
    getAchats,
    getAchat,
    createAchat,
    deleteAchat,
    validerAchat,
    ajouterDetailAchat,
    supprimerDetailAchat,
} from "../api/achatsApi";

import { getFournisseurs } from "../api/fournisseursApi";
import { getProduits } from "../api/produitsApi";

function getList(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
}

export default function Achats() {
    const [achats, setAchats] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedAchat, setSelectedAchat] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");

    const chargerAchats = useCallback(async () => {
        const result = await getAchats();
        setAchats(getList(result));
    }, []);

    const chargerDetails = useCallback(async (id) => {
        const result = await getAchat(id);
        const achat = result.achat ?? result.data ?? result;

        setSelectedAchat(achat);
    }, []);

    useEffect(() => {
        async function initialiser() {
            setLoading(true);
            setErreur("");

            try {
                const [achatsResult, fournisseursResult, produitsResult] =
                    await Promise.all([
                        getAchats(),
                        getFournisseurs(),
                        getProduits(),
                    ]);

                setAchats(getList(achatsResult));
                setFournisseurs(getList(fournisseursResult));
                setProduits(getList(produitsResult));
            } catch (error) {
                setErreur(error.message || "Erreur de chargement.");
            } finally {
                setLoading(false);
            }
        }

        initialiser();
    }, []);

    async function actualiser() {
        await chargerAchats();

        if (selectedAchat?.id_achat) {
            await chargerDetails(selectedAchat.id_achat);
        }
    }

    async function handleSubmit({ header, details }) {
        setSaving(true);
        setErreur("");
        setMessage("");

        try {
            let achatId = selectedAchat?.id_achat;

            // Créer d'abord l'achat en brouillon.
            if (!achatId) {
                const result = await createAchat(header);
                const nouvelAchat = result.achat ?? result.data ?? result;

                achatId = nouvelAchat.id_achat;

                if (!achatId) {
                    throw new Error(
                        "L'achat a été créé, mais son identifiant est introuvable. Vérifie la réponse de AchatController."
                    );
                }
            }

            // Enregistrer les lignes une par une.
            for (const detail of details) {
                await ajouterDetailAchat(achatId, detail);
            }

            await chargerAchats();
            await chargerDetails(achatId);

            setMessage(
                selectedAchat
                    ? "Produits ajoutés à l'achat."
                    : "Achat créé et produits enregistrés."
            );
        } catch (error) {
            setErreur(error.message || "Impossible d'enregistrer l'achat.");
            await chargerAchats().catch(() => {});
        } finally {
            setSaving(false);
        }
    }

    async function handleDetails(achat) {
        setErreur("");
        setMessage("");

        try {
            await chargerDetails(achat.id_achat);
        } catch (error) {
            setErreur(error.message || "Impossible de charger les détails.");
        }
    }

    async function handleValider(achat) {
        const confirmer = window.confirm(
            `Valider l'achat ${achat.num_achat} et mettre à jour le stock ?`
        );

        if (!confirmer) return;

        setErreur("");
        setMessage("");

        try {
            await validerAchat(achat.id_achat);
            await chargerAchats();

            if (selectedAchat?.id_achat === achat.id_achat) {
                await chargerDetails(achat.id_achat);
            }

            setMessage("Achat validé et stock mis à jour.");
        } catch (error) {
            setErreur(error.message || "Impossible de valider cet achat.");
        }
    }

    async function handleDelete(achat) {
        const confirmer = window.confirm(
            `Supprimer l'achat ${achat.num_achat} ?`
        );

        if (!confirmer) return;

        setErreur("");
        setMessage("");

        try {
            await deleteAchat(achat.id_achat);
            await chargerAchats();

            if (selectedAchat?.id_achat === achat.id_achat) {
                setSelectedAchat(null);
            }

            setMessage("Achat supprimé.");
        } catch (error) {
            setErreur(error.message || "Impossible de supprimer cet achat.");
        }
    }

    async function handleDeleteDetail(detail) {
        if (!selectedAchat) return;

        if (!window.confirm("Supprimer cette ligne d'achat ?")) return;

        setErreur("");
        setMessage("");

        try {
            await supprimerDetailAchat(
                selectedAchat.id_achat,
                detail.id
            );

            await chargerDetails(selectedAchat.id_achat);
            await chargerAchats();

            setMessage("Ligne supprimée.");
        } catch (error) {
            setErreur(error.message || "Impossible de supprimer cette ligne.");
        }
    }

    return (
        <div className="achats-page">
            <h1>Gestion des achats</h1>

            <p>
                Crée tes achats, ajoute les produits et valide-les pour
                mettre à jour le stock.
            </p>

            {erreur && (
                <div className="alert alert-error" role="alert">
                    {erreur}
                </div>
            )}

            {message && (
                <div className="alert alert-success" role="status">
                    {message}
                </div>
            )}

            {!selectedAchat && (
                <AchatForm
                    fournisseurs={fournisseurs}
                    produits={produits}
                    onSubmit={handleSubmit}
                    loading={saving}
                />
            )}

            <hr />

            <h2>Liste des achats</h2>

            <AchatTable
                achats={achats}
                loading={loading}
                onDetails={handleDetails}
                onValider={handleValider}
                onDelete={handleDelete}
            />

            {selectedAchat && (
                <section className="achat-details-section">
                    <div className="section-heading">
                        <h2>
                            Détails de {selectedAchat.num_achat}
                        </h2>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedAchat(null);
                                setErreur("");
                                setMessage("");
                            }}
                        >
                            Fermer les détails
                        </button>
                    </div>

                    <p>
                        Fournisseur :{" "}
                        {selectedAchat.fournisseur?.nom_frn || "—"}
                    </p>

                    <p>
                        Statut : <strong>{selectedAchat.statut}</strong>
                    </p>

                    {selectedAchat.statut === "brouillon" && (
                        <AchatForm
                            key={selectedAchat.id_achat}
                            achat={selectedAchat}
                            fournisseurs={fournisseurs}
                            produits={produits}
                            onSubmit={handleSubmit}
                            onCancel={() => setSelectedAchat(null)}
                            loading={saving}
                        />
                    )}

                    <h3>Produits enregistrés</h3>

                    {!selectedAchat.details?.length ? (
                        <p>Aucun produit dans cet achat.</p>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Quantité</th>
                                        <th>Prix unitaire</th>
                                        <th>Remise (%)</th>
                                        <th>TVA (%)</th>
                                        <th>Sous-total HT</th>
                                        {selectedAchat.statut === "brouillon" && (
                                            <th>Action</th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {selectedAchat.details.map((detail) => (
                                        <tr key={detail.id}>
                                            <td>
                                                {detail.produit?.nom_prd || "—"}
                                            </td>
                                            <td>{detail.qte}</td>
                                            <td>{detail.pu} DH</td>
                                            <td>{detail.remise}%</td>
                                            <td>{detail.tva_pourcentage}%</td>
                                            <td>{detail.sous_total} DH</td>

                                            {selectedAchat.statut === "brouillon" && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteDetail(detail)
                                                        }
                                                    >
                                                        Supprimer
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="achat-totals">
                        <p>
                            Total HT :{" "}
                            <strong>{Number(selectedAchat.total_ht || 0).toFixed(2)} DH</strong>
                        </p>
                        <p>
                            TVA :{" "}
                            <strong>{Number(selectedAchat.tva || 0).toFixed(2)} DH</strong>
                        </p>
                        <p>
                            Total TTC :{" "}
                            <strong>{Number(selectedAchat.total_ttc || 0).toFixed(2)} DH</strong>
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
