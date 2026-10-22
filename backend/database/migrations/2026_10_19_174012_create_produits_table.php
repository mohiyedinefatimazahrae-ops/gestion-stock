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
        Schema::create('produits', function (Blueprint $table) {
            $table->id('id_prd');
            $table->string('ref_prd', 50)->unique();
            $table->string('nom_prd', 150);
            $table->text('desc_prd')->nullable();
            $table->string('img_prd',200)->nullable();

            $table->foreignId('categorie_id')
                ->constrained('categories', 'id_cat')
                ->restrictOnDelete();

            $table->foreignId('unite_id')
                ->constrained('unites', 'id_unt')
                ->restrictOnDelete();

            $table->enum('type', [
                'matiere_premiere',
                'produit_fini',
            ])->default('matiere_premiere');

            $table->string('marque', 100)->nullable();
            $table->string('code_barres', 100)->nullable();

            $table->decimal('qte_stock', 12, 3)->default(0);
            $table->decimal('qte_min', 12, 3)->default(0);

            $table->decimal('prix_achat', 12, 2)->default(0);
            $table->date('date_peremption')->nullable();
            $table->boolean('actif')->default(true);

            $table->timestamps();

            $table->index(['type', 'actif']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
