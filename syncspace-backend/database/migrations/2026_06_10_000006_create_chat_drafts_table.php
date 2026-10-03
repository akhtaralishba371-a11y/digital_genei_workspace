<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_drafts', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id')->index();
            $table->string('user_id')->index();
            $table->text('content')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->unique(['chat_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_drafts');
    }
};
