<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;

class GeminiController extends Controller
{
    // POST /api/gemini/summarize  { channelId?, documentId? }
    public function summarize(Request $request)
    {
        $apiKey = config('services.gemini.key');

        // Build the text to summarize from real DB content
        if ($request->filled('documentId')) {
            $doc = Document::find($request->documentId);
            $text = $doc
                ? collect($doc->blocks)->pluck('content')->implode("\n")
                : '';
            $prompt = "Summarize this document in 2-3 concise sentences:\n\n{$text}";
        } else {
            $messages = Message::where('channelId', $request->channelId)
                ->latest()->limit(200)->get()->sortBy('created_at');
            $text = $messages
                ->map(fn ($m) => optional($m->user)->name . ": {$m->content}")
                ->implode("\n");
            $prompt = "Summarize this team conversation in 2-3 concise sentences:\n\n{$text}";
        }

        // No API key → graceful demo fallback (so the app still works)
        if (! $apiKey) {
            return response()->json([
                'summary' => '(Demo) Add GEMINI_API_KEY to your .env to get real AI summaries. '
                    . 'This conversation/document covers collaborative specs, mobile approvals, and workflow reviews.',
            ]);
        }

        $model = config('services.gemini.model', 'gemini-2.0-flash');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        try {
            $response = Http::connectTimeout(3)->timeout(15)->withHeaders(['x-goog-api-key' => $apiKey])->post($url, [
                'contents' => [[
                    'parts' => [['text' => $prompt]],
                ]],
            ]);
        } catch (ConnectionException $exception) {
            Log::channel('chat_failures')->warning('gemini_connection_failure', ['error' => $exception->getMessage()]);
            return response()->json(['message' => 'The summary service is temporarily unavailable.'], 503);
        } catch (\Throwable $exception) {
            Log::channel('chat_failures')->error('gemini_failure', ['error' => $exception->getMessage()]);
            return response()->json(['message' => 'The summary service failed.'], 502);
        }

        if (! $response->successful()) {
            Log::channel('chat_failures')->warning('gemini_http_failure', ['status' => $response->status()]);
            return response()->json(['message' => 'The summary service rejected the request.'], 502);
        }

        $summary = data_get(
            $response->json(),
            'candidates.0.content.parts.0.text',
            'No summary generated.'
        );

        return response()->json(['summary' => trim($summary)]);
    }
}
