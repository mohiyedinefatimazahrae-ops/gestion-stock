import { useCallback, useEffect, useState } from "react";

import AchatForm from "../components/AchatForm";
import AchatTable from "../components/AchatTable";

import {
    getAchats,
    getAchat,
    deleteAchat,
    validerAchat,
    getFactureUrl,
    getFactureDownloadUrl,
    enregistrerAchatComplet,
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
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [modeEdition, setModeEdition] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [telechargement, setTelechargement] = useState(false);

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
        return achat;
    }, []);

    useEffect(() => {
        async function initialiser() {
            setLoading(true);
            setErreur("");

            try {
                const [
                    achatsResult,
                    fournisseursResult,
                    produitsResult,
                ] = await Promise.all([
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

    function fermerModal() {
        setSelectedAchat(null);
        setModeEdition(false);
        setErreur("");
    }

    async function handleDetails(achat) {
        setErreur("");
        setMessage("");
        setModeEdition(false);

        try {
            await chargerDetails(achat.id_achat);
        } catch (error) {
            setErreur(error.message || "Impossible de charger les détails.");
        }
    }

    
    function telechargerFacture() {
        if (!selectedAchat?.id_achat) {
            setErreur("Aucun achat sélectionné.");
            return;
        }

        window.location.href = getFactureDownloadUrl(
            selectedAchat.id_achat
        );
    }


    async function handleSubmit({ header }) {
        setSaving(true);
        setErreur("");
        setMessage("");

        const idAchat = header.get("id_achat");
        const modification = Boolean(idAchat);

        try {
            const result = await enregistrerAchatComplet(header);
            const achatEnregistre = result.data ?? result.achat;

            const achatId =
                achatEnregistre?.id_achat ?? idAchat;

            await chargerAchats();

            if (achatId) {
                await chargerDetails(achatId);
            }

            setMessage(
                modification
                    ? "Achat et détails modifiés avec succès."
                    : "Achat créé avec tous ses produits."
            );
        } catch (error) {
            setErreur(
                error.message || "Impossible d'enregistrer l'achat."
            );
            await chargerAchats().catch(() => {});
            throw error;
        } finally {
            setSaving(false);
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
                setModeEdition(false);
            }

            setMessage("Achat validé et stock mis à jour.");
        } catch (error) {
            setErreur(
                error.message || "Impossible de valider cet achat."
            );
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
                fermerModal();
            }

            setMessage("Achat supprimé.");
        } catch (error) {
            setErreur(
                error.message || "Impossible de supprimer cet achat."
            );
        }
    }

    const factureUrl = selectedAchat?.img_facture
        ? getFactureUrl(selectedAchat.img_facture)
        : null;

    return (
        <div className="achats-page">
            <div className="achats-header">
                <div>
                    <h1>Gestion des achats</h1>
                    <p>
                        Gère les achats fournisseurs et les entrées de stock.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        setAfficherFormulaire((ancien) => !ancien);
                        setErreur("");
                        setMessage("");
                    }}
                >
                    {afficherFormulaire
                        ? "Fermer le formulaire"
                        : "+ Nouvel achat"}
                </button>
            </div>

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

            {afficherFormulaire && (
                <section className="achat-create-card">
                    <AchatForm
                        fournisseurs={fournisseurs}
                        produits={produits}
                        onSubmit={handleSubmit}
                        onCancel={() => setAfficherFormulaire(false)}
                        loading={saving}
                    />
                </section>
            )}

            <section className="achats-list-section">
                <div className="achats-section-heading">
                    <div>
                        <h2>Liste des achats</h2>
                        <p>{achats.length} achat(s) enregistré(s)</p>
                    </div>

                    <button
                        type="button"
                        className="btn-secondary"
                        disabled={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                await chargerAchats();
                            } catch (error) {
                                setErreur(
                                    error.message || "Erreur d'actualisation."
                                );
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Actualiser
                    </button>
                </div>

                <AchatTable
                    achats={achats}
                    loading={loading}
                    onDetails={handleDetails}
                    onValider={handleValider}
                    onDelete={handleDelete}
                />
            </section>

            {selectedAchat && (
                <div
                    className="achat-modal-backdrop"
                    onClick={fermerModal}
                >
                    <section
                        className="achat-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="achat-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="achat-modal-header">
                            <div>
                                <span className="achat-modal-eyebrow">
                                    Dossier d'achat
                                </span>

                                <h2 id="achat-modal-title">
                                    {selectedAchat.num_achat}
                                </h2>

                                <span
                                    className={`status status-${selectedAchat.statut}`}
                                >
                                    {selectedAchat.statut === "brouillon"
                                        ? "Brouillon"
                                        : selectedAchat.statut === "valide"
                                          ? "Validé"
                                          : selectedAchat.statut}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="achat-modal-close"
                                aria-label="Fermer les détails"
                                onClick={fermerModal}
                            >
                                ×
                            </button>
                        </header>

                        {erreur && (
                            <div className="alert alert-error" role="alert">
                                {erreur}
                            </div>
                        )}

                        <div className="achat-modal-body">
                            {!modeEdition ? (
                                <>
                                    <div className="achat-info-grid">
                                        <div>
                                            <span>Fournisseur</span>
                                            <strong>
                                                {selectedAchat.fournisseur?.nom_frn ||
                                                    "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Date d'achat</span>
                                            <strong>
                                                {String(
                                                    selectedAchat.date_achat || ""
                                                ).slice(0, 10) || "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>N° facture</span>
                                            <strong>
                                                {selectedAchat.numero_facture ||
                                                    "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Statut</span>
                                            <strong>
                                                {selectedAchat.statut}
                                            </strong>
                                        </div>
                                    </div>

                                    {selectedAchat.notes && (
                                        <div className="achat-notes">
                                            <strong>Notes</strong>
                                            <p>{selectedAchat.notes}</p>
                                        </div>
                                    )}

                                    <div className="achat-modal-section">
                                        <h3>Produits de l'achat</h3>

                                        {!selectedAchat.details?.length ? (
                                            <p>
                                                Aucun produit dans cet achat.
                                            </p>
                                        ) : (
                                            <div className="table-container">
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Produit</th>
                                                            <th>Quantité</th>
                                                            <th>Prix unitaire</th>
                                                            <th>Remise</th>
                                                            <th>TVA</th>
                                                            <th>Sous-total HT</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {selectedAchat.details.map(
                                                            (detail) => (
                                                                <tr key={detail.id}>
                                                                    <td>
                                                                        {detail.produit?.nom_prd ||
                                                                            "—"}
                                                                    </td>
                                                                    <td>{detail.qte}</td>
                                                                    <td>
                                                                        {Number(
                                                                            detail.pu || 0
                                                                        ).toFixed(2)}{" "}
                                                                        DH
                                                                    </td>
                                                                    <td>
                                                                        {detail.remise}%
                                                                    </td>
                                                                    <td>
                                                                        {detail.tva_pourcentage}%
                                                                    </td>
                                                                    <td>
                                                                        {Number(
                                                                            detail.sous_total || 0
                                                                        ).toFixed(2)}{" "}
                                                                        DH
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="achat-modal-totals">
                                        <p>
                                            Total HT
                                            <strong>
                                                {Number(
                                                    selectedAchat.total_ht || 0
                                                ).toFixed(2)}{" "}
                                                DH
                                            </strong>
                                        </p>

                                        <p>
                                            TVA
                                            <strong>
                                                {Number(
                                                    selectedAchat.tva || 0
                                                ).toFixed(2)}{" "}
                                                DH
                                            </strong>
                                        </p>

                                        <p className="achat-total-ttc">
                                            Total TTC
                                            <strong>
                                                {Number(
                                                    selectedAchat.total_ttc || 0
                                                ).toFixed(2)}{" "}
                                                DH
                                            </strong>
                                        </p>
                                    </div>

                                    <div className="achat-facture-section">
                                        <h3>Facture fournisseur</h3>

                                        {factureUrl ? (
                                            <>
                                                <a
                                                    href={factureUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="achat-facture-preview-link"
                                                >
                                                    <img
                                                        src={factureUrl}
                                                        alt="Facture de l'achat"
                                                        className="achat-facture-preview"
                                                    />
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={telechargerFacture}
                                                    disabled={telechargement}
                                                    className="btn-secondary"
                                                >
                                                    {telechargement
                                                        ? "Téléchargement..."
                                                        : "Télécharger la facture"}
                                                </button>
                                            </>
                                        ) : (
                                            <p>
                                                Aucune image de facture enregistrée.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <AchatForm
                                    key={`${selectedAchat.id_achat}-${selectedAchat.details?.length ?? 0}`}
                                    achat={selectedAchat}
                                    fournisseurs={fournisseurs}
                                    produits={produits}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setModeEdition(false)}
                                    loading={saving}
                                />
                            )}
                        </div>

                        <footer className="achat-modal-footer">
                            {!modeEdition &&
                                selectedAchat.statut === "brouillon" && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() =>
                                                setModeEdition(true)
                                            }
                                        >
                                            Modifier l'achat
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-primary"
                                            disabled={saving}
                                            onClick={() =>
                                                handleValider(selectedAchat)
                                            }
                                        >
                                            Valider l'achat
                                        </button>
                                    </>
                                )}

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={fermerModal}
                            >
                                Fermer
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}
