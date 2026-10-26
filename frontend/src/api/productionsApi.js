
const API_URL = "http://127.0.0.1:8000/api/productions";

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errors = Object.values(data.errors || {}).flat();

        throw new Error(
            errors.join("\n") ||
            data.message ||
            `Erreur HTTP ${response.status}`
        );
    }

    return data;
}

// Productions : CRUD
export const getProductions = () =>
    request(API_URL);

export const getProduction = (id) =>
    request(`${API_URL}/${id}`);

export const createProduction = (production) =>
    request(API_URL, {
        method: "POST",
        body: JSON.stringify(production),
    });

export const updateProduction = (id, production) =>
    request(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(production),
    });

export const deleteProduction = (id) =>
    request(`${API_URL}/${id}`, {
        method: "DELETE",
    });

// Matières premières d'une production
export const getProductionMatieres = (id) =>
    request(`${API_URL}/${id}/matieres`);

export const ajouterMatiere = (id, matiere) =>
    request(`${API_URL}/${id}/matieres`, {
        method: "POST",
        body: JSON.stringify(matiere),
    });

export const modifierMatiere = (id, matiereId, matiere) =>
    request(`${API_URL}/${id}/matieres/${matiereId}`, {
        method: "PUT",
        body: JSON.stringify(matiere),
    });

export const supprimerMatiere = (id, matiereId) =>
    request(`${API_URL}/${id}/matieres/${matiereId}`, {
        method: "DELETE",
    });

// Démarrer la production
export const demarrerProduction = (id) =>
    request(`${API_URL}/${id}/demarrer`, {
        method: "POST",
    });

// Terminer la production et ajouter le produit fini au stock
export const terminerProduction = (id) =>
    request(`${API_URL}/${id}/terminer`, {
        method: "POST",
    });

// Livrer la commande
export const livrerProduction = (id) =>
    request(`${API_URL}/${id}/livrer`, {
        method: "POST",
    });
