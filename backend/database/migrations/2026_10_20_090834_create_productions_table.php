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
        Schema::create('productions', function (Blueprint $table) {
            $table->id('id_production');

            $table->string('ref_production', 50)->unique();

            // Informations client
            $table->string('client_nom', 150);
            $table->string('client_tel', 30)->nullable();

            // Commande
            $table->text('details_commande')->nullable();
            $table->date('date_commande');
            $table->date('date_livraison')->nullable();

            // Paiement
            $table->decimal('prix_total', 12, 2)->default(0);
            $table->decimal('prix_avance', 12, 2)->default(0);
            $table->decimal('prix_reste', 12, 2)->default(0);

            // Statut
            $table->enum('statut', [
                'en_attente',
                'en_cours',
                'terminee',
                'livree',
                'annulee',
            ])->default('en_attente');

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
