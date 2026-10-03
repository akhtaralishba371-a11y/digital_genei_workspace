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
        Schema::create('marketplace_apps', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // productivity|development|communication|file_storage|marketing
            $table->string('icon')->nullable();
            $table->boolean('isInstalled')->default(false);
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('reviewsCount')->default(0);
            $table->string('vendor')->nullable();
            $table->json('permissionsProposed')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_apps');
    }
};
