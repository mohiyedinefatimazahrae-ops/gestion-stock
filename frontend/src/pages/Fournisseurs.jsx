
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
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const chargerFournisseurs = useCallback(async () => {
        const data = await getFournisseurs();
        setFournisseurs(Array.isArray(data) ? data : []);
    }, []);

    useEffect(() => {
        async function charger() {
            try {
                setErreur("");
                await chargerFournisseurs();
            } catch (error) {
                setErreur(error.message || "Impossible de charger les fournisseurs.");
            } finally {
                setLoading(false);
            }
        }

        charger();
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

            setFournisseurActuel(null);
            await chargerFournisseurs();
        } catch (error) {
            setErreur(error.message);
            throw error;
        }
    }

    function modifierFournisseur(fournisseur) {
        setFournisseurActuel(fournisseur);
        setErreur("");
        setMessage("");

        window.scrollTo({ top: 0, behavior: "smooth" });
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
                setFournisseurActuel(null);
            }

            await chargerFournisseurs();
        } catch (error) {
            setErreur(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="page-content fournisseurs-page">
            <div className="page-header">
                <div>
                    <h1>Gestion des fournisseurs</h1>
                    <p>Gérez vos fournisseurs et leurs coordonnées.</p>
                </div>

                <span className="category-count">
                    {fournisseurs.length} fournisseur(s)
                </span>
            </div>

            {erreur && (
                <div className="alert alert-error">{erreur}</div>
            )}

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            <FournisseurForm
                fournisseur={fournisseurActuel}
                onSubmit={enregistrerFournisseur}
                onCancel={() => {
                    setFournisseurActuel(null);
                    setErreur("");
                    setMessage("");
                }}
            />

            <section className="fournisseurs-list-section">
                <h2>Liste des fournisseurs</h2>

                {loading ? (
                    <p>Chargement des fournisseurs...</p>
                ) : (
                    <FournisseurTable
                        fournisseurs={fournisseurs}
                        onEdit={modifierFournisseur}
                        onDelete={supprimerFournisseur}
                        deletingId={deletingId}
                    />
                )}
            </section>
        </div>
    );
}
