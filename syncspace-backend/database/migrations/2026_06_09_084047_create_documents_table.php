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
        Schema::create('documents', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('emoji')->default('📄');
            $table->json('blocks');                    // Notion-style blocks
            $table->string('updatedAt')->nullable();   // display string e.g. "10 mins ago"
            $table->string('updatedById')->nullable(); // user id; embedded as updatedBy
            $table->boolean('isFavorite')->default(false);
            $table->string('workspaceId')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
