<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Production extends Model
{
    protected $primaryKey = 'id_production';

    protected $fillable = [
        'ref_production',
        'client_nom',
        'client_tel',
        'details_commande',
        'date_commande',
        'date_livraison',
        'prix_total',
        'prix_avance',
        'prix_reste',
        'statut',
        'notes',
        'produit_fini_id',
        'qte_produite',
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison' => 'date',
        'prix_total' => 'decimal:2',
        'prix_avance' => 'decimal:2',
        'prix_reste' => 'decimal:2',
        'qte_produite' => 'decimal:3',
    ];

    // Une production contient plusieurs matières
    public function matieres(): HasMany
    {
        return $this->hasMany(
            ProductionMatiere::class,
            'production_id',
            'id_production'
        );
    }

    // Une production peut générer plusieurs mouvements de stock
    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(
            MouvementStock::class,
            'production_id',
            'id_production'
        );
    }

    public function produitFini(): BelongsTo
    {
        return $this->belongsTo(
            Produit::class,
            'produit_fini_id',
            'id_prd'
        );
    }
}
