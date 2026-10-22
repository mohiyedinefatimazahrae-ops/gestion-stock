
import { useEffect, useState } from "react";

export default function UniteForm({ unite, onSubmit, onCancel }) {
    const [nom, setNom] = useState("");
    const [symbole, setSymbole] = useState("");
    const [erreur, setErreur] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNom(unite?.nom_unt ?? "");
        setSymbole(unite?.symbole ?? "");
        setErreur("");
    }, [unite]);

    async function handleSubmit(e) {
        e.preventDefault();
        setErreur("");

        if (!nom.trim()) {
            setErreur("Le nom de l'unité est obligatoire.");
            return;
        }

        setLoading(true);

        try {
            await onSubmit({
                nom_unt: nom.trim(),
                symbole: symbole.trim() || null,
            });

            setNom("");
            setSymbole("");
        } catch (error) {
            setErreur(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>{unite ? "Modifier l'unité" : "Ajouter une unité"}</h2>

            {erreur && (
                <div className="alert alert-error">
                    {erreur}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="nom_unt">Nom de l'unité *</label>
                <input
                    id="nom_unt"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    maxLength={50}
                    placeholder="Ex. Kilogramme"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="symbole">Symbole</label>
                <input
                    id="symbole"
                    type="text"
                    value={symbole}
                    onChange={(e) => setSymbole(e.target.value)}
                    maxLength={15}
                    placeholder="Ex. kg"
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading
                        ? "Enregistrement..."
                        : unite
                            ? "Modifier"
                            : "Ajouter"}
                </button>

                {unite && (
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
