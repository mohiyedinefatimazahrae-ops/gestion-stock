<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionMatiere extends Model
{
    protected $fillable = [
        'production_id',
        'produit_id',
        'qte',
    ];

    protected $casts = [
        'qte' => 'decimal:3',
    ];

    // La ligne appartient à une production
    public function production(): BelongsTo
    {
        return $this->belongsTo(
            Production::class,
            'production_id',
            'id_production'
        );
    }

    // La matière utilisée est un produit du stock
    public function produit(): BelongsTo
    {
        return $this->belongsTo(
            Produit::class,
            'produit_id',
            'id_prd'
        );
    }
}
