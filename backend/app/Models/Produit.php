<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    protected $primaryKey = 'id_prd';

    protected $fillable = [
        'ref_prd',
        'nom_prd',
        'desc_prd',
        'img_prd',
        'categorie_id',
        'unite_id',
        'type',
        'marque',
        'code_barres',
        'qte_stock',
        'qte_min',
        'prix_achat',
        'date_peremption',
        'actif',
    ];

    protected $casts = [
        'qte_stock' => 'decimal:3',
        'qte_min' => 'decimal:3',
        'prix_achat' => 'decimal:2',
        'date_peremption' => 'date',
        'actif' => 'boolean',
    ];

    // Un produit appartient à une catégorie
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'categorie_id', 'id_cat');
    }

    // Un produit appartient à une unité
    public function unite(): BelongsTo
    {
        return $this->belongsTo(Unite::class, 'unite_id', 'id_unt');
    }


    // Un produit peut apparaître dans plusieurs détails d'achat
    public function achatDetails(): HasMany
    {
        return $this->hasMany(
            AchatDetail::class,
            'produit_id',
            'id_prd'
        );
    }

    // Les mouvements de stock du produit
    public function mouvementsStock(): HasMany
    {
        return $this->hasMany(
            MouvementStock::class,
            'produit_id',
            'id_prd'
        );
    }

    // Les productions qui utilisent ce produit comme matière
    public function productionMatieres(): HasMany
    {
        return $this->hasMany(
            ProductionMatiere::class,
            'produit_id',
            'id_prd'
        );
    }

    public function notificationsStock(): HasMany
    {
        return $this->hasMany(
            NotificationStock::class,
            'produit_id',
            'id_prd'
        );
    }
}
