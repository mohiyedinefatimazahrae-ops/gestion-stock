<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    protected $primaryKey = 'id_cat';

    protected $fillable = [
        'nom_cat',
        'desc_cat',
    ];

    // Une catégorie contient plusieurs produits
    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'categorie_id', 'id_cat');
    }
}
