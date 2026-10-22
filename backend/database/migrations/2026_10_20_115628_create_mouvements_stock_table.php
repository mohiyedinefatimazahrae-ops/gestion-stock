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
        Schema::create('mouvements_stock', function (Blueprint $table) {
            $table->id('id_mouvement');

            $table->foreignId('produit_id')
            ->constrained('produits', 'id_prd')
            ->restrictOnDelete();

            $table->foreignId('production_id')
                ->nullable()
                ->constrained('productions', 'id_production')
                ->restrictOnDelete();

            $table->foreignId('achat_id')
                ->nullable()
                ->constrained('achats', 'id_achat')
                ->restrictOnDelete();

            $table->enum('type', [
                'entree',
                'sortie',
                'ajustement',
            ]);

            $table->decimal('qte', 12, 3);
            $table->decimal('qte_avant', 12, 3);
            $table->decimal('qte_apres', 12, 3);

            $table->decimal('pu', 12, 2)->nullable();

            $table->string('motif', 150)->nullable();

            $table->dateTime('date_mouvement');
            $table->timestamps();

            $table->index(['produit_id', 'date_mouvement']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvements_stock');
    }
};
