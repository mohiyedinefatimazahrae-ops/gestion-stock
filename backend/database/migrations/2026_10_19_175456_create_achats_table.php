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
        Schema::create('achats', function (Blueprint $table) {
            $table->id('id_achat');
            $table->string('num_achat', 50)->unique();

            $table->foreignId('fournisseur_id')
                ->constrained('fournisseurs', 'id_frn')
                ->restrictOnDelete();

            $table->date('date_achat');
            $table->string('numero_facture', 100)->nullable();
            $table->string('img_facture', 200)->nullable();

            $table->decimal('total_ht', 12, 2)->default(0);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);

            $table->enum('statut', [
                'brouillon',
                'valide',
                'annule',
            ])->default('brouillon');

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('achats');
    }
};
