
import { useEffect, useState } from "react";
import { getMouvementsStock } from "../api/mouvementsStockApi";
import { getProduits } from "../api/produitsApi";
import MouvementsStockTable from "../components/MouvementsStockTable";
import AjustementStockForm from "../components/AjustementStockForm";

export default function MouvementsStock() {
    const [mouvements, setMouvements] = useState([]);
    const [produits, setProduits] = useState([]);

    const [filtres, setFiltres] = useState({
        produit_id: "",
        type: "",
        date_debut: "",
        date_fin: "",
    });

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");
    const [afficherAjustement, setAfficherAjustement] = useState(false);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
    });

    async function chargerMouvements(criteres = filtres, page = 1) {
        try {
            setLoading(true);
            setErreur("");

            const data = await getMouvementsStock({
                ...criteres,
                page,
            });

            // Laravel paginate() retourne un objet contenant data
            setMouvements(data.data || []);

            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                per_page: data.per_page || 10,
                total: data.total || 0,
                from: data.from ?? null,
                to: data.to ?? null,
            });
        } catch (error) {
            setErreur(error.message || "Erreur de chargement.");
            setMouvements([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        chargerMouvements({});

        getProduits()
            .then((data) => {
                setProduits(
                    Array.isArray(data) ? data : data.data || []
                );
            })
            .catch(() => {
                setErreur("Impossible de charger la liste des produits.");
            });
    }, []);

    function modifierFiltre(e) {
        const { name, value } = e.target;

        setFiltres((ancien) => ({
            ...ancien,
            [name]: value,
        }));
    }

    function rechercher(e) {
        e.preventDefault();
        setMessage("");

        if (
            filtres.date_debut &&
            filtres.date_fin &&
            filtres.date_debut > filtres.date_fin
        ) {
            setErreur(
                "La date de début doit précéder la date de fin."
            );
            return;
        }

        chargerMouvements(filtres, 1);
    }

    function reinitialiser() {
        const vides = {
            produit_id: "",
            type: "",
            date_debut: "",
            date_fin: "",
        };

        setFiltres(vides);
        setMessage("");
        setErreur("");
        chargerMouvements(vides, 1);
    }

    async function terminerAjustement() {
        setAfficherAjustement(false);
        setMessage("Stock ajusté avec succès.");
        setErreur("");

        // Recharger le tableau et les quantités des produits
        await chargerMouvements(filtres, pagination.current_page);

        try {
            const data = await getProduits();
            setProduits(
                Array.isArray(data) ? data : data.data || []
            );
        } catch {
            // Le tableau des mouvements reste consultable.
        }
    }

    return (
        <div className="mouvements-page">
            <div className="mouvements-header">
                <div>
                    <h1>Historique des mouvements</h1>
                    <p>
                        Consulte les entrées, sorties et ajustements
                        du stock.
                    </p>
                </div>

                <div className="mouvements-header-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                            chargerMouvements(filtres, pagination.current_page)
                        }
                        disabled={loading}
                    >
                        Actualiser
                    </button>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            setAfficherAjustement((ancien) => !ancien);
                            setMessage("");
                            setErreur("");
                        }}
                    >
                        {afficherAjustement
                            ? "Fermer l'ajustement"
                            : "Ajuster le stock"}
                    </button>
                </div>
            </div>

            {afficherAjustement && (
                <AjustementStockForm
                    produits={produits}
                    onSuccess={terminerAjustement}
                    onCancel={() => setAfficherAjustement(false)}
                />
            )}

            {message && (
                <div className="ajustement-succes">
                    {message}
                </div>
            )}

            <form
                className="mouvements-filtres"
                onSubmit={rechercher}
            >
                <div className="mouvement-champ">
                    <label htmlFor="produit_id">Produit</label>

                    <select
                        id="produit_id"
                        name="produit_id"
                        value={filtres.produit_id}
                        onChange={modifierFiltre}
                    >
                        <option value="">Tous les produits</option>

                        {produits.map((produit) => (
                            <option
                                key={produit.id_prd}
                                value={produit.id_prd}
                            >
                                {produit.ref_prd
                                    ? `${produit.ref_prd} - `
                                    : ""}
                                {produit.nom_prd}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mouvement-champ">
                    <label htmlFor="type">Type de mouvement</label>

                    <select
                        id="type"
                        name="type"
                        value={filtres.type}
                        onChange={modifierFiltre}
                    >
                        <option value="">Tous les types</option>
                        <option value="entree">Entrée</option>
                        <option value="sortie">Sortie</option>
                        <option value="ajustement">Ajustement</option>
                    </select>
                </div>

                <div className="mouvement-champ">
                    <label htmlFor="date_debut">Date de début</label>

                    <input
                        id="date_debut"
                        type="date"
                        name="date_debut"
                        value={filtres.date_debut}
                        onChange={modifierFiltre}
                    />
                </div>

                <div className="mouvement-champ">
                    <label htmlFor="date_fin">Date de fin</label>

                    <input
                        id="date_fin"
                        type="date"
                        name="date_fin"
                        value={filtres.date_fin}
                        onChange={modifierFiltre}
                    />
                </div>

                <div className="mouvements-actions">
                    <button type="submit" className="btn-primary">
                        Rechercher
                    </button>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={reinitialiser}
                    >
                        Réinitialiser
                    </button>
                </div>
            </form>

            {erreur && (
                <div className="mouvement-erreur">
                    {erreur}
                </div>
            )}

            <div className="mouvements-resume">
                <span>
                    Nombre total de mouvements :{" "}
                    <strong>{pagination.total}</strong>
                </span>
            </div>

            <MouvementsStockTable
                mouvements={mouvements}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => chargerMouvements(filtres, page)}
            />
        </div>
    );
}


