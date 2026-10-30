import { useCallback, useEffect, useState } from "react";

import {
    getFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
} from "../api/fournisseursApi";

import FournisseurForm from "../components/FournisseurForm";
import FournisseurTable from "../components/FournisseurTable";

export default function Fournisseurs() {
    const [fournisseurs, setFournisseurs] = useState([]);

    const [fournisseurActuel, setFournisseurActuel] = useState(null);

    const [formVisible, setFormVisible] = useState(false);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Recherche
    const [telephone, setTelephone] = useState("");
    const [nom, setNom] = useState("");

    // Pagination
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 5,
    });

    const chargerFournisseurs = useCallback(async (page = 1) => {
        setLoading(true);
        setErreur("");

        try {
            const data = await getFournisseurs({
                telephone: telephone.trim(),
                nom: nom.trim(),
                page,
            });

            setFournisseurs(data.data || []);

            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                per_page: data.per_page,
            });
        } catch (error) {
            setErreur(
                error.message || "Impossible de charger les fournisseurs."
            );
        } finally {
            setLoading(false);
        }
    }, [telephone, nom]);

    // Recherche automatique avec un petit délai
    useEffect(() => {
        const timer = setTimeout(() => {
            chargerFournisseurs(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [chargerFournisseurs]);

    async function enregistrerFournisseur(data) {
        setErreur("");
        setMessage("");

        try {
            if (fournisseurActuel) {
                await updateFournisseur(
                    fournisseurActuel.id_frn,
                    data
                );

                setMessage("Fournisseur modifié avec succès.");
            } else {
                await createFournisseur(data);

                setMessage("Fournisseur ajouté avec succès.");
            }

            setFormVisible(false);
            setFournisseurActuel(null);

            await chargerFournisseurs(1);
        } catch (error) {
            setErreur(error.message);
            throw error;
        }
    }

    function ouvrirAjout() {
        setFournisseurActuel(null);
        setFormVisible(true);
        setErreur("");
        setMessage("");
    }

    function modifierFournisseur(fournisseur) {
        setFournisseurActuel(fournisseur);
        setFormVisible(true);
        setErreur("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function fermerFormulaire() {
        setFormVisible(false);
        setFournisseurActuel(null);
        setErreur("");
    }

    async function supprimerFournisseur(fournisseur) {
        const confirmation = window.confirm(
            `Voulez-vous supprimer le fournisseur "${fournisseur.nom_frn}" ?`
        );

        if (!confirmation) return;

        setDeletingId(fournisseur.id_frn);
        setErreur("");
        setMessage("");

        try {
            await deleteFournisseur(fournisseur.id_frn);

            setMessage("Fournisseur supprimé avec succès.");

            if (fournisseurActuel?.id_frn === fournisseur.id_frn) {
                fermerFormulaire();
            }

            // Si on supprime le dernier élément d'une page,
            // revenir à la page précédente si nécessaire.
            const page = fournisseurs.length === 1 &&
                pagination.current_page > 1
                ? pagination.current_page - 1
                : pagination.current_page;

            await chargerFournisseurs(page);
        } catch (error) {
            setErreur(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    function changerPage(page) {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }

        chargerFournisseurs(page);
    }

    function reinitialiserRecherche() {
        setTelephone("");
        setNom("");
    }

    return (
        <div className="page-content fournisseurs-page">

            <div className="page-header">
                <div>
                    <h1>Gestion des fournisseurs</h1>
                    <p>Gérez vos fournisseurs et leurs coordonnées.</p>
                </div>

                <div className="fournisseurs-header-actions">
                    <span className="category-count">
                        {pagination.total} fournisseur(s)
                    </span>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            formVisible
                                ? fermerFormulaire()
                                : ouvrirAjout();
                        }}
                    >
                        {formVisible
                            ? "Fermer le formulaire"
                            : "+ Ajouter un fournisseur"}
                    </button>
                </div>
            </div>

            {erreur && (
                <div className="alert alert-error">{erreur}</div>
            )}

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {formVisible && (
                <FournisseurForm
                    fournisseur={fournisseurActuel}
                    onSubmit={enregistrerFournisseur}
                    onCancel={fermerFormulaire}
                />
            )}

            <section className="fournisseurs-list-section">
                <h2>Liste des fournisseurs</h2>

                {/* Recherche */}
                <div className="fournisseurs-search">

                    <div className="form-group">
                        <label htmlFor="recherche-telephone">
                            Téléphone du fournisseur
                        </label>

                        <input
                            id="recherche-telephone"
                            type="search"
                            placeholder="Rechercher par téléphone..."
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="recherche-nom">
                            Nom du fournisseur
                        </label>

                        <input
                            id="recherche-nom"
                            type="search"
                            placeholder="Rechercher par nom..."
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={reinitialiserRecherche}
                        disabled={!telephone && !nom}
                    >
                        Réinitialiser
                    </button>
                </div>

                {loading ? (
                    <p>Chargement des fournisseurs...</p>
                ) : (
                    <>
                        <FournisseurTable
                            fournisseurs={fournisseurs}
                            onEdit={modifierFournisseur}
                            onDelete={supprimerFournisseur}
                            deletingId={deletingId}
                        />

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="pagination">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        changerPage(
                                            pagination.current_page - 1
                                        )
                                    }
                                >
                                    Précédent
                                </button>

                                <span>
                                    Page {pagination.current_page} sur{" "}
                                    {pagination.last_page}
                                </span>

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                    onClick={() =>
                                        changerPage(
                                            pagination.current_page + 1
                                        )
                                    }
                                >
                                    Suivant
                                </button>

                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}