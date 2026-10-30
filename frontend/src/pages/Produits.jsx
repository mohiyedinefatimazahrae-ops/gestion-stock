import {
    getProduits,
    createProduit,
    updateProduit,
    deleteProduit,
} from "../api/produitsApi";

import { getCategories } from "../api/categoriesApi";
import { getUnites } from "../api/unitesApi";

import ProduitForm from "../components/ProduitForm";
import ProduitTable from "../components/ProduitTable";

import { useCallback, useEffect, useState } from "react";

export default function Produits({ selectedProductId }) {
    const [produits, setProduits] = useState([]);
    const [categories, setCategories] = useState([]);
    const [unites, setUnites] = useState([]);

    const [produitEnCours, setProduitEnCours] = useState(null);
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);

    const [nomRecherche, setNomRecherche] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProduits, setTotalProduits] = useState(0);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Charger les produits avec recherche et pagination
    const chargerProduits = useCallback(async (page = 1) => {
        setLoading(true);
        setErreur("");

        try {
            const result = await getProduits({
                nom: nomRecherche,
                page,
            });

            setProduits(result.data || []);
            setCurrentPage(result.current_page || 1);
            setLastPage(result.last_page || 1);
            setTotalProduits(result.total || 0);

        } catch (error) {
            setErreur(
                error.message || "Impossible de charger les produits."
            );
        } finally {
            setLoading(false);
        }
    }, [nomRecherche]);

    // Charger les catégories et les unités
    useEffect(() => {
        async function chargerDonnees() {
            try {
                const [dataCategories, dataUnites] = await Promise.all([
                    getCategories(),
                    getUnites(),
                ]);

                setCategories(dataCategories);
                setUnites(dataUnites);

            } catch (error) {
                setErreur(
                    error.message || "Impossible de charger les données."
                );
            }
        }

        chargerDonnees();
    }, []);

    // Recherche avec délai de 350 ms
    useEffect(() => {
        const timer = setTimeout(() => {
            chargerProduits(currentPage);
        }, 350);

        return () => clearTimeout(timer);
    }, [chargerProduits, currentPage]);

    // Aller au produit sélectionné
    useEffect(() => {
        if (loading || !selectedProductId) return;

        const element = document.getElementById(
            `produit-row-${selectedProductId}`
        );

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [loading, selectedProductId, produits]);

    async function enregistrerProduit(formData) {
        setErreur("");
        setMessage("");

        try {
            if (produitEnCours) {
                await updateProduit(produitEnCours.id_prd, formData);
                setMessage("Produit modifié avec succès.");
            } else {
                await createProduit(formData);
                setMessage("Produit ajouté avec succès.");
            }

            setProduitEnCours(null);
            setAfficherFormulaire(false);

            await chargerProduits(1);

        } catch (error) {
            setErreur(
                error.message || "Erreur lors de l'enregistrement."
            );
            throw error;
        }
    }

    function modifierProduit(produit) {
        setProduitEnCours(produit);
        setAfficherFormulaire(true);
        setErreur("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function annulerFormulaire() {
        setProduitEnCours(null);
        setAfficherFormulaire(false);
        setErreur("");
    }

    async function supprimerProduit(produit) {
        const confirmer = window.confirm(
            `Voulez-vous vraiment supprimer le produit "${produit.nom_prd}" ?`
        );

        if (!confirmer) return;

        setErreur("");
        setMessage("");
        setDeletingId(produit.id_prd);

        try {
            await deleteProduit(produit.id_prd);

            setMessage("Produit supprimé avec succès.");

            if (produitEnCours?.id_prd === produit.id_prd) {
                setProduitEnCours(null);
                setAfficherFormulaire(false);
            }

            // Si on supprime le dernier produit d'une page,
            // revenir à la page précédente si nécessaire.
            const page = produits.length === 1 && currentPage > 1
                ? currentPage - 1
                : currentPage;

            setCurrentPage(page);
            await chargerProduits(page);

        } catch (error) {
            setErreur(
                error.message || "Impossible de supprimer ce produit."
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="page-content produits-page">

            <div className="page-header">
                <div>
                    <h1>Gestion des produits</h1>
                    <p>
                        Gérez les produits, les matières premières
                        et les produits finis.
                    </p>
                </div>

                <div className="produits-header-actions">
                    <span className="category-count">
                        {totalProduits} produit(s)
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            window.open(
                                "http://127.0.0.1:8000/api/rapports/stock/pdf",
                                "_blank"
                            );
                        }}
                    >
                        Exporter le stock PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            window.open(
                                "http://127.0.0.1:8000/api/rapports/produits-a-acheter/pdf",
                                "_blank"
                            );
                        }}
                    >
                        Produits à acheter PDF
                    </button>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            if (afficherFormulaire) {
                                annulerFormulaire();
                            } else {
                                setProduitEnCours(null);
                                setAfficherFormulaire(true);
                                setErreur("");
                                setMessage("");
                            }
                        }}
                    >
                        {afficherFormulaire
                            ? "Fermer le formulaire"
                            : "+ Nouveau produit"}
                    </button>
                </div>
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

            {/* Formulaire caché par défaut */}
            {afficherFormulaire && (
                <section className="produit-form-section">
                    <ProduitForm
                        produit={produitEnCours}
                        categories={categories}
                        unites={unites}
                        onSubmit={enregistrerProduit}
                        onCancel={annulerFormulaire}
                    />
                </section>
            )}

            {/* Liste des produits */}
            <section className="produits-list-section">

                <div className="produits-list-header">
                    <div>
                        <h2>Liste des produits</h2>
                        <p>{totalProduits} produit(s) trouvé(s)</p>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="produits-search">
                    <input
                        type="search"
                        placeholder="Rechercher par nom du produit..."
                        value={nomRecherche}
                        onChange={(e) => {
                            setNomRecherche(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <button
                        type="button"
                        className="btn-secondary"
                        disabled={!nomRecherche}
                        onClick={() => {
                            setNomRecherche("");
                            setCurrentPage(1);
                        }}
                    >
                        Réinitialiser
                    </button>
                </div>

                <ProduitTable
                    produits={produits}
                    loading={loading}
                    onEdit={modifierProduit}
                    onDelete={supprimerProduit}
                    deletingId={deletingId}
                    selectedProductId={selectedProductId}
                />

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="pagination">

                        <button
                            type="button"
                            className="btn-secondary"
                            disabled={currentPage === 1 || loading}
                            onClick={() => {
                                setCurrentPage((page) => page - 1);
                            }}
                        >
                            Précédent
                        </button>

                        <span>
                            Page {currentPage} sur {lastPage}
                        </span>

                        <button
                            type="button"
                            className="btn-secondary"
                            disabled={currentPage === lastPage || loading}
                            onClick={() => {
                                setCurrentPage((page) => page + 1);
                            }}
                        >
                            Suivant
                        </button>

                    </div>
                )}
            </section>
        </div>
    );
}