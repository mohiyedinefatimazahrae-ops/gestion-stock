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
        // Schema::disableForeignKeyConstraints();
        Schema::create('production_matieres', function (Blueprint $table) {
            $table->id();

            $table->foreignId('production_id')
            ->constrained('productions', 'id_production')
            ->cascadeOnDelete();

            $table->foreignId('produit_id')
                ->constrained('produits', 'id_prd')
                ->restrictOnDelete();

            // Quantité prévue pour la production
            $table->decimal('qte', 12, 3);

            $table->timestamps();

            // Même matière une seule fois par production
            $table->unique(['production_id', 'produit_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_matieres');
    }
};
