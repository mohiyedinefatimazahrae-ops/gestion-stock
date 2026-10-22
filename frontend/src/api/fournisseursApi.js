
const API_URL = "http://127.0.0.1:8000/api/fournisseurs";

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 422) {
            const errors = Object.values(data.errors || {}).flat();
            throw new Error(
                errors.join("\n") || "Données invalides."
            );
        }

        throw new Error(
            data.message || `Erreur HTTP ${response.status}`
        );
    }

    return data;
}

// Récupérer tous les fournisseurs
export function getFournisseurs() {
    return request(API_URL);
}

// Récupérer un fournisseur par ID
export function getFournisseur(id) {
    return request(`${API_URL}/${id}`);
}

// Ajouter un fournisseur
export function createFournisseur(fournisseur) {
    return request(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fournisseur),
    });
}

// Modifier un fournisseur
export function updateFournisseur(id, fournisseur) {
    return request(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fournisseur),
    });
}

// Supprimer un fournisseur
export function deleteFournisseur(id) {
    return request(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}
