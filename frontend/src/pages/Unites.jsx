
import { useCallback, useEffect, useState } from "react";
import {
    getUnites,
    createUnite,
    updateUnite,
    deleteUnite,
} from "../api/unitesApi";

import UniteForm from "../components/UniteForm";
import UniteTable from "../components/UniteTable";

export default function Unites() {
    const [unites, setUnites] = useState([]);
    const [uniteEnCours, setUniteEnCours] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const chargerUnites = useCallback(async () => {
        setLoading(true);
        setErreur("");

        try {
            const data = await getUnites();
            setUnites(data);
        } catch (error) {
            setErreur(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        chargerUnites();
    }, [chargerUnites]);

    async function enregistrerUnite(data) {
        setErreur("");
        setMessage("");

        if (uniteEnCours) {
            await updateUnite(uniteEnCours.id_unt, data);
            setMessage("Unité modifiée avec succès.");
        } else {
            await createUnite(data);
            setMessage("Unité ajoutée avec succès.");
        }

        setUniteEnCours(null);
        await chargerUnites();
    }

    function modifierUnite(unite) {
        setMessage("");
        setErreur("");
        setUniteEnCours(unite);
    }

    async function supprimerUnite(unite) {
        const confirmer = window.confirm(
            `Voulez-vous vraiment supprimer l'unité "${unite.nom_unt}" ?`
        );

        if (!confirmer) return;

        setErreur("");
        setMessage("");
        setDeletingId(unite.id_unt);

        try {
            await deleteUnite(unite.id_unt);
            setMessage("Unité supprimée avec succès.");

            if (uniteEnCours?.id_unt === unite.id_unt) {
                setUniteEnCours(null);
            }

            await chargerUnites();
        } catch (error) {
            setErreur(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    function annulerModification() {
        setUniteEnCours(null);
        setErreur("");
        setMessage("");
    }

    return (
        <div className="page-content">
            <h1>Gestion des unités</h1>
            <p>Ajouter, modifier et gérer les unités de mesure.</p>

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

            <UniteForm
                unite={uniteEnCours}
                onSubmit={enregistrerUnite}
                onCancel={annulerModification}
            />

            {loading ? (
                <p>Chargement des unités...</p>
            ) : (
                <UniteTable
                    unites={unites}
                    onEdit={modifierUnite}
                    onDelete={supprimerUnite}
                    deletingId={deletingId}
                />
            )}
        </div>
    );
}
