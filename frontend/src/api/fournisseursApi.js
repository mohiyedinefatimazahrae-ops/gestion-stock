
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
export function getFournisseurs(params = {}) {
    const query = new URLSearchParams();

    if (params.telephone) {
        query.append("telephone", params.telephone);
    }

    if (params.nom) {
        query.append("nom", params.nom);
    }

    if (params.page) {
        query.append("page", params.page);
    }

    const url = query.toString()
        ? `${API_URL}?${query.toString()}`
        : API_URL;

    return request(url);
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
