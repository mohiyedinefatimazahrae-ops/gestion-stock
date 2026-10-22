
import { useEffect, useState } from 'react';

export default function CategorieForm({
  categorie,
  onSubmit,
  onCancel,
  loading,
}) {
  const [nomCat, setNomCat] = useState('');
  const [descCat, setDescCat] = useState('');

  useEffect(() => {
    setNomCat(categorie?.nom_cat ?? '');
    setDescCat(categorie?.desc_cat ?? '');
  }, [categorie]);

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit({
      nom_cat: nomCat.trim(),
      desc_cat: descCat.trim() || null,
    });

    if (!categorie) {
      setNomCat('');
      setDescCat('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h2>{categorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>

      <label htmlFor="nom_cat">Nom de la catégorie</label>
      <input
        id="nom_cat"
        value={nomCat}
        onChange={(e) => setNomCat(e.target.value)}
        required
        maxLength={255}
        placeholder="Ex. Papier"
      />

      <label htmlFor="desc_cat">Description</label>
      <textarea
        id="desc_cat"
        value={descCat}
        onChange={(e) => setDescCat(e.target.value)}
        placeholder="Description de la catégorie"
        rows={3}
      />

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : categorie
              ? 'Modifier'
              : 'Ajouter'}
        </button>

        {categorie && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
