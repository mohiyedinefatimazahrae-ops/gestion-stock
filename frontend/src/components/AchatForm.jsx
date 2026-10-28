import { useEffect, useState } from "react";

const emptyLine = () => ({
    produit_id: "",
    qte: "1",
    pu: "",
    remise: "0",
    tva_pourcentage: "20",
});

export default function AchatForm({
    fournisseurs = [],
    produits = [],
    achat = null,
    onSubmit,
    onCancel,
    loading = false,
}) {
    const [fournisseurId, setFournisseurId] = useState("");
    const [dateAchat, setDateAchat] = useState("");
    const [numeroFacture, setNumeroFacture] = useState("");
    const [numAchat, setNumAchat] = useState("");
    const [notes, setNotes] = useState("");
    const [facture, setFacture] = useState(null);
    const [lignes, setLignes] = useState([emptyLine()]);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        setErreur("");
        setFacture(null);

        if (achat) {
            setFournisseurId(
                String(achat.fournisseur_id ?? "")
            );

            setDateAchat(
                String(achat.date_achat ?? "").slice(0, 10)
            );

            setNumeroFacture(achat.numero_facture ?? "");
            setNumAchat(achat.num_achat ?? "");
            setNotes(achat.notes ?? "");

            setLignes(
                (achat.details || []).map((detail) => ({
                    id: detail.id,
                    produit_id: String(
                        detail.produit_id ??
                        detail.produit?.id_prd ??
                        ""
                    ),
                    qte: String(detail.qte ?? "1"),
                    pu: String(detail.pu ?? ""),
                    remise: String(detail.remise ?? "0"),
                    tva_pourcentage: String(
                        detail.tva_pourcentage ?? "20"
                    ),
                }))
            );
        } else {
            setFournisseurId("");
            setDateAchat(new Date().toISOString().slice(0, 10));
            setNumeroFacture("");
            setNumAchat("");
            setNotes("");
            setLignes([emptyLine()]);
        }
    }, [achat]);

    function modifierChamp(setter, value) {
        setter(value);
    }

    function modifierLigne(index, field, value) {
        setLignes((anciennes) =>
            anciennes.map((ligne, i) => {
                if (i !== index) return ligne;

                const nouvelle = { ...ligne, [field]: value };

                if (field === "produit_id") {
                    const produit = produits.find(
                        (p) => String(p.id_prd) === String(value)
                    );

                    nouvelle.pu = produit
                        ? String(produit.prix_achat ?? 0)
                        : "";
                }

                return nouvelle;
            })
        );
    }

    function ajouterLigne() {
        setLignes((anciennes) => [...anciennes, emptyLine()]);
    }

    function supprimerLigne(index) {
        setLignes((anciennes) =>
            anciennes.filter((_, i) => i !== index)
        );
    }

    const totaux = lignes.reduce(
        (total, ligne) => {
            const brut =
                Number(ligne.qte || 0) * Number(ligne.pu || 0);

            const ht =
                brut * (1 - Number(ligne.remise || 0) / 100);

            const tva =
                ht * Number(ligne.tva_pourcentage || 0) / 100;

            total.ht += ht;
            total.tva += tva;

            return total;
        },
        { ht: 0, tva: 0 }
    );

    const money = (value) =>
        `${Number(value).toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} DH`;

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur("");

        if (!fournisseurId) {
            setErreur("Choisis un fournisseur.");
            return;
        }

        if (!numAchat.trim()) {
            setErreur("Saisis le numéro de l'achat.");
            return;
        }

        if (!dateAchat) {
            setErreur("Choisis la date d'achat.");
            return;
        }

        if (lignes.length === 0) {
            setErreur("Ajoute au moins un produit.");
            return;
        }

        const details = lignes.map((ligne) => ({
            ...(ligne.id ? { id: ligne.id } : {}),
            produit_id: Number(ligne.produit_id),
            qte: Number(ligne.qte),
            pu: Number(ligne.pu),
            remise: Number(ligne.remise || 0),
            tva_pourcentage: Number(
                ligne.tva_pourcentage || 0
            ),
        }));

        const ligneInvalide = details.some(
            (ligne) =>
                !ligne.produit_id ||
                !Number.isFinite(ligne.qte) ||
                ligne.qte <= 0 ||
                !Number.isFinite(ligne.pu) ||
                ligne.pu < 0 ||
                !Number.isFinite(ligne.remise) ||
                ligne.remise < 0 ||
                ligne.remise > 100 ||
                !Number.isFinite(ligne.tva_pourcentage) ||
                ligne.tva_pourcentage < 0 ||
                ligne.tva_pourcentage > 100
        );

        if (ligneInvalide) {
            setErreur(
                "Vérifie les produits, quantités, prix, remises et TVA."
            );
            return;
        }

        const header = new FormData();

        header.append("num_achat", numAchat.trim());
        header.append("fournisseur_id", fournisseurId);
        header.append("date_achat", dateAchat);
        header.append("numero_facture", numeroFacture);
        header.append("notes", notes);

        if (facture) {
            header.append("img_facture", facture);
        }

        try {
            await onSubmit({ header, details });
        } catch (error) {
            setErreur(
                error.message || "Une erreur est survenue."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="achat-form">
            <h2>
                {achat
                    ? `Modifier ${achat.num_achat}`
                    : "Nouvel achat"}
            </h2>

            <div className="form-grid">
                <label>
                    Numéro d'achat *
                    <input
                        value={numAchat}
                        onChange={(e) =>
                            modifierChamp(setNumAchat, e.target.value)
                        }
                        placeholder="ACH-2026-001"
                        maxLength={50}
                        required
                    />
                </label>

                <label>
                    Fournisseur *
                    <select
                        value={fournisseurId}
                        onChange={(e) =>
                            modifierChamp(
                                setFournisseurId,
                                e.target.value
                            )
                        }
                        required
                    >
                        <option value="">Choisir un fournisseur</option>
                        {fournisseurs.map((f) => (
                            <option key={f.id_frn} value={f.id_frn}>
                                {f.nom_frn}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Date d'achat *
                    <input
                        type="date"
                        value={dateAchat}
                        onChange={(e) =>
                            modifierChamp(setDateAchat, e.target.value)
                        }
                        required
                    />
                </label>

                <label>
                    Numéro de facture
                    <input
                        value={numeroFacture}
                        onChange={(e) =>
                            modifierChamp(
                                setNumeroFacture,
                                e.target.value
                            )
                        }
                        maxLength={100}
                    />
                </label>

                <label>
                    {achat
                        ? "Remplacer la facture (facultatif)"
                        : "Image de la facture"}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            setFacture(e.target.files?.[0] || null)
                        }
                    />
                </label>

                <label>
                    Notes
                    <textarea
                        value={notes}
                        onChange={(e) =>
                            modifierChamp(setNotes, e.target.value)
                        }
                        rows={2}
                    />
                </label>
            </div>

            <hr />

            <h3>Produits achetés</h3>

            {lignes.map((ligne, index) => {
                const brut =
                    Number(ligne.qte || 0) *
                    Number(ligne.pu || 0);

                const ht =
                    brut * (1 - Number(ligne.remise || 0) / 100);

                return (
                    <div className="achat-line" key={ligne.id ?? index}>
                        <label>
                            Produit *
                            <select
                                value={ligne.produit_id}
                                onChange={(e) =>
                                    modifierLigne(
                                        index,
                                        "produit_id",
                                        e.target.value
                                    )
                                }
                                required
                            >
                                <option value="">Choisir un produit</option>
                                {produits.map((p) => (
                                    <option
                                        key={p.id_prd}
                                        value={p.id_prd}
                                    >
                                        {p.nom_prd} — {p.ref_prd}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Quantité *
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={ligne.qte}
                                onChange={(e) =>
                                    modifierLigne(
                                        index,
                                        "qte",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label>
                            Prix unitaire (DH) *
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={ligne.pu}
                                onChange={(e) =>
                                    modifierLigne(
                                        index,
                                        "pu",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label>
                            Remise (%)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={ligne.remise}
                                onChange={(e) =>
                                    modifierLigne(
                                        index,
                                        "remise",
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            TVA (%)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={ligne.tva_pourcentage}
                                onChange={(e) =>
                                    modifierLigne(
                                        index,
                                        "tva_pourcentage",
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <p>
                            <strong>HT après remise :</strong>{" "}
                            {money(ht)}
                        </p>

                        <button
                            type="button"
                            className="btn-danger"
                            onClick={() => supprimerLigne(index)}
                            disabled={lignes.length === 1 || loading}
                        >
                            Supprimer la ligne
                        </button>
                    </div>
                );
            })}

            <button
                type="button"
                className="btn-secondary"
                onClick={ajouterLigne}
                disabled={loading}
            >
                + Ajouter un produit
            </button>

            <div className="achat-totals">
                <p>
                    Total HT : <strong>{money(totaux.ht)}</strong>
                </p>
                <p>
                    TVA : <strong>{money(totaux.tva)}</strong>
                </p>
                <p>
                    Total TTC :{" "}
                    <strong>{money(totaux.ht + totaux.tva)}</strong>
                </p>
            </div>

            {erreur && (
                <p role="alert" className="error-message">
                    {erreur}
                </p>
            )}

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading
                        ? "Enregistrement..."
                        : achat
                          ? "Enregistrer les modifications"
                          : "Créer l'achat"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
}