
import { useEffect, useState } from "react";

const initialForm = {
    nom_frn: "",
    tel: "",
    email: "",
    adr: "",
    ville: "",
    ice: "",
    notes: "",
    actif: true,
};

export default function FournisseurForm({
    fournisseur,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(initialForm);
    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fournisseur) {
            setForm({
                nom_frn: fournisseur.nom_frn ?? "",
                tel: fournisseur.tel ?? "",
                email: fournisseur.email ?? "",
                adr: fournisseur.adr ?? "",
                ville: fournisseur.ville ?? "",
                ice: fournisseur.ice ?? "",
                notes: fournisseur.notes ?? "",
                actif: Boolean(fournisseur.actif),
            });
        } else {
            setForm(initialForm);
        }

        setErreur("");
    }, [fournisseur]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur("");
        setLoading(true);

        try {
            await onSubmit({
                ...form,
                actif: form.actif,
            });
        } catch (error) {
            setErreur(error.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-card fournisseur-form">
            <h3>
                {fournisseur
                    ? "Modifier le fournisseur"
                    : "Ajouter un fournisseur"}
            </h3>

            {erreur && (
                <div className="alert alert-error">{erreur}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="fournisseur-form-grid">
                    <div className="form-group">
                        <label htmlFor="nom_frn">
                            Nom du fournisseur *
                        </label>
                        <input
                            id="nom_frn"
                            name="nom_frn"
                            value={form.nom_frn}
                            onChange={handleChange}
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tel">Téléphone</label>
                        <input
                            id="tel"
                            name="tel"
                            type="tel"
                            value={form.tel}
                            onChange={handleChange}
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            maxLength={255}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ville">Ville</label>
                        <input
                            id="ville"
                            name="ville"
                            value={form.ville}
                            onChange={handleChange}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ice">ICE</label>
                        <input
                            id="ice"
                            name="ice"
                            value={form.ice}
                            onChange={handleChange}
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="adr">Adresse</label>
                        <input
                            id="adr"
                            name="adr"
                            value={form.adr}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group fournisseur-notes">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="form-group fournisseur-actif">
                        <label>
                            <input
                                type="checkbox"
                                name="actif"
                                checked={form.actif}
                                onChange={handleChange}
                            />
                            {" "}Fournisseur actif
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Enregistrement..."
                            : fournisseur
                                ? "Enregistrer les modifications"
                                : "Ajouter le fournisseur"}
                    </button>

                    {fournisseur && (
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
