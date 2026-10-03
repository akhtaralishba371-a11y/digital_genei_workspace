<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->string('direct_key', 64)->nullable()->after('type');
        });
        $seen = [];
        DB::table('chats')->where('type', 'direct')->orderBy('id')->each(function ($chat) use (&$seen): void {
            $members = DB::table('chat_user')->where('chat_id', $chat->id)->orderBy('user_id')->pluck('user_id');
            $key = hash('sha256', $members->implode('|'));
            if (isset($seen[$key])) {
                throw new RuntimeException("Duplicate direct chats {$seen[$key]} and {$chat->id} must be merged before migration.");
            }
            $seen[$key] = $chat->id;
            DB::table('chats')->where('id', $chat->id)->update(['direct_key' => $key]);
        });
        Schema::table('chats', fn (Blueprint $table) => $table->unique('direct_key'));
        Schema::table('chats', fn (Blueprint $table) => $table->text('encryption_meta')->nullable()->change());
        Schema::table('messages', fn (Blueprint $table) => $table->text('encryption_meta')->nullable()->change());

        Schema::create('message_reads', function (Blueprint $table) {
            $table->string('message_id');
            $table->string('user_id');
            $table->timestamp('read_at');
            $table->primary(['message_id', 'user_id']);
            $table->index(['user_id', 'read_at']);
            $table->foreign('message_id')->references('id')->on('messages')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['chat_id', 'parentId', 'created_at'], 'messages_chat_parent_created_idx');
            $table->index(['channelId', 'parentId', 'created_at'], 'messages_channel_parent_created_idx');
            $table->index(['userId', 'recipientId', 'created_at'], 'messages_direct_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_chat_parent_created_idx');
            $table->dropIndex('messages_channel_parent_created_idx');
            $table->dropIndex('messages_direct_created_idx');
        });
        Schema::dropIfExists('message_reads');
        Schema::table('chats', fn (Blueprint $table) => $table->dropUnique(['direct_key']));
        Schema::table('chats', fn (Blueprint $table) => $table->dropColumn('direct_key'));
    }
};
