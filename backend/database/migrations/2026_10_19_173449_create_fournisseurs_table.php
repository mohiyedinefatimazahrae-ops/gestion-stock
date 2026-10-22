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
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id('id_frn');
            $table->string('nom_frn', 150);
            $table->string('tel', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('adr')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('ice', 30)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fournisseurs');
    }
};
