
const API_URL = 'http://127.0.0.1:8000/api';

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des catégories.');
  }

  return response.json();
}

export async function createCategorie(data) {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Erreur lors de l’ajout de la catégorie.'
    );
  }

  return result;
}

export async function updateCategorie(id, data) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Erreur lors de la modification.'
    );
  }

  return result;
}

export async function deleteCategorie(id) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Erreur lors de la suppression.'
    );
  }

  return result;
}
