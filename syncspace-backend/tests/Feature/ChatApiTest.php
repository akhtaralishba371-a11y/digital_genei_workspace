<?php

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ChatApiTest extends TestCase
{
    use RefreshDatabase;

    private User $alice;
    private User $bob;
    private User $charlie;

    protected function setUp(): void
    {
        parent::setUp();

        $this->alice = $this->user('u-alice', 'Alice');
        $this->bob = $this->user('u-bob', 'Bob');
        $this->charlie = $this->user('u-charlie', 'Charlie');
        Sanctum::actingAs($this->alice, ['chat:use']);
    }

    public function test_member_can_create_and_list_a_direct_chat(): void
    {
        $create = $this->postJson('/api/chats', [
            'type' => 'direct',
            'userId' => $this->alice->id,
            'memberIds' => [$this->bob->id],
        ]);

        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'direct')
            ->assertJsonCount(2, 'data.members');

        $chatId = $create->json('data.id');
        $this->assertDatabaseHas('chat_user', ['chat_id' => $chatId, 'user_id' => $this->alice->id, 'role' => 'admin']);
        $this->assertDatabaseHas('chat_user', ['chat_id' => $chatId, 'user_id' => $this->bob->id, 'role' => 'member']);

        $this->getJson('/api/chats?userId='.$this->alice->id)
            ->assertOk()
            ->assertJsonPath('data.0.id', $chatId);
    }

    public function test_direct_chat_requires_exactly_two_unique_members(): void
    {
        $this->postJson('/api/chats', [
            'type' => 'direct',
            'userId' => $this->alice->id,
            'memberIds' => [$this->bob->id, $this->charlie->id],
        ])->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_non_member_cannot_read_or_send_messages(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        Sanctum::actingAs($this->charlie, ['chat:use']);

        $this->getJson("/api/chats/{$chat->id}/messages?userId={$this->charlie->id}")
            ->assertNotFound();

        $this->postJson("/api/chats/{$chat->id}/messages", [
            'userId' => $this->charlie->id,
            'content' => 'Not allowed',
        ])->assertNotFound();
    }

    public function test_member_can_send_and_filter_messages(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);

        $send = $this->postJson("/api/chats/{$chat->id}/messages", [
            'userId' => $this->alice->id,
            'content' => 'Release is ready',
            'attachments' => [['name' => 'notes.txt']],
        ]);

        $send->assertCreated()
            ->assertJsonPath('data.content', 'Release is ready')
            ->assertJsonPath('data.userId', $this->alice->id)
            ->assertJsonPath('data.attachments.0.name', 'notes.txt');

        $this->getJson("/api/chats/{$chat->id}/messages?userId={$this->alice->id}&keyword=Release")
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.content', 'Release is ready');

        $this->getJson("/api/chats/{$chat->id}/messages?userId={$this->alice->id}&keyword=missing")
            ->assertOk()
            ->assertJsonPath('data.total', 0);
    }

    public function test_reactions_are_idempotent_and_can_be_removed(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        $message = $this->message($chat, $this->alice, 'Nice work');

        $payload = ['userId' => $this->bob->id, 'emoji' => '👍'];
        $this->postJson("/api/messages/{$message->id}/reactions", $payload)->assertOk();
        $this->postJson("/api/messages/{$message->id}/reactions", $payload)->assertOk();

        $this->assertDatabaseCount('reactions', 1);
        $this->assertSame('👍', Message::find($message->id)->reactions[0]['emoji']);

        $this->deleteJson("/api/messages/{$message->id}/reactions/".rawurlencode('👍'), [
            'userId' => $this->bob->id,
        ])->assertOk();

        $this->assertDatabaseCount('reactions', 0);
    }

    public function test_marking_chat_read_updates_messages_and_unread_count(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        $message = $this->message($chat, $this->bob, 'Unread');

        $this->getJson('/api/notifications?userId='.$this->alice->id)
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 1);

        $this->putJson("/api/chats/{$chat->id}/read", ['userId' => $this->alice->id])
            ->assertOk();

        $this->assertDatabaseHas('message_reads', ['message_id' => $message->id, 'user_id' => $this->alice->id]);
        $this->assertTrue(Message::find($message->id)->isReadBy($this->alice));

        $this->getJson('/api/notifications?userId='.$this->alice->id)
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 0);
    }

    public function test_member_can_save_replace_fetch_and_delete_a_draft(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        $url = "/api/chats/{$chat->id}/draft";

        $this->putJson($url, ['userId' => $this->alice->id, 'content' => 'First'])->assertOk();
        $this->putJson($url, ['userId' => $this->alice->id, 'content' => 'Updated'])->assertOk();

        $this->assertDatabaseCount('chat_drafts', 1);
        $this->getJson($url.'?userId='.$this->alice->id)
            ->assertOk()
            ->assertJsonPath('data.content', 'Updated');

        $this->deleteJson($url, ['userId' => $this->alice->id])
            ->assertOk()
            ->assertJsonPath('data.deleted', true);
        $this->assertDatabaseCount('chat_drafts', 0);
    }

    public function test_presence_status_is_validated_and_persisted(): void
    {
        $this->putJson('/api/presence', [
            'userId' => $this->alice->id,
            'status' => 'online',
        ])->assertOk()->assertJsonPath('data.presence_status', 'online');

        $this->assertDatabaseHas('users', ['id' => $this->alice->id, 'presence_status' => 'online']);

        $this->putJson('/api/presence', [
            'userId' => $this->alice->id,
            'status' => 'busy',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_only_chat_admin_can_add_or_remove_group_members(): void
    {
        $chat = Chat::create(['id' => 'chat-group-'.uniqid(), 'type' => 'group', 'name' => 'Team']);
        $chat->members()->attach([
            $this->alice->id => ['role' => 'admin'],
            $this->bob->id => ['role' => 'member'],
        ]);

        Sanctum::actingAs($this->bob, ['chat:use']);
        $this->postJson("/api/chats/{$chat->id}/members?me={$this->bob->id}", [
            'userId' => $this->charlie->id,
        ])->assertForbidden()->assertJsonPath('success', false);

        Sanctum::actingAs($this->alice, ['chat:use']);
        $this->postJson("/api/chats/{$chat->id}/members?me={$this->alice->id}", [
            'userId' => $this->charlie->id,
        ])->assertOk();
        $this->assertDatabaseHas('chat_user', ['chat_id' => $chat->id, 'user_id' => $this->charlie->id]);

        Sanctum::actingAs($this->bob, ['chat:use']);
        $this->deleteJson("/api/chats/{$chat->id}/members/{$this->charlie->id}", [
            'userId' => $this->bob->id,
        ])->assertForbidden();

        Sanctum::actingAs($this->alice, ['chat:use']);
        $this->deleteJson("/api/chats/{$chat->id}/members/{$this->charlie->id}", [
            'userId' => $this->alice->id,
        ])->assertOk();
        $this->assertDatabaseMissing('chat_user', ['chat_id' => $chat->id, 'user_id' => $this->charlie->id]);
    }

    public function test_only_chat_admin_can_delete_a_chat(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);

        Sanctum::actingAs($this->bob, ['chat:use']);
        $this->deleteJson("/api/chats/{$chat->id}", ['userId' => $this->bob->id])
            ->assertForbidden()
            ->assertJsonPath('message', 'Only chat admins can delete chats.');
        $this->assertDatabaseHas('chats', ['id' => $chat->id, 'deleted_at' => null]);

        Sanctum::actingAs($this->alice, ['chat:use']);
        $this->deleteJson("/api/chats/{$chat->id}", ['userId' => $this->alice->id])
            ->assertOk()
            ->assertJsonPath('data.deleted', true);
        $this->assertSoftDeleted('chats', ['id' => $chat->id]);
    }

    public function test_empty_messages_are_rejected(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        $this->postJson("/api/chats/{$chat->id}/messages", ['content' => '   '])
            ->assertUnprocessable()->assertJsonValidationErrors('content');
    }

    public function test_direct_chat_creation_is_idempotent(): void
    {
        $payload = ['type' => 'direct', 'memberIds' => [$this->bob->id]];
        $first = $this->postJson('/api/chats', $payload)->assertCreated()->json('data.id');
        $second = $this->postJson('/api/chats', $payload)->assertCreated()->json('data.id');
        $this->assertSame($first, $second);
        $this->assertDatabaseCount('chats', 1);
    }

    public function test_forwarding_to_invalid_target_rolls_back_all_messages(): void
    {
        $sourceChat = $this->chatWith($this->alice, $this->bob);
        $targetChat = $this->chatWith($this->alice, $this->charlie);
        $source = $this->message($sourceChat, $this->alice, 'Forward me');

        $this->postJson("/api/messages/{$source->id}/forward", [
            'chatIds' => [$targetChat->id, 'missing-chat'],
        ])->assertNotFound();

        $this->assertDatabaseCount('messages', 1);
    }

    public function test_encryption_metadata_is_encrypted_at_rest(): void
    {
        $chat = $this->chatWith($this->alice, $this->bob);
        $chat->encryption_meta = ['keyId' => 'secret-key-reference'];
        $chat->save();

        $raw = DB::table('chats')->where('id', $chat->id)->value('encryption_meta');
        $this->assertStringNotContainsString('secret-key-reference', $raw);
        $this->assertSame('secret-key-reference', $chat->fresh()->encryption_meta['keyId']);
    }

    private function user(string $id, string $name): User
    {
        return User::create([
            'id' => $id,
            'name' => $name,
            'email' => $id.'@example.test',
        ]);
    }

    private function chatWith(User ...$users): Chat
    {
        $chat = Chat::create(['id' => 'chat-test-'.uniqid(), 'type' => 'direct']);
        $chat->members()->attach(collect($users)->mapWithKeys(
            fn (User $user, int $index) => [$user->id => ['role' => $index === 0 ? 'admin' : 'member']]
        )->all());

        return $chat;
    }

    private function message(Chat $chat, User $sender, string $content): Message
    {
        return Message::create([
            'id' => 'message-test-'.uniqid(),
            'chat_id' => $chat->id,
            'userId' => $sender->id,
            'content' => $content,
            'reactions' => [],
            'files' => [],
            'attachments' => [],
        ]);
    }
}
