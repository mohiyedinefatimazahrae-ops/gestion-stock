const API_URL = "http://127.0.0.1:8000/api/mouvements-stock";

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
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

export function getMouvementsStock(filtres = {}) {
    const params = new URLSearchParams();

    Object.entries(filtres).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            params.append(key, value);
        }
    });

    const query = params.toString();

    return request(query ? `${API_URL}?${query}` : API_URL);
}

export function getMouvementStock(id) {
    return request(`${API_URL}/${id}`);
}

export function ajusterStock(donnees) {
    return request(`${API_URL}/ajustement`, {
        method: "POST",
        body: JSON.stringify(donnees),
    });
}

// fonction de scanner code barre 
export function enregistrerMouvement(donnees) {
    return request(`${API_URL}/enregistrer`, {
        method: "POST",
        body: JSON.stringify(donnees),
    });
}
