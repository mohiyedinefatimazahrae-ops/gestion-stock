
import { useEffect, useState } from 'react';

import {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from '../api/categoriesApi';

import CategorieForm from '../components/CategorieForm';
import CategorieTable from '../components/CategorieTable';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categorieEnCours, setCategorieEnCours] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  async function chargerCategories() {
    setErreur('');

    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      setErreur(error.message || 'Erreur lors du chargement.');
    }
  }

  useEffect(() => {
    chargerCategories();
  }, []);

  async function enregistrerCategorie(data) {
    setLoading(true);
    setErreur('');
    setMessage('');

    try {
      if (categorieEnCours) {
        await updateCategorie(categorieEnCours.id_cat, data);
        setMessage('Catégorie modifiée avec succès.');
      } else {
        await createCategorie(data);
        setMessage('Catégorie ajoutée avec succès.');
      }

      setCategorieEnCours(null);
      await chargerCategories();
    } catch (error) {
      setErreur(error.message || 'Une erreur est survenue.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function supprimerCategorie(categorie) {
    const confirmation = window.confirm(
      `Voulez-vous supprimer la catégorie "${categorie.nom_cat}" ?`
    );

    if (!confirmation) return;

    setDeletingId(categorie.id_cat);
    setErreur('');
    setMessage('');

    try {
      await deleteCategorie(categorie.id_cat);
      setMessage('Catégorie supprimée avec succès.');
      await chargerCategories();
    } catch (error) {
      setErreur(error.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="categories-page">
      <header className="page-header">
        <div>
          <h1>Gestion des catégories</h1>
          <p>Ajouter, modifier et organiser les catégories de stock.</p>
        </div>

        <span className="category-count">
          {categories.length} catégorie(s)
        </span>
      </header>

      {erreur && (
        <div className="alert alert-error" role="alert">
          {erreur}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      <section className="category-form-section">
        <CategorieForm
          categorie={categorieEnCours}
          onSubmit={enregistrerCategorie}
          onCancel={() => setCategorieEnCours(null)}
          loading={loading}
        />
      </section>

      <section className="category-list-section">
        <h2>Liste des catégories</h2>

        <CategorieTable
          categories={categories}
          onEdit={setCategorieEnCours}
          onDelete={supprimerCategorie}
          deletingId={deletingId}
        />
      </section>
    </main>
  );
}
