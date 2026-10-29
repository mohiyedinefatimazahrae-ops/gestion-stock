
import { useEffect, useRef, useState } from "react";
import { chercherProduitParCodeBarres } from "../api/produitsApi";
import { enregistrerMouvement } from "../api/mouvementsStockApi";

export default function ScannerStock() {
    const [codeBarres, setCodeBarres] = useState("");
    const [produit, setProduit] = useState(null);
    const [type, setType] = useState("entree");
    const [qte, setQte] = useState("1");
    const [motif, setMotif] = useState("");

    const [rechercheEnCours, setRechercheEnCours] = useState(false);
    const [enregistrement, setEnregistrement] = useState(false);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");

    const codeInputRef = useRef(null);

    useEffect(() => {
        codeInputRef.current?.focus();
    }, []);

    // Recherche directe par code-barres dans Laravel
    async function rechercherProduit(e) {
        e?.preventDefault();

        const code = codeBarres.trim();

        setErreur("");
        setMessage("");

        if (!code) {
            setErreur("Scanne ou saisis un code-barres.");
            return;
        }

        try {
            setRechercheEnCours(true);
            setProduit(null);

            const resultat = await chercherProduitParCodeBarres(code);

            setProduit(resultat.produit);
            setQte("1");
            setMotif("");
        } catch (error) {
            setProduit(null);
            setErreur(
                error.message ||
                "Produit introuvable. Vérifie le code-barres."
            );
        } finally {
            setRechercheEnCours(false);
        }
    }

    async function validerMouvement(e) {
        e.preventDefault();

        setErreur("");
        setMessage("");

        if (!produit) {
            setErreur("Scanne d'abord un produit.");
            return;
        }

        const quantite = Number(qte);

        if (!Number.isFinite(quantite) || quantite <= 0) {
            setErreur("La quantité doit être supérieure à zéro.");
            return;
        }

        if (
            type === "sortie" &&
            quantite > Number(produit.qte_stock)
        ) {
            setErreur(
                `Stock insuffisant. Quantité disponible : ${produit.qte_stock}.`
            );
            return;
        }

        try {
            setEnregistrement(true);

            const resultat = await enregistrerMouvement({
                code_barres: produit.code_barres,
                type,
                qte: quantite,
                motif: motif.trim() || null,
            });

            // Garder aussi les relations déjà chargées, comme l'unité.
            const produitMisAJour = {
                ...produit,
                ...resultat.produit,
            };

            setProduit(produitMisAJour);

            setMessage(
                `${resultat.message} Nouveau stock : ${produitMisAJour.qte_stock}.`
            );

            // Préparer le champ pour le prochain scan.
            setCodeBarres("");
            setQte("1");
            setMotif("");

            codeInputRef.current?.focus();
        } catch (error) {
            setErreur(
                error.message || "Échec de l'enregistrement du mouvement."
            );
        } finally {
            setEnregistrement(false);
        }
    }

    function nouveauScan() {
        setProduit(null);
        setCodeBarres("");
        setQte("1");
        setMotif("");
        setErreur("");
        setMessage("");

        codeInputRef.current?.focus();
    }

    return (
        <div className="mouvements-page">
            <div className="mouvements-header">
                <div>
                    <h1>Scanner des produits</h1>
                    <p>
                        Scanne un code-barres pour rechercher le produit
                        et enregistrer une entrée ou une sortie de stock.
                    </p>
                </div>
            </div>

            {erreur && (
                <div className="mouvement-erreur" role="alert">
                    {erreur}
                </div>
            )}

            {message && (
                <div className="ajustement-succes" role="status">
                    {message}
                </div>
            )}

            <form
                className="mouvements-filtres"
                onSubmit={rechercherProduit}
            >
                <div className="mouvement-champ">
                    <label htmlFor="scanner-code">Code-barres</label>

                    <input
                        ref={codeInputRef}
                        id="scanner-code"
                        type="text"
                        value={codeBarres}
                        onChange={(e) => {
                            setCodeBarres(e.target.value);
                            setErreur("");
                            setMessage("");
                        }}
                        onKeyDown={(e) => {
                            // Le scanner envoie généralement Enter après le code.
                            if (e.key === "Enter") {
                                e.preventDefault();
                                rechercherProduit();
                            }
                        }}
                        placeholder="Scanne le code-barres ici..."
                        autoComplete="off"
                        autoFocus
                        disabled={rechercheEnCours || enregistrement}
                    />
                </div>

                {rechercheEnCours && (
                    <p>Recherche du produit en cours...</p>
                )}
            </form>

            {!produit && !rechercheEnCours && !erreur && (
                <p>
                    Place le curseur dans le champ puis scanne le produit.
                    La recherche se lance avec la touche Entrée envoyée
                    par le scanner.
                </p>
            )}

            {produit && (
                <div className="scanner-produit">
                    <h2>Produit trouvé</h2>

                    {produit.img_prd && (
                        <img
                            src={`http://127.0.0.1:8000/storage/${produit.img_prd}`}
                            alt={produit.nom_prd}
                            style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "contain",
                            }}
                        />
                    )}

                    <p>
                        <strong>Nom :</strong> {produit.nom_prd}
                    </p>

                    <p>
                        <strong>Référence :</strong> {produit.ref_prd}
                    </p>

                    <p>
                        <strong>Code-barres :</strong>{" "}
                        {produit.code_barres}
                    </p>

                    <p>
                        <strong>Stock actuel :</strong>{" "}
                        {produit.qte_stock}{" "}
                        {produit.unite?.symbole || ""}
                    </p>

                    <form
                        className="mouvements-filtres"
                        onSubmit={validerMouvement}
                    >
                        <div className="mouvement-champ">
                            <label htmlFor="scanner-type">
                                Type de mouvement
                            </label>

                            <select
                                id="scanner-type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled={enregistrement}
                            >
                                <option value="entree">Entrée</option>
                                <option value="sortie">Sortie</option>
                            </select>
                        </div>

                        <div className="mouvement-champ">
                            <label htmlFor="scanner-qte">Quantité</label>

                            <input
                                id="scanner-qte"
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={qte}
                                onChange={(e) => setQte(e.target.value)}
                                required
                                disabled={enregistrement}
                            />
                        </div>

                        <div className="mouvement-champ">
                            <label htmlFor="scanner-motif">
                                Motif (facultatif)
                            </label>

                            <input
                                id="scanner-motif"
                                type="text"
                                maxLength="150"
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                placeholder="Ex. Réception fournisseur"
                                disabled={enregistrement}
                            />
                        </div>

                        {type === "sortie" &&
                            Number(qte) > Number(produit.qte_stock) && (
                                <p className="mouvement-erreur">
                                    Stock insuffisant.
                                </p>
                            )}

                        <div className="mouvements-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={
                                    enregistrement ||
                                    !qte ||
                                    Number(qte) <= 0 ||
                                    (
                                        type === "sortie" &&
                                        Number(qte) > Number(produit.qte_stock)
                                    )
                                }
                            >
                                {enregistrement
                                    ? "Enregistrement..."
                                    : "Enregistrer le mouvement"}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={enregistrement || rechercheEnCours}
                                onClick={nouveauScan}
                            >
                                Nouveau scan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
