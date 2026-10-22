<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    protected $primaryKey = 'id_frn';

    protected $fillable = [
        'nom_frn',
        'tel',
        'email',
        'adr',
        'ville',
        'ice',
        'notes',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // Un fournisseur peut avoir plusieurs achats
    public function achats(): HasMany
    {
        return $this->hasMany(
            Achat::class,
            'fournisseur_id',
            'id_frn'
        );
    }
}
