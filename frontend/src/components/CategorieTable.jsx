
export default function CategorieTable({
  categories,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (categories.length === 0) {
    return <p>Aucune catégorie enregistrée.</p>;
  }

  return (
    <div className="table-container">
      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((categorie) => (
            <tr key={categorie.id_cat}>
              <td>{categorie.id_cat}</td>
              <td>{categorie.nom_cat}</td>
              <td>{categorie.desc_cat || '—'}</td>
              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(categorie)}
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(categorie)}
                    disabled={deletingId === categorie.id_cat}
                  >
                    {deletingId === categorie.id_cat
                      ? 'Suppression...'
                      : 'Supprimer'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
