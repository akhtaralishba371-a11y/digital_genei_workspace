<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_user', function (Blueprint $table) {
            $table->string('chat_id');
            $table->string('user_id');
            $table->timestamp('last_read_at')->nullable();
            $table->string('role')->default('member');
            $table->timestamps();

            $table->primary(['chat_id', 'user_id']);
            $table->index(['user_id', 'last_read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_user');
    }
};
