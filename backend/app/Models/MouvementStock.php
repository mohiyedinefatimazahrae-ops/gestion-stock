<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    protected $table = 'mouvements_stock';

    protected $primaryKey = 'id_mouvement';

    protected $fillable = [
        'produit_id',
        'production_id',
        'achat_id',
        'type',
        'qte',
        'qte_avant',
        'qte_apres',
        'pu',
        'motif',
        'date_mouvement',
    ];

    protected $casts = [
        'qte' => 'decimal:3',
        'qte_avant' => 'decimal:3',
        'qte_apres' => 'decimal:3',
        'pu' => 'decimal:2',
        'date_mouvement' => 'datetime',
    ];

    // Le mouvement concerne un produit
    public function produit(): BelongsTo
    {
        return $this->belongsTo(
            Produit::class,
            'produit_id',
            'id_prd'
        );
    }

    // Le mouvement peut être lié à une production
    public function production(): BelongsTo
    {
        return $this->belongsTo(
            Production::class,
            'production_id',
            'id_production'
        );
    }

    // Le mouvement peut être lié à un achat
    public function achat(): BelongsTo
    {
        return $this->belongsTo(
            Achat::class,
            'achat_id',
            'id_achat'
        );
    }
}
