
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

    async function chargerMouvements(criteres = filtres) {
        try {
            setLoading(true);
            setErreur("");

            const data = await getMouvementsStock(criteres);

            setMouvements(
                Array.isArray(data) ? data : data.data || []
            );
        } catch (error) {
            setErreur(error.message || "Erreur de chargement.");
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

        chargerMouvements(filtres);
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
        chargerMouvements(vides);
    }

    async function terminerAjustement() {
        setAfficherAjustement(false);
        setMessage("Stock ajusté avec succès.");
        setErreur("");

        // Recharger le tableau et les quantités des produits
        await chargerMouvements(filtres);

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
                        onClick={() => chargerMouvements()}
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
                    Nombre de mouvements :{" "}
                    <strong>{mouvements.length}</strong>
                </span>
            </div>

            <MouvementsStockTable
                mouvements={mouvements}
                loading={loading}
            />
        </div>
    );
}


// import { useEffect, useState } from "react";
// import { getMouvementsStock } from "../api/mouvementsStockApi";
// import { ajusterStock } from "../api/mouvementsStockApi";
// import { getProduits } from "../api/produitsApi";

// export default function MouvementsStock() {
//     const [mouvements, setMouvements] = useState([]);
//     const [produits, setProduits] = useState([]);

//     const [filtres, setFiltres] = useState({
//         produit_id: "",
//         type: "",
//         date_debut: "",
//         date_fin: "",
//     });

//     const [loading, setLoading] = useState(true);
//     const [erreur, setErreur] = useState("");

//     const [ajustement, setAjustement] = useState({
//     produit_id: "",
//     qte_stock: "",
//     motif: "Correction après inventaire",
//     });

//     const [message, setMessage] = useState("");
//     const [enregistrement, setEnregistrement] = useState(false);

//     async function chargerMouvements(criteres = filtres) {
//         try {
//             setLoading(true);
//             setErreur("");

//             const data = await getMouvementsStock(criteres);

//             setMouvements(
//                 Array.isArray(data) ? data : data.data || []
//             );
//         } catch (error) {
//             setErreur(error.message || "Erreur de chargement.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         chargerMouvements({});

//         getProduits()
//             .then((data) => {
//                 setProduits(
//                     Array.isArray(data) ? data : data.data || []
//                 );
//             })
//             .catch(() => {
//                 // L'historique peut toujours être affiché
//                 // si le chargement des produits échoue.
//             });
//     }, []);

//     function modifierFiltre(e) {
//         const { name, value } = e.target;

//         setFiltres((ancien) => ({
//             ...ancien,
//             [name]: value,
//         }));
//     }

//     function rechercher(e) {
//         e.preventDefault();

//         if (
//             filtres.date_debut &&
//             filtres.date_fin &&
//             filtres.date_debut > filtres.date_fin
//         ) {
//             setErreur(
//                 "La date de début doit précéder la date de fin."
//             );
//             return;
//         }

//         chargerMouvements(filtres);
//     }

//     function reinitialiser() {
//         const vides = {
//             produit_id: "",
//             type: "",
//             date_debut: "",
//             date_fin: "",
//         };

//         setFiltres(vides);
//         chargerMouvements(vides);
//     }

//     function formaterDate(date) {
//         if (!date) return "—";

//         const valeur = new Date(date);

//         if (Number.isNaN(valeur.getTime())) return "—";

//         return valeur.toLocaleString("fr-FR", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//         });
//     }

//     function afficherNombre(valeur) {
//         if (valeur === null || valeur === undefined) return "—";

//         return Number(valeur).toLocaleString("fr-FR", {
//             maximumFractionDigits: 3,
//         });
//     }

//     function afficherPrix(valeur) {
//         if (valeur === null || valeur === undefined) return "—";

//         return `${Number(valeur).toLocaleString("fr-FR", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         })} DH`;
//     }

//     function libelleType(type) {
//         const types = {
//             entree: "Entrée",
//             sortie: "Sortie",
//             ajustement: "Ajustement",
//         };

//         return types[type] || type || "—";
//     }

    
//     async function enregistrerAjustement(e) {
//         e.preventDefault();

