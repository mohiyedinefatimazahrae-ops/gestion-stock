
const API_URL = "http://127.0.0.1:8000/api/produits";

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
            throw new Error(errors.join("\n") || "Données invalides.");
        }

        throw new Error(
            data.message || `Erreur HTTP ${response.status}`
        );
    }

    return data;
}

// Récupérer les produits avec recherche et pagination
export function getProduits(params = {}) {
    const query = new URLSearchParams();

    if (params.nom?.trim()) {
        query.set("nom", params.nom.trim());
    }

    if (params.page) {
        query.set("page", params.page);
    }

    const url = query.toString()
        ? `${API_URL}?${query.toString()}`
        : API_URL;

    return request(url);
}

export function createProduit(formData) {
    return request(API_URL, {
        method: "POST",
        body: formData,
    });
}

export function updateProduit(id, formData) {
    formData.set("_method", "PUT");

    return request(`${API_URL}/${id}`, {
        method: "POST",
        body: formData,
    });
}

export function deleteProduit(id) {
    return request(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}


export function chercherProduitParCodeBarres(codeBarres) {
    const code = encodeURIComponent(codeBarres.trim());

    return request(
        `${API_URL}/recherche-code-barres?code_barres=${code}`
    );
}

