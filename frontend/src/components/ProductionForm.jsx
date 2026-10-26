
import { useEffect, useState } from "react";

const initialForm = {
    ref_production: "",
    client_nom: "",
    client_tel: "",
    details_commande: "",
    date_commande: new Date().toISOString().slice(0, 10),
    date_livraison: "",
    prix_total: "0",
    prix_avance: "0",
    produit_fini_id: "",
    qte_produite: "1",
    notes: "",
};

export default function ProductionForm({
    production,
    produits = [],
    onSubmit,
    onCancel,
    loading = false,
}) {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");

    useEffect(() => {
        if (production) {
            setForm({
                ref_production: production.ref_production ?? "",
                client_nom: production.client_nom ?? "",
                client_tel: production.client_tel ?? "",
                details_commande: production.details_commande ?? "",
                date_commande: production.date_commande?.slice(0, 10) ??
                    new Date().toISOString().slice(0, 10),
                date_livraison: production.date_livraison?.slice(0, 10) ?? "",
                prix_total: String(production.prix_total ?? 0),
                prix_avance: String(production.prix_avance ?? 0),
                produit_fini_id: String(production.produit_fini_id ?? ""),
                qte_produite: String(production.qte_produite ?? 1),
                notes: production.notes ?? "",
            });
        } else {
            setForm(initialForm);
        }

        setError("");
    }, [production]);

    const produitsFinis = produits.filter(
        (produit) => produit.type === "produit_fini"
    );

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (Number(form.prix_avance) > Number(form.prix_total)) {
            setError("L’avance ne peut pas dépasser le prix total.");
            return;
        }

        if (!form.produit_fini_id) {
            setError("Choisis le produit fini à fabriquer.");
            return;
        }

        try {
            await onSubmit({
                ...form,
                date_livraison: form.date_livraison || null,
                prix_total: Number(form.prix_total),
                prix_avance: Number(form.prix_avance),
                produit_fini_id: Number(form.produit_fini_id),
                qte_produite: Number(form.qte_produite),
            });
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
        }
    }

    return (
        <form className="production-form" onSubmit={handleSubmit}>
            <div className="production-form-heading">
                <div>
                    <h2>{production ? "Modifier la production" : "Nouvelle production"}</h2>
                    <p>Informations de la commande et du produit à fabriquer</p>
                </div>
            </div>

            {error && <div className="production-alert">{error}</div>}

            <div className="production-form-grid">
                <label>
                    Référence *
                    <input
                        name="ref_production"
                        value={form.ref_production}
                        onChange={handleChange}
                        maxLength="50"
                        required
                    />
                </label>

                <label>
                    Nom du client *
                    <input
                        name="client_nom"
                        value={form.client_nom}
                        onChange={handleChange}
                        maxLength="150"
                        required
                    />
                </label>

                <label>
                    Téléphone
                    <input
                        name="client_tel"
                        value={form.client_tel}
                        onChange={handleChange}
                        maxLength="30"
                    />
                </label>

                <label>
                    Date de commande *
                    <input
                        type="date"
                        name="date_commande"
                        value={form.date_commande}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Date de livraison prévue
                    <input
                        type="date"
                        name="date_livraison"
                        value={form.date_livraison}
                        onChange={handleChange}
                        min={form.date_commande}
                    />
                </label>

                <label>
                    Produit fini à fabriquer *
                    <select
                        name="produit_fini_id"
                        value={form.produit_fini_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Choisir un produit --</option>
                        {produitsFinis.map((produit) => (
                            <option key={produit.id_prd} value={produit.id_prd}>
                                {produit.nom_prd} ({produit.ref_prd})
                            </option>
                        ))}
                    </select>
                    {produitsFinis.length === 0 && (
                        <small className="production-help">
                            Ajoute d’abord un produit de type « produit fini ».
                        </small>
                    )}
                </label>

                <label>
                    Quantité à produire *
                    <input
                        type="number"
                        name="qte_produite"
                        value={form.qte_produite}
                        onChange={handleChange}
                        min="0.001"
                        step="0.001"
                        required
                    />
                </label>

                <label>
                    Prix total (DH) *
                    <input
                        type="number"
                        name="prix_total"
                        value={form.prix_total}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </label>

                <label>
                    Avance (DH) *
                    <input
                        type="number"
                        name="prix_avance"
                        value={form.prix_avance}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />
                </label>

                <label className="production-full-width">
                    Détails de la commande
                    <textarea
                        name="details_commande"
                        value={form.details_commande}
                        onChange={handleChange}
                        rows="3"
                    />
                </label>

                <label className="production-full-width">
                    Notes
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows="2"
                    />
                </label>
            </div>

            <div className="production-form-actions">
                <button
                    type="button"
                    className="production-btn production-btn-secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    className="production-btn production-btn-primary"
                    disabled={loading || produitsFinis.length === 0}
                >
                    {loading
                        ? "Enregistrement..."
                        : production
                            ? "Enregistrer les modifications"
                            : "Créer la production"}
                </button>
            </div>
        </form>
    );
}
