
import { useState } from "react";
import { ajusterStock } from "../api/mouvementsStockApi";

export default function AjustementStockForm({
    produits,
    onSuccess,
    onError,
    onCancel,
}) {
    const [ajustement, setAjustement] = useState({
        produit_id: "",
        qte_stock: "",
        motif: "Correction après inventaire",
    });

    const [enregistrement, setEnregistrement] = useState(false);
    const [erreur, setErreur] = useState("");

    async function enregistrer(e) {
        e.preventDefault();
        setErreur("");

        if (
            ajustement.produit_id === "" ||
            ajustement.qte_stock === "" ||
            Number(ajustement.qte_stock) < 0 ||
            !ajustement.motif.trim()
        ) {
            setErreur("Vérifie les informations saisies.");
            return;
        }

        try {
            setEnregistrement(true);

            await ajusterStock({
                produit_id: Number(ajustement.produit_id),
                qte_stock: Number(ajustement.qte_stock),
                motif: ajustement.motif.trim(),
            });

            setAjustement({
                produit_id: "",
                qte_stock: "",
                motif: "Correction après inventaire",
            });

            onSuccess?.();
        } catch (error) {
            setErreur(
                error.message || "Erreur lors de l'ajustement."
            );
        } finally {
            setEnregistrement(false);
        }
    }

    const produitSelectionne = produits.find(
        (produit) =>
            String(produit.id_prd) === ajustement.produit_id
    );

    return (
        <section className="ajustement-card">
            <div className="ajustement-heading">
                <div>
                    <h2>Ajustement manuel du stock</h2>
                    <p>
                        Saisis la quantité réellement constatée
                        après l'inventaire.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onCancel}
                >
                    Fermer
                </button>
            </div>

            {erreur && (
                <div className="mouvement-erreur">
                    {erreur}
                </div>
            )}

            <form onSubmit={enregistrer}>
                <div className="ajustement-grid">
                    <div className="mouvement-champ">
                        <label htmlFor="ajust-produit">
                            Produit
                        </label>

                        <select
                            id="ajust-produit"
                            value={ajustement.produit_id}
                            onChange={(e) =>
                                setAjustement({
                                    ...ajustement,
                                    produit_id: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">
                                Choisir un produit
                            </option>

                            {produits.map((produit) => (
                                <option
                                    key={produit.id_prd}
                                    value={produit.id_prd}
                                >
                                    {produit.nom_prd} — Stock actuel :{" "}
                                    {produit.qte_stock}
                                </option>
                            ))}
                        </select>

                        {produitSelectionne && (
                            <small className="ajustement-stock-actuel">
                                Stock actuel :{" "}
                                {produitSelectionne.qte_stock}
                            </small>
                        )}
                    </div>

                    <div className="mouvement-champ">
                        <label htmlFor="ajust-qte">
                            Quantité réelle après inventaire
                        </label>

                        <input
                            id="ajust-qte"
                            type="number"
                            min="0"
                            step="0.001"
                            value={ajustement.qte_stock}
                            onChange={(e) =>
                                setAjustement({
                                    ...ajustement,
                                    qte_stock: e.target.value,
                                })
                            }
                            placeholder="Ex. 22"
                            required
                        />
                    </div>

                    <div className="mouvement-champ">
                        <label htmlFor="ajust-motif">
                            Motif
                        </label>

                        <input
                            id="ajust-motif"
                            type="text"
                            maxLength="150"
                            value={ajustement.motif}
                            onChange={(e) =>
                                setAjustement({
                                    ...ajustement,
                                    motif: e.target.value,
                                })
                            }
                            placeholder="Ex. Correction après inventaire"
                            required
                        />
                    </div>
                </div>

                <div className="ajustement-actions">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={enregistrement}
                    >
                        {enregistrement
                            ? "Enregistrement..."
                            : "Enregistrer l'ajustement"}
                    </button>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={enregistrement}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </section>
    );
}
