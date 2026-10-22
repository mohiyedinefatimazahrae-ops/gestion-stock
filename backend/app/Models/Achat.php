<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achat extends Model
{
    protected $primaryKey = 'id_achat';

    protected $fillable = [
        'num_achat',
        'fournisseur_id',
        'date_achat',
        'numero_facture',
        'img_facture',
        'total_ht',
        'tva',
        'total_ttc',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date_achat' => 'date',
        'total_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
    ];

    // Un achat appartient à un fournisseur
    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(
            Fournisseur::class,
            'fournisseur_id',
            'id_frn'
        );
    }

    // Un achat contient plusieurs lignes de détail
    public function details(): HasMany
    {
        return $this->hasMany(
            AchatDetail::class,
            'achat_id',
            'id_achat'
        );
    }

    // Les mouvements de stock liés à cet achat
    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(
            MouvementStock::class,
            'achat_id',
            'id_achat'
        );
    }
}
