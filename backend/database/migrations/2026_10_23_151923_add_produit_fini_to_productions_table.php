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
        Schema::table('productions', function (Blueprint $table) {
            $table->foreignId('produit_fini_id')
                ->nullable()
                ->after('ref_production')
                ->constrained('produits', 'id_prd')
                ->restrictOnDelete();

            $table->decimal('qte_produite', 12, 3)
                ->default(0)
                ->after('prix_reste');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('produit_fini_id');
            $table->dropColumn('qte_produite');
        });
    }
};
