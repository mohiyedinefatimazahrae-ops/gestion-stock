const API_URL = "http://127.0.0.1:8000/api/dashboard";

export async function getDashboard() {
    const response = await fetch(API_URL, {
        headers: {
            Accept: "application/json",
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || `Erreur HTTP ${response.status}`
        );
    }

    return data;
}
