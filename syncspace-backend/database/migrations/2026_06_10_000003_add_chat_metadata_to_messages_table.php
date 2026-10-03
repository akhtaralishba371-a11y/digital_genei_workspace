<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('chat_id')->nullable()->index()->after('id');
            $table->json('attachments')->nullable()->after('content');
            $table->boolean('is_read')->default(false)->after('audioDuration');
            $table->timestamp('read_at')->nullable()->after('is_read');
            $table->timestamp('edited_at')->nullable()->after('read_at');
            $table->timestamp('deleted_at')->nullable()->after('edited_at');
            $table->boolean('is_starred')->default(false)->after('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'chat_id',
                'attachments',
                'is_read',
                'read_at',
                'edited_at',
                'deleted_at',
                'is_starred',
            ]);
        });
    }
};