//         setMessage("");
//         setErreur("");

//         try {
//             setEnregistrement(true);

//             await ajusterStock({
//                 produit_id: Number(ajustement.produit_id),
//                 qte_stock: Number(ajustement.qte_stock),
//                 motif: ajustement.motif.trim(),
//             });

//             setMessage("Stock ajusté avec succès.");

//             setAjustement({
//                 produit_id: "",
//                 qte_stock: "",
//                 motif: "Correction après inventaire",
//             });

//             await chargerMouvements();
//         } catch (error) {
//             setErreur(error.message || "Erreur lors de l'ajustement.");
//         } finally {
//             setEnregistrement(false);
//         }
//     }


//     return (
//         <div className="mouvements-page">
//             <div className="mouvements-header">
//                 <div>
//                     <h1>Historique des mouvements</h1>
//                     <p>
//                         Consulte les entrées, sorties et ajustements
//                         du stock.
//                     </p>
//                 </div>

//                 <button
//                     type="button"
//                     className="btn-secondary"
//                     onClick={() => chargerMouvements()}
//                     disabled={loading}
//                 >
//                     Actualiser
//                 </button>
//             </div>

            
//             <section className="ajustement-card">
//                 <h2>Ajustement manuel du stock</h2>
//                 <p>
//                     Sélectionne le produit et sa quantité réelle après inventaire.
//                 </p>
                
//                 <form onSubmit={enregistrerAjustement}>
//                     <div className="ajustement-grid">
//                         <div className="mouvement-champ">
//                             <label htmlFor="ajust-produit">Produit</label>
                
//                             <select
//                                 id="ajust-produit"
//                                 value={ajustement.produit_id}
//                                 onChange={(e) =>
//                                     setAjustement({
//                                         ...ajustement,
//                                         produit_id: e.target.value,
//                                     })
//                                 }
//                                 required
//                             >
//                                 <option value="">Choisir un produit</option>
                            
//                                 {produits.map((produit) => (
//                                     <option
//                                         key={produit.id_prd}
//                                         value={produit.id_prd}
//                                     >
//                                         {produit.nom_prd} — Stock actuel :{" "}
//                                         {produit.qte_stock}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
                            
//                         <div className="mouvement-champ">
//                             <label htmlFor="ajust-qte">
//                                 Quantité réelle après inventaire
//                             </label>
                            
//                             <input
//                                 id="ajust-qte"
//                                 type="number"
//                                 min="0"
//                                 step="0.001"
//                                 value={ajustement.qte_stock}
//                                 onChange={(e) =>
//                                     setAjustement({
//                                         ...ajustement,
//                                         qte_stock: e.target.value,
//                                     })
//                                 }
//                                 placeholder="Ex. 22"
//                                 required
//                             />
//                         </div>
                            
//                         <div className="mouvement-champ">
//                             <label htmlFor="ajust-motif">Motif</label>
                            
//                             <input
//                                 id="ajust-motif"
//                                 type="text"
//                                 maxLength="150"
//                                 value={ajustement.motif}
//                                 onChange={(e) =>
//                                     setAjustement({
//                                         ...ajustement,
//                                         motif: e.target.value,
//                                     })
//                                 }
//                                 placeholder="Ex. Correction après inventaire"
//                                 required
//                             />
//                         </div>
//                     </div>
                            
//                     <button
//                         type="submit"
//                         className="btn-primary"
//                         disabled={enregistrement}
//                     >
//                         {enregistrement
//                             ? "Enregistrement..."
//                             : "Enregistrer l'ajustement"}
//                     </button>
//                 </form>
//             </section>
                        
//             {message && (
//                 <div className="ajustement-succes">{message}</div>
//             )}


//             <form className="mouvements-filtres" onSubmit={rechercher}>
//                 <div className="mouvement-champ">
//                     <label htmlFor="produit_id">Produit</label>

//                     <select
//                         id="produit_id"
//                         name="produit_id"
//                         value={filtres.produit_id}
//                         onChange={modifierFiltre}
//                     >
//                         <option value="">Tous les produits</option>

