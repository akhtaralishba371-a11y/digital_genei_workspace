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
        Schema::create('tasks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('todo');     // backlog|todo|in_progress|in_review|done
            $table->string('priority')->default('medium'); // low|medium|high|urgent
            $table->string('dueDate')->nullable();
            $table->json('assigneeIds')->nullable();       // ["u1","u2"]
            $table->string('project')->nullable();
            $table->integer('timeSpentMinutes')->nullable();
            $table->integer('timeEstimateMinutes')->nullable();
            $table->string('sprint')->nullable();
            $table->json('dependencies')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
