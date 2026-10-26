
const API_URL = "http://127.0.0.1:8000/api/notifications-stock";

export async function getNotificationsStock() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des notifications");
  }

  return response.json();
}

export async function marquerNotificationLue(id) {
  const response = await fetch(`${API_URL}/${id}/lue`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la lecture de la notification");
  }

  return response.json();
}

export async function marquerToutesLues() {
  const response = await fetch(`${API_URL}/tout-lire`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la lecture des notifications");
  }

  return response.json();
}
