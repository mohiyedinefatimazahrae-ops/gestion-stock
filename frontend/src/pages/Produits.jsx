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
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const chargerProduits = useCallback(async () => {
        const data = await getProduits();
        setProduits(data);
    }, []);

    useEffect(() => {
        async function chargerDonnees() {
            setLoading(true);
            setErreur("");

            try {
                const [dataProduits, dataCategories, dataUnites] =
                    await Promise.all([
                        getProduits(),
                        getCategories(),
                        getUnites(),
                    ]);

                setProduits(dataProduits);
                setCategories(dataCategories);
                setUnites(dataUnites);
            } catch (error) {
                setErreur(
                    error.message ||
                    "Impossible de charger les données."
                );
            } finally {
                setLoading(false);
            }
        }

        chargerDonnees();
    }, []);

    useEffect(() => {
        if (loading || !selectedProductId || produits.length === 0) {
            return;
        }

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
            await chargerProduits();
        } catch (error) {
            setErreur(error.message || "Erreur lors de l'enregistrement.");
            throw error;
        }
    }

    function modifierProduit(produit) {
        setProduitEnCours(produit);
        setErreur("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function annulerModification() {
        setProduitEnCours(null);
        setErreur("");
        setMessage("");
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
            }

            await chargerProduits();
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
                        {produits.length} produit(s)
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
                </div>
            </div>

                {erreur && (
                <div className="alert alert-error">
                    {erreur}
                </div>
            )}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {loading ? (
                <div className="table-card">
                    Chargement des produits, catégories et unités...
                </div>
            ) : (
                <>
                    <ProduitForm
                        produit={produitEnCours}
                        categories={categories}
                        unites={unites}
                        onSubmit={enregistrerProduit}
                        onCancel={annulerModification}
                    />

                    <ProduitTable
                        produits={produits}
                        onEdit={modifierProduit}
                        onDelete={supprimerProduit}
                        deletingId={deletingId}
                        selectedProductId={selectedProductId}
                    />
                </>
            )}
        </div>
    );
}