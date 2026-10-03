<?php

namespace App\Http\Controllers\Api;

use App\Events\ChatTyping;
use App\Events\MessageDeleted;
use App\Events\MessageReactionUpdated;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Models\ActivityLog;
use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Chat;
use App\Models\ChatDraft;
use App\Models\Message;
use App\Models\MessageReport;
use App\Models\Reaction;
use App\Models\User;
use App\Http\Requests\StoreMessageRequest;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $this->currentUserId($request);

        $chats = Chat::query()
            ->with(['members', 'messages' => fn ($query) => $query->latest()->limit(1)])
            ->whereHas('members', fn ($query) => $query->where('users.id', $userId))
            ->latest('updated_at')
            ->get()
            ->map(fn (Chat $chat) => $this->chatPayload($chat, $userId));

        return $this->ok($chats);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $chat = $this->memberChat($id, $userId)
            ->with(['members', 'messages' => fn ($query) => $this->messageFilters($query, $request)->latest()->limit(30)])
            ->firstOrFail();

        return $this->ok([
            'chat' => $this->chatPayload($chat, $userId),
            'messages' => $chat->messages->sortBy('created_at')->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|in:direct,group',
            'name' => 'nullable|string|max:255',
            'userId' => 'nullable|string',
            'memberIds' => 'required|array|min:1',
            'memberIds.*' => 'string',
        ]);

        $ownerId = $this->currentUserId($request, $data['userId'] ?? null);
        $memberIds = collect($data['memberIds'])->push($ownerId)->unique()->values();
        $directKey = $data['type'] === 'direct'
            ? hash('sha256', $memberIds->sort()->implode('|'))
            : null;

        if ($data['type'] === 'direct' && $memberIds->count() !== 2) {
            return $this->fail('Direct chats must include exactly two unique members.', 422);
        }

        try {
        $chat = retry(3, fn () => DB::transaction(function () use ($data, $memberIds, $ownerId, $directKey) {
            if ($data['type'] === 'direct') {
                $existing = Chat::where('direct_key', $directKey)->first();

                if ($existing) {
                    return $existing->load('members');
                }
            }

            $channel = null;
            if ($data['type'] === 'group') {
                $channel = Channel::create([
                    'id' => 'c_'.Str::random(8),
                    'name' => $data['name'] ?? 'New group chat',
                    'description' => null,
                    'isPrivate' => true,
                ]);
            }

            $chat = Chat::create([
                'id' => 'chat_'.Str::random(12),
                'type' => $data['type'],
                'direct_key' => $directKey,
                'name' => $data['type'] === 'group' ? ($data['name'] ?? 'New group chat') : null,
                'channelId' => $channel?->id,
            ]);

            $chat->members()->attach($memberIds->mapWithKeys(fn ($id) => [
                $id => ['role' => $id === $ownerId ? 'admin' : 'member'],
            ])->all());

            return $chat->load('members');
        }, 3), 20, fn (\Throwable $e) => $e instanceof UniqueConstraintViolationException);
        } catch (UniqueConstraintViolationException $exception) {
            $chat = Chat::where('direct_key', $directKey)->with('members')->firstOrFail();
        }

        return $this->ok($this->chatPayload($chat, $ownerId), 201);
    }

    public function join(Request $request, string $id): JsonResponse
    {
        return $this->fail('Group chats are invitation-only.', 403);
    }

    public function leave(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $chat = $this->memberChat($id, $userId)->firstOrFail();
        $chat->members()->detach($userId);

        return $this->ok(['left' => true]);
    }

    public function addMember(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['userId' => 'required|string']);
        $actorId = $this->currentUserId($request, $request->query('me'));
        $chat = $this->adminChat($id, $actorId)->where('type', 'group')->first();
        if (! $chat) {
            return $this->fail('Only chat admins can add members.', 403);
        }
        $chat->members()->syncWithoutDetaching([$data['userId'] => ['role' => 'member']]);

        return $this->ok($this->chatPayload($chat->fresh('members'), $actorId));
    }

    public function removeMember(Request $request, string $id, string $userId): JsonResponse
    {
        $actorId = $this->currentUserId($request);
        $chat = $this->adminChat($id, $actorId)->where('type', 'group')->first();
        if (! $chat) {
            return $this->fail('Only chat admins can remove members.', 403);
        }

        $target = $chat->members()->where('users.id', $userId)->first();
        if (! $target) {
            return $this->fail('The selected user is not a chat member.', 404);
        }

        if ($target->pivot->role === 'admin') {
            return $this->fail('Chat admins cannot be removed.', 422);
        }
        $chat->members()->detach($userId);

        return $this->ok($this->chatPayload($chat->fresh('members'), $actorId));
    }

    public function typing(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['isTyping' => 'nullable|boolean']);
        $userId = $this->currentUserId($request);
        $this->memberChat($id, $userId)->firstOrFail();

        broadcast(new ChatTyping($id, $userId, $data['isTyping'] ?? true))->toOthers();

        return $this->ok([
            'chatId' => $id,
            'userId' => $userId,
            'isTyping' => $data['isTyping'] ?? true,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $chat = $this->adminChat($id, $userId)->first();
        if (! $chat) {
            return $this->fail('Only chat admins can delete chats.', 403);
        }
        $chat->delete();

        return $this->ok(['deleted' => true]);
    }

    public function messages(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $this->memberChat($id, $userId)->firstOrFail();

        $messages = $this->messageFilters(Message::where('chat_id', $id)->whereNull('parentId'), $request)
            ->orderByDesc('created_at')
            ->paginate($request->integer('perPage', 30));

        return $this->ok($messages);
    }

    public function sendMessage(StoreMessageRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $chat = $this->memberChat($id, $userId)->firstOrFail();
        $text = $data['message'] ?? $data['content'] ?? '';
        $attachments = $data['attachments'] ?? $data['files'] ?? [];

        $message = Message::create([
            'id' => 'm_'.Str::random(12),
            'chat_id' => $chat->id,
            'channelId' => $chat->channelId,
            'parentId' => $data['parentId'] ?? null,
            'userId' => $userId,
            'content' => $text,
            'encrypted_payload' => $data['encryptedPayload'] ?? null,
            'encryption_meta' => $data['encryptionMeta'] ?? null,
            'attachments' => $attachments,
            'files' => $attachments,
            'link_previews' => $data['linkPreviews'] ?? $this->linkPreviewsForText($text),
            'audioDuration' => $data['audioDuration'] ?? null,
            'audio_path' => $data['audioPath'] ?? null,
            'audio_mime' => $data['audioMime'] ?? null,
            'audio_size' => $data['audioSize'] ?? null,
            'reactions' => [],
            'isPinned' => false,
            'is_starred' => false,
            'repliesCount' => 0,
            'timestamp' => now()->format('h:i A'),
        ]);

        if (! empty($data['parentId'])) {
            Message::where('id', $data['parentId'])->increment('repliesCount');
        }

        $chat->touch();
        broadcast(new MessageSent($message))->toOthers();

        return $this->ok($message->fresh(), 201);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $chat = $this->memberChat($id, $userId)->firstOrFail();
        $readAt = now();

        $chat->members()->updateExistingPivot($userId, ['last_read_at' => $readAt]);
        $rows = Message::where('chat_id', $id)->where('userId', '!=', $userId)->pluck('id')->map(fn ($messageId) => [
            'message_id' => $messageId, 'user_id' => $userId, 'read_at' => $readAt,
        ])->all();
        if ($rows) {
            DB::table('message_reads')->upsert($rows, ['message_id', 'user_id'], ['read_at']);
        }

        return $this->ok(['chatId' => $id, 'lastReadAt' => $readAt]);
    }

    public function markMessageRead(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $message = Message::findOrFail($id);
        if ($message->chat_id) {
            $this->memberChat($message->chat_id, $userId)->firstOrFail();
        }

        $message->markAsReadBy($userId);

        return $this->ok($message->fresh());
    }

    public function updateMessage(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'message' => 'nullable|string',
            'content' => 'nullable|string',
            'isPinned' => 'nullable|boolean',
            'isStarred' => 'nullable|boolean',
        ]);

        $message = Message::findOrFail($id);
        $actorId = $this->currentUserId($request);
        abort_unless($message->userId === $actorId, 403, 'Only the sender can edit this message.');
        if (array_key_exists('message', $data) || array_key_exists('content', $data)) {
            $message->content = $data['message'] ?? $data['content'] ?? '';
            $message->edited_at = now();
        }
        if (array_key_exists('isPinned', $data)) {
            $message->isPinned = $data['isPinned'];
        }
        if (array_key_exists('isStarred', $data)) {
            $message->is_starred = $data['isStarred'];
        }
        $message->save();

        if ($message->chat_id) {
            broadcast(new MessageUpdated($message))->toOthers();
        }

        return $this->ok($message->fresh());
    }

    public function deleteMessage(Request $request, string $id): JsonResponse
    {
        $message = Message::findOrFail($id);
        $actorId = $this->currentUserId($request);
        $isChatAdmin = $message->chat_id && $this->adminChat($message->chat_id, $actorId)->exists();
        abort_unless($message->userId === $actorId || $isChatAdmin, 403, 'Only the sender or a chat admin can delete this message.');
        $message->delete();

        if ($message->chat_id) {
            broadcast(new MessageDeleted($message))->toOthers();
        }

        return $this->ok(['deleted' => true, 'messageId' => $id]);
    }

    public function addReaction(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'reaction' => 'nullable|string',
            'emoji' => 'nullable|string',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $message = Message::findOrFail($id);
        if ($message->chat_id) {
            $this->memberChat($message->chat_id, $userId)->firstOrFail();
        }
        $reaction = $data['reaction'] ?? $data['emoji'] ?? null;

        if (! $reaction) {
            return $this->fail('A reaction or emoji value is required.', 422);
        }

        Reaction::firstOrCreate([
            'message_id' => $message->id,
            'user_id' => $userId,
            'reaction' => $reaction,
        ]);

        $message = $this->syncLegacyReactions($message);
        if ($message->chat_id) {
            broadcast(new MessageReactionUpdated($message))->toOthers();
        }

        return $this->ok($message);
    }

    public function removeReaction(Request $request, string $id, string $emoji): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $message = Message::findOrFail($id);
        if ($message->chat_id) {
            $this->memberChat($message->chat_id, $userId)->firstOrFail();
        }

        Reaction::where('message_id', $message->id)
            ->where('user_id', $userId)
            ->where('reaction', $emoji)
            ->delete();

        $message = $this->syncLegacyReactions($message);
        if ($message->chat_id) {
            broadcast(new MessageReactionUpdated($message))->toOthers();
        }

        return $this->ok($message);
    }

    public function notifications(Request $request): JsonResponse
    {
        $userId = $this->currentUserId($request);

        $unread = Chat::query()
            ->whereHas('members', fn ($query) => $query->where('users.id', $userId))
            ->with('members')
            ->get()
            ->sum(fn (Chat $chat) => $this->unreadCount($chat, $userId));

        return $this->ok(['unreadCount' => $unread]);
    }

    public function updatePresence(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'status' => 'required|in:online,away,offline',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $user = User::findOrFail($userId);
        $user->forceFill([
            'presence_status' => $data['status'],
            'last_seen_at' => $data['status'] === 'offline' ? now() : $user->last_seen_at,
        ])->save();

        return $this->ok($user->fresh());
    }

    public function presence(Request $request): JsonResponse
    {
        $users = User::query()
            ->select(['id', 'name', 'avatar', 'status', 'customStatus', 'presence_status', 'last_seen_at'])
            ->when($request->filled('ids'), fn ($query) => $query->whereIn('id', explode(',', $request->query('ids'))))
            ->orderBy('name')
            ->get();

        return $this->ok($users);
    }

    public function draft(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $this->memberChat($id, $userId)->firstOrFail();

        return $this->ok(ChatDraft::where('chat_id', $id)->where('user_id', $userId)->first());
    }

    public function saveDraft(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'content' => 'nullable|string',
            'attachments' => 'nullable|array',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $this->memberChat($id, $userId)->firstOrFail();

        $draft = ChatDraft::updateOrCreate(
            ['chat_id' => $id, 'user_id' => $userId],
            ['content' => $data['content'] ?? '', 'attachments' => $data['attachments'] ?? []],
        );

        return $this->ok($draft);
    }

    public function deleteDraft(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $this->memberChat($id, $userId)->firstOrFail();
        ChatDraft::where('chat_id', $id)->where('user_id', $userId)->delete();

        return $this->ok(['deleted' => true]);
    }

    public function sendVoiceNote(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'audio' => 'required|file|mimetypes:audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/ogg|max:20480',
            'audioDuration' => 'nullable|string',
            'content' => 'nullable|string',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $chat = $this->memberChat($id, $userId)->firstOrFail();
        $file = $request->file('audio');
        $path = $file->store('chat-voice-notes', 'public');

        $message = Message::create([
            'id' => 'm_'.Str::random(12),
            'chat_id' => $chat->id,
            'channelId' => $chat->channelId,
            'userId' => $userId,
            'content' => $data['content'] ?? '',
            'attachments' => [[
                'type' => 'voice',
                'url' => Storage::disk('public')->url($path),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]],
            'files' => [],
            'audioDuration' => $data['audioDuration'] ?? null,
            'audio_path' => $path,
            'audio_mime' => $file->getMimeType(),
            'audio_size' => $file->getSize(),
            'reactions' => [],
            'isPinned' => false,
            'is_starred' => false,
            'repliesCount' => 0,
            'timestamp' => now()->format('h:i A'),
        ]);

        $chat->touch();
        broadcast(new MessageSent($message))->toOthers();

        return $this->ok($message->fresh(), 201);
    }

    public function linkPreview(Request $request): JsonResponse
    {
        $data = $request->validate(['url' => 'required|url']);
        $this->assertPublicHttpUrl($data['url']);

        return $this->ok($this->fetchLinkPreview($data['url']));
    }

    public function forwardMessage(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'chatIds' => 'required|array|min:1',
            'chatIds.*' => 'string',
            'note' => 'nullable|string',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $forwarded = DB::transaction(function () use ($data, $id, $userId) {
            $source = Message::whereKey($id)->lockForUpdate()->firstOrFail();
            if ($source->chat_id) {
                $this->memberChat($source->chat_id, $userId)->firstOrFail();
            }
            $targets = collect($data['chatIds'])->unique()->mapWithKeys(fn (string $chatId) => [
                $chatId => $this->memberChat($chatId, $userId)->lockForUpdate()->firstOrFail(),
            ]);

            return $targets->map(function (Chat $target) use ($data, $source, $userId) {
            [$attachments, $files, $audioPath] = $this->cloneForwardedFiles($source);

            $message = Message::create([
                'id' => 'm_'.Str::random(12),
                'chat_id' => $target->id,
                'channelId' => $target->channelId,
                'userId' => $userId,
                'content' => $data['note'] ?? $source->content,
                'attachments' => $attachments,
                'files' => $files,
                'link_previews' => $source->link_previews ?? [],
                'forwarded_from_message_id' => $source->id,
                'forwarded_from_chat_id' => $source->chat_id,
                'encrypted_payload' => $source->encrypted_payload,
                'encryption_meta' => $source->encryption_meta,
                'audioDuration' => $source->audioDuration,
                'audio_path' => $audioPath,
                'audio_mime' => $source->audio_mime,
                'audio_size' => $source->audio_size,
                'reactions' => [],
                'isPinned' => false,
                'is_starred' => false,
                'repliesCount' => 0,
                'timestamp' => now()->format('h:i A'),
            ]);

            $target->touch();
            DB::afterCommit(fn () => broadcast(new MessageSent($message))->toOthers());

            return $message->fresh();
            })->values();
        }, 3);

        return $this->ok($forwarded, 201);
    }

    public function summary(Request $request, string $id): JsonResponse
    {
        $userId = $this->currentUserId($request);
        $this->memberChat($id, $userId)->firstOrFail();

        $messages = Message::where('chat_id', $id)
            ->whereNull('parentId')
            ->when($request->boolean('unreadOnly'), function ($query) use ($id, $userId) {
                $member = Chat::find($id)?->members()->where('users.id', $userId)->first();
                $lastReadAt = $member?->pivot?->last_read_at;
                $query->when($lastReadAt, fn ($q) => $q->where('created_at', '>', $lastReadAt));
            })
            ->latest()
            ->limit($request->integer('limit', 50))
            ->get()
            ->reverse()
            ->values();

        $highlights = $messages
            ->filter(fn (Message $message) => filled($message->content))
            ->take(8)
            ->map(fn (Message $message) => Str::limit($message->user?->name.': '.$message->content, 180))
            ->values();

        return $this->ok([
            'chatId' => $id,
            'messageCount' => $messages->count(),
            'summary' => $highlights->isEmpty()
                ? 'No readable messages are available to summarize.'
                : 'Recent discussion highlights: '.$highlights->implode(' | '),
            'highlights' => $highlights,
        ]);
    }

    public function reportMessage(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'reason' => 'required|string|max:120',
            'details' => 'nullable|string|max:2000',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $message = Message::findOrFail($id);
        if ($message->chat_id) {
            $this->memberChat($message->chat_id, $userId)->firstOrFail();
        }

        $report = MessageReport::create([
            'message_id' => $message->id,
            'chat_id' => $message->chat_id,
            'reporter_id' => $userId,
            'reason' => $data['reason'],
            'details' => $data['details'] ?? null,
        ]);

        $message->forceFill([
            'moderation_status' => 'reported',
            'reported_at' => now(),
        ])->save();

        $this->logChatAction($request, $userId, 'message.reported', $message->id);

        return $this->ok($report, 201);
    }

    public function moderateMessage(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'status' => 'required|in:active,reported,hidden,removed',
            'reportId' => 'nullable|integer',
        ]);

        $actorId = $this->currentUserId($request, $data['userId'] ?? null);
        $message = Message::findOrFail($id);
        if ($message->chat_id) {
            abort_unless($this->adminChat($message->chat_id, $actorId)->exists() || $request->user()->role === 'admin', 403);
        } else {
            abort_unless($request->user()->role === 'admin', 403);
        }

        $message->forceFill(['moderation_status' => $data['status']])->save();
        if (! empty($data['reportId'])) {
            MessageReport::where('id', $data['reportId'])->update([
                'status' => $data['status'] === 'active' ? 'closed' : 'actioned',
                'reviewed_by' => $actorId,
                'reviewed_at' => now(),
            ]);
        }

        $this->logChatAction($request, $actorId, 'message.moderated.'.$data['status'], $message->id);

        return $this->ok($message->fresh());
    }

    public function updateEncryption(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'userId' => 'nullable|string',
            'enabled' => 'required|boolean',
            'metadata' => 'nullable|array',
        ]);

        $userId = $this->currentUserId($request, $data['userId'] ?? null);
        $chat = $this->memberChat($id, $userId)->firstOrFail();
        $chat->forceFill([
            'encryption_enabled' => $data['enabled'],
            'encryption_meta' => $data['metadata'] ?? [],
        ])->save();

        $this->logChatAction($request, $userId, 'chat.encryption.'.($data['enabled'] ? 'enabled' : 'disabled'), $chat->id);

        return $this->ok($this->chatPayload($chat->fresh('members'), $userId));
    }

    private function currentUserId(Request $request, ?string $fallback = null): string
    {
        return (string) $request->user()->id;
    }

    private function memberChat(string $id, string $userId)
    {
        return Chat::query()
            ->where('id', $id)
            ->whereHas('members', fn ($query) => $query->where('users.id', $userId));
    }

    private function adminChat(string $id, string $userId)
    {
        return Chat::query()
            ->where('id', $id)
            ->whereHas('members', fn ($query) => $query
                ->where('users.id', $userId)
                ->where('chat_user.role', 'admin'));
    }

    private function messageFilters($query, Request $request)
    {
        return $query
            ->when($request->filled('keyword'), fn ($q) => $q->where('content', 'like', '%'.$request->keyword.'%'))
            ->when($request->filled('userId'), fn ($q) => $q->where('userId', $request->userId))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->to));
    }

    private function chatPayload(Chat $chat, string $userId): array
    {
        return [
            'id' => $chat->id,
            'type' => $chat->type,
            'name' => $chat->name,
            'channelId' => $chat->channelId,
            'encryptionEnabled' => $chat->encryption_enabled,
            'encryptionMeta' => $chat->encryption_meta,
            'encryptionNotice' => $chat->encryption_enabled
                ? 'Encryption metadata is protected at rest. End-to-end secrecy depends on client-side key handling.'
                : null,
            'members' => $chat->members,
            'lastMessage' => $chat->messages->first(),
            'unreadCount' => $this->unreadCount($chat, $userId),
            'createdAt' => $chat->created_at,
            'updatedAt' => $chat->updated_at,
        ];
    }

    private function unreadCount(Chat $chat, string $userId): int
    {
        $member = $chat->members->firstWhere('id', $userId);
        $lastReadAt = $member?->pivot?->last_read_at;

        return Message::where('chat_id', $chat->id)
            ->where('userId', '!=', $userId)
            ->when($lastReadAt, fn ($query) => $query->where('created_at', '>', $lastReadAt))
            ->count();
    }

    private function syncLegacyReactions(Message $message): Message
    {
        $legacy = Reaction::where('message_id', $message->id)
            ->get()
            ->groupBy('reaction')
            ->map(fn ($items, $emoji) => [
                'emoji' => $emoji,
                'userNames' => $items->pluck('user_id')->values()->all(),
            ])
            ->values()
            ->all();

        $message->reactions = $legacy;
        $message->save();

        return $message->fresh();
    }

    private function linkPreviewsForText(?string $text): array
    {
        if (! $text || ! preg_match_all('/https?:\/\/[^\s<>"\']+/i', $text, $matches)) {
            return [];
        }

        return collect($matches[0])
            ->unique()
            ->take(3)
            ->map(fn (string $url) => $this->fetchLinkPreview($url))
            ->values()
            ->all();
    }

    private function fetchLinkPreview(string $url): array
    {
        $preview = [
            'url' => $url,
            'title' => parse_url($url, PHP_URL_HOST),
            'description' => null,
            'image' => null,
        ];

        try {
            $response = Http::connectTimeout(2)->timeout(4)->withoutRedirecting()->get($url);
            if (! $response->successful()) {
                $this->logFailure('link_preview_http_failure', ['url' => $url, 'status' => $response->status()]);
                return $preview;
            }

            $html = Str::limit($response->body(), 300000, '');
            $preview['title'] = $this->metaContent($html, 'og:title')
                ?? $this->htmlTitle($html)
                ?? $preview['title'];
            $preview['description'] = $this->metaContent($html, 'og:description')
                ?? $this->metaContent($html, 'description');
            $preview['image'] = $this->metaContent($html, 'og:image');
        } catch (ConnectionException $exception) {
            $this->logFailure('link_preview_connection_failure', ['url' => $url, 'error' => $exception->getMessage()]);
            return $preview;
        } catch (\Throwable $exception) {
            $this->logFailure('link_preview_failure', ['url' => $url, 'error' => $exception->getMessage()]);
            return $preview;
        }

        return $preview;
    }

    private function assertPublicHttpUrl(string $url): void
    {
        $parts = parse_url($url);
        abort_unless(in_array($parts['scheme'] ?? '', ['http', 'https'], true), 422, 'Only HTTP(S) URLs are supported.');
        $host = $parts['host'] ?? '';
        abort_if($host === '' || strtolower($host) === 'localhost', 422, 'Private network URLs are not allowed.');

        $addresses = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : gethostbynamel($host);
        abort_if(! $addresses, 422, 'The URL host could not be resolved.');
        foreach ($addresses as $address) {
            abort_if(filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false, 422, 'Private network URLs are not allowed.');
        }
    }

    private function cloneForwardedFiles(Message $source): array
    {
        $cloneItems = function (array $items): array {
            return collect($items)->map(function (array $item) {
                $path = $item['path'] ?? null;
                if ($path && Storage::disk('public')->exists($path)) {
                    $copy = 'chat-forwards/'.Str::uuid().'-'.basename($path);
                    Storage::disk('public')->copy($path, $copy);
                    $item['path'] = $copy;
                    $item['url'] = Storage::disk('public')->url($copy);
                }
                return $item;
            })->all();
        };

        $audioPath = $source->audio_path;
        if ($audioPath && Storage::disk('public')->exists($audioPath)) {
            $copy = 'chat-forwards/'.Str::uuid().'-'.basename($audioPath);
            Storage::disk('public')->copy($audioPath, $copy);
            $audioPath = $copy;
        }

        return [$cloneItems($source->attachments ?? []), $cloneItems($source->files ?? []), $audioPath];
    }

    private function metaContent(string $html, string $name): ?string
    {
        $escaped = preg_quote($name, '/');
        if (preg_match('/<meta[^>]+(?:property|name)=["\']'.$escaped.'["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $match)) {
            return html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5);
        }

        return null;
    }

    private function htmlTitle(string $html): ?string
    {
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $match)) {
            return trim(html_entity_decode(strip_tags($match[1]), ENT_QUOTES | ENT_HTML5));
        }

        return null;
    }

    private function logChatAction(Request $request, string $userId, string $action, string $target): void
    {
        $user = User::find($userId);

        ActivityLog::create([
            'id' => 'log_'.Str::random(12),
            'userId' => $userId,
            'userName' => $user?->name ?? $userId,
            'action' => $action,
            'target' => $target,
            'ip' => $request->ip(),
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'device' => Str::limit((string) $request->userAgent(), 240, ''),
        ]);
    }

    private function logFailure(string $event, array $context): void
    {
        Log::channel('chat_failures')->warning($event, $context);
        if (config('logging.chat_failures_database')) {
            ActivityLog::create([
                'id' => 'log_'.Str::random(12), 'userId' => null, 'userName' => 'system',
                'action' => $event, 'target' => Str::limit((string) ($context['url'] ?? 'chat'), 240, ''),
                'ip' => null, 'timestamp' => now()->format('Y-m-d H:i:s'), 'device' => 'backend',
            ]);
        }
    }

    private function ok(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data], $status);
    }

    private function fail(string $message, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message], $status);
    }
}
