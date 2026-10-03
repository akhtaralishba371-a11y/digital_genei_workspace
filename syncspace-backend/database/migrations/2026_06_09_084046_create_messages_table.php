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
        Schema::create('messages', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('channelId')->nullable()->index();   // null for direct messages
            $table->string('recipientId')->nullable()->index(); // set for direct messages (1:1)
            $table->string('userId')->index();                  // sender
            $table->string('parentId')->nullable()->index();    // set for thread replies
            $table->text('content')->nullable();
            $table->string('timestamp')->nullable();   // display string e.g. "08:42 AM"
            $table->json('reactions')->nullable();
            $table->json('files')->nullable();
            $table->boolean('isPinned')->default(false);
            $table->integer('repliesCount')->default(0);
            $table->text('aiSummary')->nullable();
            $table->string('audioDuration')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
