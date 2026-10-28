
const API_URL = "http://127.0.0.1:8000/api/achats";

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

// Récupérer tous les achats
export function getAchats() {
    return request(API_URL);
}

// Récupérer un achat
export function getAchat(id) {
    return request(`${API_URL}/${id}`);
}

// Ajouter un achat
export function createAchat(formData) {
    return request(API_URL, {
        method: "POST",
        body: formData,
    });
}

// Modifier un achat
export function updateAchat(id, formData) {
    formData.set("_method", "PUT");

    return request(`${API_URL}/${id}`, {
        method: "POST",
        body: formData,
    });
}

// Supprimer un achat
export function deleteAchat(id) {
    return request(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}

// URL d'affichage de la facture
export function getFactureUrl(imgFacture) {
    if (!imgFacture) return null;

    return `http://127.0.0.1:8000/storage/${imgFacture}`;
}


export function validerAchat(id) {
    return request(`${API_URL}/${id}/valider`, {
        method: "POST",
    });
}


/* Récupérer les détails d'un achat */
export function getAchatDetails(achatId) {
    return request(`${API_URL}/${achatId}/details`);
}

/* Ajouter un produit à un achat */
export function ajouterDetailAchat(achatId, detail) {
    return request(`${API_URL}/${achatId}/details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(detail),
    });
}

/* Modifier une ligne d'achat */
export function modifierDetailAchat(achatId, detailId, detail) {
    return request(
        `${API_URL}/${achatId}/details/${detailId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(detail),
        }
    );
}

/* Supprimer une ligne d'achat */
export function supprimerDetailAchat(achatId, detailId) {
    return request(
        `${API_URL}/${achatId}/details/${detailId}`,
        {
            method: "DELETE",
        }
    );

}

export function getFactureDownloadUrl(id) {
    return `${API_URL}/${id}/facture/download`;
}

export function enregistrerAchatComplet(formData) {
    return request(`${API_URL}/enregistrer-complet`, {
        method: "POST",
        body: formData,
    });
}
