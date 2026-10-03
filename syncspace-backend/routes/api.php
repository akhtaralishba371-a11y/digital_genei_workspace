<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ChannelController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\GeminiController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/ping', fn () => ['ok' => true, 'service' => 'teamsync-api']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

// Users
Route::get('/users', [UserController::class, 'index']);

// Channels
Route::get('/channels', [ChannelController::class, 'index']);
Route::post('/channels', [ChannelController::class, 'store']);

// Chat management API (direct/group chats, members, messages, reactions, unread counts)
Route::get('/chats', [ChatController::class, 'index']);
Route::post('/chats', [ChatController::class, 'store'])->middleware('throttle:messages');
Route::get('/chats/{id}', [ChatController::class, 'show']);
Route::delete('/chats/{id}', [ChatController::class, 'destroy']);
Route::post('/chats/{id}/join', [ChatController::class, 'join']);
Route::post('/chats/{id}/leave', [ChatController::class, 'leave']);
Route::post('/chats/{id}/typing', [ChatController::class, 'typing'])->middleware('throttle:messages');
Route::post('/chats/{id}/members', [ChatController::class, 'addMember']);
Route::delete('/chats/{id}/members/{userId}', [ChatController::class, 'removeMember']);
Route::get('/chats/{id}/messages', [ChatController::class, 'messages']);
Route::post('/chats/{id}/messages', [ChatController::class, 'sendMessage'])->middleware('throttle:messages');
Route::put('/chats/{id}/read', [ChatController::class, 'markRead']);
Route::put('/messages/{id}/read', [ChatController::class, 'markMessageRead']);
Route::put('/messages/{id}', [ChatController::class, 'updateMessage']);
Route::delete('/messages/{id}', [ChatController::class, 'deleteMessage']);
Route::post('/messages/{id}/reactions', [ChatController::class, 'addReaction'])->middleware('throttle:messages');
Route::delete('/messages/{id}/reactions/{emoji}', [ChatController::class, 'removeReaction']);
Route::get('/notifications', [ChatController::class, 'notifications']);
Route::get('/presence', [ChatController::class, 'presence']);
Route::put('/presence', [ChatController::class, 'updatePresence'])->middleware('throttle:messages');
Route::get('/chats/{id}/draft', [ChatController::class, 'draft']);
Route::put('/chats/{id}/draft', [ChatController::class, 'saveDraft'])->middleware('throttle:messages');
Route::delete('/chats/{id}/draft', [ChatController::class, 'deleteDraft']);
Route::post('/chats/{id}/voice-notes', [ChatController::class, 'sendVoiceNote'])->middleware('throttle:messages');
Route::get('/chats/{id}/summary', [ChatController::class, 'summary']);
Route::put('/chats/{id}/encryption', [ChatController::class, 'updateEncryption']);
Route::post('/link-previews', [ChatController::class, 'linkPreview'])->middleware('throttle:messages');
Route::post('/messages/{id}/forward', [ChatController::class, 'forwardMessage'])->middleware('throttle:messages');
Route::post('/messages/{id}/report', [ChatController::class, 'reportMessage'])->middleware('throttle:messages');
Route::put('/messages/{id}/moderation', [ChatController::class, 'moderateMessage']);

// Legacy channel/direct/thread messages
Route::middleware('throttle:legacy')->group(function () {
Route::get('/messages', [MessageController::class, 'index']);                 // ?channelId= or ?directWith=&me=
Route::post('/messages', [MessageController::class, 'store']);                 // send (channel/DM/reply)
Route::get('/messages/{id}/replies', [MessageController::class, 'replies']);   // thread replies
Route::post('/messages/{id}/react', [MessageController::class, 'react']);      // toggle reaction
Route::put('/messages/{id}/pin', [MessageController::class, 'pin']);           // toggle pin
});

// Documents
Route::get('/documents', [DocumentController::class, 'index']);
Route::post('/documents', [DocumentController::class, 'store']);
Route::put('/documents/{id}', [DocumentController::class, 'update']);

// Tasks (Kanban / Sprint board)
Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

// Admin: activity / audit logs
Route::get('/activity-logs', [ActivityLogController::class, 'index']);

// Marketplace apps
Route::get('/marketplace', [MarketplaceController::class, 'index']);
Route::put('/marketplace/{id}', [MarketplaceController::class, 'update']);

// Admin: billing
Route::get('/billing', [BillingController::class, 'show']);

// Admin: workspace settings (appearance + white-label)
Route::get('/settings', [SettingsController::class, 'show']);
Route::put('/settings', [SettingsController::class, 'update']);

// Gemini AI summaries
Route::post('/gemini/summarize', [GeminiController::class, 'summarize']);

});

// Sanctum-protected example for later auth
