<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_routes_reject_unauthenticated_requests(): void
    {
        $this->getJson('/api/chats')->assertUnauthorized();
        $this->postJson('/api/messages', ['userId' => 'spoofed', 'content' => 'x'])->assertUnauthorized();
    }

    public function test_user_can_login_and_access_identity(): void
    {
        $user = User::create([
            'id' => 'u-auth',
            'name' => 'Authenticated User',
            'email' => 'auth@example.test',
            'password' => 'correct-password',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'deviceName' => 'test',
        ])->assertOk()->assertJsonPath('user.id', $user->id);

        $this->withToken($login->json('token'))->getJson('/api/auth/me')
            ->assertOk()->assertJsonPath('id', $user->id);
    }

    public function test_invalid_password_is_rejected(): void
    {
        User::create(['id' => 'u-auth', 'name' => 'User', 'email' => 'auth@example.test', 'password' => 'correct']);
        $this->postJson('/api/auth/login', ['email' => 'auth@example.test', 'password' => 'wrong'])
            ->assertUnprocessable();
    }
}
