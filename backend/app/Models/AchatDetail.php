<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AchatDetail extends Model
{
    protected $table = 'achat_details';

    protected $fillable = [
        'achat_id',
        'produit_id',
        'qte',
        'pu',
        'remise',
        'tva_pourcentage',
        'sous_total',
    ];

    protected $casts = [
        'qte' => 'decimal:3',
        'pu' => 'decimal:2',
        'remise' => 'decimal:2',
        'tva_pourcentage' => 'decimal:2',
        'sous_total' => 'decimal:2',
    ];

    // Une ligne de détail appartient à un achat
    public function achat(): BelongsTo
    {
        return $this->belongsTo(
            Achat::class,
            'achat_id',
            'id_achat'
        );
    }

    // Une ligne de détail concerne un produit
    public function produit(): BelongsTo
    {
        return $this->belongsTo(
            Produit::class,
            'produit_id',
            'id_prd'
        );
    }
}
