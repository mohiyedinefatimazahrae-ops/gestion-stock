<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('achat_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achat_id')
            ->constrained('achats', 'id_achat')
            ->cascadeOnDelete();

            $table->foreignId('produit_id')
                ->constrained('produits', 'id_prd')
                ->restrictOnDelete();

            $table->decimal('qte', 12, 3);
            $table->decimal('pu', 12, 2);
            $table->decimal('remise', 12, 2)->default(0);
            $table->decimal('tva_pourcentage', 5, 2)->default(0);
            $table->decimal('sous_total', 12, 2);

            $table->timestamps();

            $table->index(['achat_id', 'produit_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achat_details');
    }
};
