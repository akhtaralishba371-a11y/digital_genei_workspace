<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('presence_status')->default('offline')->after('status');
            $table->timestamp('last_seen_at')->nullable()->after('presence_status');
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->boolean('encryption_enabled')->default(false)->after('channelId');
            $table->text('encryption_meta')->nullable()->after('encryption_enabled');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->json('link_previews')->nullable()->after('attachments');
            $table->string('forwarded_from_message_id')->nullable()->index()->after('parentId');
            $table->string('forwarded_from_chat_id')->nullable()->index()->after('forwarded_from_message_id');
            $table->string('audio_path')->nullable()->after('audioDuration');
            $table->string('audio_mime')->nullable()->after('audio_path');
            $table->unsignedBigInteger('audio_size')->nullable()->after('audio_mime');
            $table->text('encrypted_payload')->nullable()->after('content');
            $table->text('encryption_meta')->nullable()->after('encrypted_payload');
            $table->string('moderation_status')->default('active')->index()->after('is_starred');
            $table->timestamp('reported_at')->nullable()->after('moderation_status');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'link_previews',
                'forwarded_from_message_id',
                'forwarded_from_chat_id',
                'audio_path',
                'audio_mime',
                'audio_size',
                'encrypted_payload',
                'encryption_meta',
                'moderation_status',
                'reported_at',
            ]);
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['encryption_enabled', 'encryption_meta']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['presence_status', 'last_seen_at']);
        });
    }
};
