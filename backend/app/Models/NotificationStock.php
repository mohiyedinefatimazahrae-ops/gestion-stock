<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationStock extends Model
{
    protected $table = 'notification_stocks';

    protected $fillable = [
        'produit_id',
        'message',
        'qte_stock',
        'qte_min',
        'lu',
        'date_lecture',
    ];

    protected $casts = [
        'qte_stock' => 'decimal:3',
        'qte_min' => 'decimal:3',
        'lu' => 'boolean',
        'date_lecture' => 'datetime',
    ];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(
            Produit::class,
            'produit_id',
            'id_prd'
        );
    }
}
