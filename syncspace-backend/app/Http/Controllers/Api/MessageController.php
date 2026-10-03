<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Http\Requests\StoreMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    /**
     * GET /api/messages?channelId=c1                 → channel messages
     * GET /api/messages?directWith=u2&me=u1          → direct (1:1) thread
     * (sender `user` object is embedded automatically)
     */
    public function index(Request $request)
    {
        $query = Message::query()->whereNull('parentId'); // top-level only (no thread replies)

        if ($request->filled('channelId')) {
            $query->where('channelId', $request->channelId);
        } elseif ($request->filled('directWith')) {
            $with = $request->directWith;
            $me   = $request->user()->id;
            $query->whereNull('channelId')->where(function ($q) use ($with, $me) {
                $q->where(fn ($x) => $x->where('userId', $me)->where('recipientId', $with))
                  ->orWhere(fn ($x) => $x->where('userId', $with)->where('recipientId', $me));
            });
        } else {
            return [];
        }

        return $query->orderBy('created_at')->orderBy('id')->get();
    }

    /**
     * POST /api/messages
     * Body: { userId, content?, files?, audioDuration?,
     *         channelId? (channel msg) | recipientId? (direct msg), parentId? (thread reply) }
     */
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();

        $files = $data['attachments'] ?? $data['files'] ?? [];

        $message = Message::create([
            'id'            => 'm_' . Str::random(12),
            'channelId'     => $data['channelId'] ?? null,
            'recipientId'   => $data['recipientId'] ?? null,
            'parentId'      => $data['parentId'] ?? null,
            'userId'        => $request->user()->id,
            'content'       => $data['content'] ?? '',
            'files'         => $files,
            'attachments'   => $files,
            'audioDuration' => $data['audioDuration'] ?? null,
            'reactions'     => [],
            'isPinned'      => false,
            'is_starred'    => false,
            'repliesCount'  => 0,
            'timestamp'     => now()->format('h:i A'),
        ]);

        // a reply bumps the parent thread's count
        if (! empty($data['parentId'])) {
            Message::where('id', $data['parentId'])->increment('repliesCount');
        }

        if ($message->chat_id) {
            broadcast(new MessageSent($message))->toOthers();
        }

        return $message->fresh();
    }

    // GET /api/messages/{id}/replies  → thread replies
    public function replies(string $id)
    {
        return Message::where('parentId', $id)
            ->orderBy('created_at')->orderBy('id')->get();
    }

    /**
     * POST /api/messages/{id}/react   { emoji, userName }
     * Toggles the user's reaction for that emoji.
     */
    public function react(Request $request, string $id)
    {
        $data = $request->validate([
            'emoji'    => 'required|string',
        ]);

        $message   = Message::findOrFail($id);
        $data['userName'] = $request->user()->name;
        $reactions = $message->reactions ?? [];

        $idx = null;
        foreach ($reactions as $i => $r) {
            if (($r['emoji'] ?? null) === $data['emoji']) {
                $idx = $i;
                break;
            }
        }

        if ($idx === null) {
            $reactions[] = ['emoji' => $data['emoji'], 'userNames' => [$data['userName']]];
        } else {
            $names = $reactions[$idx]['userNames'] ?? [];
            if (in_array($data['userName'], $names)) {
                $names = array_values(array_filter($names, fn ($n) => $n !== $data['userName']));
            } else {
                $names[] = $data['userName'];
            }
            if (empty($names)) {
                array_splice($reactions, $idx, 1);
            } else {
                $reactions[$idx]['userNames'] = $names;
            }
        }

        $message->reactions = array_values($reactions);
        $message->save();

        return $message->fresh();
    }

    // PUT /api/messages/{id}/pin  → toggle pin
    public function pin(Request $request, string $id)
    {
        $message = Message::findOrFail($id);
        abort_unless($message->userId === $request->user()->id, 403);
        $message->isPinned = ! $message->isPinned;
        $message->save();

        return $message->fresh();
    }

    // PUT /api/messages/{id}  → edit content
    public function update(Request $request, string $id)
    {
        $message = Message::findOrFail($id);
        abort_unless($message->userId === $request->user()->id, 403);
        $message->content = $request->input('content', $message->content);
        $message->edited_at = now();
        $message->save();

        if ($message->chat_id) {
            broadcast(new MessageUpdated($message))->toOthers();
        }

        return $message->fresh();
    }

    // DELETE /api/messages/{id}
    public function destroy(Request $request, string $id)
    {
        $message = Message::find($id);
        abort_unless(! $message || $message->userId === $request->user()->id, 403);
        if ($message && $message->parentId) {
            Message::where('id', $message->parentId)
                ->where('repliesCount', '>', 0)
                ->decrement('repliesCount');
        }
        if ($message) {
            $message->delete();

            if ($message->chat_id) {
                broadcast(new MessageDeleted($message))->toOthers();
            }
        }

        return response()->json(['deleted' => true]);
    }
}
