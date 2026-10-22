
import { useEffect, useState } from "react";

const initialForm = {
    ref_prd: "",
    nom_prd: "",
    desc_prd: "",
    categorie_id: "",
    unite_id: "",
    type: "matiere_premiere",
    marque: "",
    code_barres: "",
    qte_stock: "0",
    qte_min: "0",
    prix_achat: "0",
    date_peremption: "",
    actif: "1",
};

const API_BASE = "http://127.0.0.1:8000";

export default function ProduitForm({
    produit,
    categories,
    unites,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(initialForm);
    const [image, setImage] = useState(null);
    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (produit) {
            setForm({
                ref_prd: produit.ref_prd ?? "",
                nom_prd: produit.nom_prd ?? "",
                desc_prd: produit.desc_prd ?? "",
                categorie_id: String(produit.categorie_id ?? ""),
                unite_id: String(produit.unite_id ?? ""),
                type: produit.type ?? "matiere_premiere",
                marque: produit.marque ?? "",
                code_barres: produit.code_barres ?? "",
                qte_stock: String(produit.qte_stock ?? "0"),
                qte_min: String(produit.qte_min ?? "0"),
                prix_achat: String(produit.prix_achat ?? "0"),
                date_peremption: produit.date_peremption
                    ? String(produit.date_peremption).slice(0, 10)
                    : "",
                actif: produit.actif ? "1" : "0",
            });
        } else {
            setForm({ ...initialForm });
        }

        setImage(null);
        setErreur("");
    }, [produit]);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur("");

        if (!form.categorie_id || !form.unite_id) {
            setErreur("Choisis une catégorie et une unité.");
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        if (image) {
            formData.append("img_prd", image);
        }

        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (error) {
            setErreur(error.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-card produit-form">
            <h2>
                {produit ? "Modifier le produit" : "Ajouter un produit"}
            </h2>

            {erreur && (
                <div className="alert alert-error">
                    {erreur}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="produit-form-grid">
                    <div className="form-group">
                        <label htmlFor="ref_prd">Référence *</label>
                        <input
                            id="ref_prd"
                            name="ref_prd"
                            value={form.ref_prd}
                            onChange={handleChange}
                            maxLength={50}
                            placeholder="Ex. TON-001"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nom_prd">Nom du produit *</label>
                        <input
                            id="nom_prd"
                            name="nom_prd"
                            value={form.nom_prd}
                            onChange={handleChange}
                            maxLength={150}
                            placeholder="Ex. Toner HP"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="categorie_id">Catégorie *</label>
                        <select
                            id="categorie_id"
                            name="categorie_id"
                            value={form.categorie_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Choisir une catégorie --</option>

                            {categories.map((categorie) => (
                                <option
                                    key={categorie.id_cat}
                                    value={categorie.id_cat}
                                >
                                    {categorie.nom_cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="unite_id">Unité *</label>
                        <select
                            id="unite_id"
                            name="unite_id"
                            value={form.unite_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Choisir une unité --</option>

                            {unites.map((unite) => (
                                <option
                                    key={unite.id_unt}
                                    value={unite.id_unt}
                                >
                                    {unite.nom_unt}
                                    {unite.symbole ? ` (${unite.symbole})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type de produit *</label>
                        <select
                            id="type"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="matiere_premiere">
                                Matière première
                            </option>
                            <option value="produit_fini">
                                Produit fini
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="marque">Marque</label>
                        <input
                            id="marque"
                            name="marque"
                            value={form.marque}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Ex. HP"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="code_barres">Code-barres</label>
                        <input
                            id="code_barres"
                            name="code_barres"
                            value={form.code_barres}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Code-barres"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prix_achat">Prix d'achat *</label>
                        <input
                            id="prix_achat"
                            name="prix_achat"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.prix_achat}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="qte_stock">Quantité en stock *</label>
                        <input
                            id="qte_stock"
                            name="qte_stock"
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.qte_stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="qte_min">Stock minimum *</label>
                        <input
                            id="qte_min"
                            name="qte_min"
                            type="number"
                            min="0"
                            step="0.001"
                            value={form.qte_min}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_peremption">
                            Date de péremption
                        </label>
                        <input
                            id="date_peremption"
                            name="date_peremption"
                            type="date"
                            value={form.date_peremption}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="actif">Statut</label>
                        <select
                            id="actif"
                            name="actif"
                            value={form.actif}
                            onChange={handleChange}
                        >
                            <option value="1">Actif</option>
                            <option value="0">Inactif</option>
                        </select>
                    </div>
                </div>

                <div className="form-group produit-description">
                    <label htmlFor="desc_prd">Description</label>
                    <textarea
                        id="desc_prd"
                        name="desc_prd"
                        value={form.desc_prd}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Description du produit..."
                    />
                </div>

                <div className="form-group produit-image-field">
                    <label htmlFor="img_prd">Image du produit</label>

                    {produit?.img_prd && !image && (
                        <div className="current-image">
                            <img
                                src={`${API_BASE}/storage/${produit.img_prd}`}
                                alt={produit.nom_prd}
                            />
                            <span>Image actuelle</span>
                        </div>
                    )}

                    <input
                        id="img_prd"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                            const fichier = e.target.files?.[0] ?? null;
                            setImage(fichier);
                        }}
                    />

                    <small>
                        Formats acceptés : JPG, PNG, WEBP. Taille maximale : 2 Mo.
                        {produit?.img_prd
                            ? " Si tu ne choisis pas une nouvelle image, l'ancienne sera conservée."
                            : ""}
                    </small>

                    {image && (
                        <p className="selected-file">
                            Fichier sélectionné : {image.name}
                        </p>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Enregistrement..."
                            : produit
                                ? "Enregistrer les modifications"
                                : "Ajouter le produit"}
                    </button>

                    {produit && (
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
        </section>
    );
}
