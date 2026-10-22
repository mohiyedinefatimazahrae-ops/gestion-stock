
const API_URL = "http://127.0.0.1:8000/api/unites";

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

export function getUnites() {
    return request(API_URL);
}

export function createUnite(unite) {
    return request(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(unite),
    });
}

export function updateUnite(id, unite) {
    return request(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(unite),
    });
}

export function deleteUnite(id) {
    return request(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}
