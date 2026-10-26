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
        Schema::create('notification_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')
                ->nullable()
                ->constrained('produits', 'id_prd')
                ->nullOnDelete();
    
            $table->string('message');
            $table->decimal('qte_stock', 12, 3);
            $table->decimal('qte_min', 12, 3);
            $table->boolean('lu')->default(false);
            $table->timestamp('date_lecture')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_stocks');
    }
};
