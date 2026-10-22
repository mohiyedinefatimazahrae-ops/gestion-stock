<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unite extends Model
{
    protected $primaryKey = 'id_unt';

    protected $fillable = [
        'nom_unt',
        'symbole',
    ];

    // Une unité peut être utilisée par plusieurs produits
    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'unite_id', 'id_unt');
    }
}