//                         {produits.map((produit) => (
//                             <option
//                                 key={produit.id_prd}
//                                 value={produit.id_prd}
//                             >
//                                 {produit.ref_prd
//                                     ? `${produit.ref_prd} - `
//                                     : ""}
//                                 {produit.nom_prd}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="mouvement-champ">
//                     <label htmlFor="type">Type de mouvement</label>

//                     <select
//                         id="type"
//                         name="type"
//                         value={filtres.type}
//                         onChange={modifierFiltre}
//                     >
//                         <option value="">Tous les types</option>
//                         <option value="entree">Entrée</option>
//                         <option value="sortie">Sortie</option>
//                         <option value="ajustement">Ajustement</option>
//                     </select>
//                 </div>

//                 <div className="mouvement-champ">
//                     <label htmlFor="date_debut">Date de début</label>

//                     <input
//                         id="date_debut"
//                         type="date"
//                         name="date_debut"
//                         value={filtres.date_debut}
//                         onChange={modifierFiltre}
//                     />
//                 </div>

//                 <div className="mouvement-champ">
//                     <label htmlFor="date_fin">Date de fin</label>

//                     <input
//                         id="date_fin"
//                         type="date"
//                         name="date_fin"
//                         value={filtres.date_fin}
//                         onChange={modifierFiltre}
//                     />
//                 </div>

//                 <div className="mouvements-actions">
//                     <button type="submit" className="btn-primary">
//                         Rechercher
//                     </button>

//                     <button
//                         type="button"
//                         className="btn-secondary"
//                         onClick={reinitialiser}
//                     >
//                         Réinitialiser
//                     </button>
//                 </div>
//             </form>

//             {erreur && (
//                 <div className="mouvement-erreur">{erreur}</div>
//             )}

//             <div className="mouvements-resume">
//                 <span>
//                     Nombre de mouvements : <strong>{mouvements.length}</strong>
//                 </span>
//             </div>

//             <div className="mouvements-table-wrapper">
//                 <table className="mouvements-table">
//                     <thead>
//                         <tr>
//                             <th>Date</th>
//                             <th>Référence</th>
//                             <th>Produit</th>
//                             <th>Type</th>
//                             <th>Quantité</th>
//                             <th>Stock avant</th>
//                             <th>Stock après</th>
//                             <th>Prix unitaire</th>
//                             <th>Motif</th>
//                             <th>Document lié</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan="10" className="mouvement-vide">
//                                     Chargement...
//                                 </td>
//                             </tr>
//                         ) : mouvements.length === 0 ? (
//                             <tr>
//                                 <td colSpan="10" className="mouvement-vide">
//                                     Aucun mouvement trouvé.
//                                 </td>
//                             </tr>
//                         ) : (
//                             mouvements.map((mouvement) => (
//                                 <tr key={mouvement.id_mouvement}>
//                                     <td>
//                                         {formaterDate(mouvement.date_mouvement)}
//                                     </td>

//                                     <td>#{mouvement.id_mouvement}</td>

//                                     <td>
//                                         <strong>
//                                             {mouvement.produit?.nom_prd || "Produit inconnu"}
//                                         </strong>
//                                         <small className="mouvement-reference">
//                                             {mouvement.produit?.ref_prd || ""}
//                                         </small>
//                                     </td>

//                                     <td>
//                                         <span
//                                             className={`mouvement-badge ${mouvement.type || ""}`}
//                                         >
//                                             {libelleType(mouvement.type)}
//                                         </span>
//                                     </td>

//                                     <td>{afficherNombre(mouvement.qte)}</td>

//                                     <td>{afficherNombre(mouvement.qte_avant)}</td>

//                                     <td>{afficherNombre(mouvement.qte_apres)}</td>

//                                     <td>{afficherPrix(mouvement.pu)}</td>

//                                     <td>{mouvement.motif || "—"}</td>

//                                     <td>
//                                         {mouvement.achat_id
//                                             ? `Achat #${mouvement.achat_id}`
//                                             : mouvement.production_id
//                                                 ? `Production #${mouvement.production_id}`
//                                                 : "—"}
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
