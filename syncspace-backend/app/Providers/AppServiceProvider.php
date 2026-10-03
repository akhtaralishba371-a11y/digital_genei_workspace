<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $request) =>
            Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('legacy', fn (Request $request) =>
            Limit::perMinute(30)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('messages', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        if ($this->app->environment('production')) {
            $problems = [];
            if (config('app.debug')) $problems[] = 'APP_DEBUG must be false';
            if (! config('app.key')) $problems[] = 'APP_KEY must be set';
            if (config('database.default') === 'sqlite') $problems[] = 'SQLite is not supported for production';
            if (in_array(config('broadcasting.default'), [null, '', 'log', 'null'], true)) $problems[] = 'A real broadcast connection is required';
            if (config('broadcasting.default') === 'pusher' && (! config('broadcasting.connections.pusher.key') || ! config('broadcasting.connections.pusher.secret') || ! config('broadcasting.connections.pusher.app_id'))) {
                $problems[] = 'Pusher credentials must be set';
            }
            if (config('broadcasting.default') === 'pusher' && ! class_exists(\Pusher\Pusher::class)) {
                $problems[] = 'pusher/pusher-php-server must be installed';
            }
            if (config('queue.default') === 'sync') $problems[] = 'A queued connection is required';
            if ($problems) {
                throw new \RuntimeException('Unsafe production configuration: '.implode('; ', $problems));
            }
        }
    }
}
