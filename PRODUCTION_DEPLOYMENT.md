# Production deployment

The deployable web client is `teamsync`; `digital_genei_flutter` remains a UI prototype and must not be published until its authentication and API client are completed.

## Backend

Use PHP 8.3+, HTTPS, a managed PostgreSQL/MySQL database, Redis-backed cache/queues, and a supported Laravel broadcast provider. Set at minimum:

Install the selected broadcaster before building the release. For the included Pusher configuration:

```bash
composer require pusher/pusher-php-server:^7.0
```

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
APP_KEY=<generated with php artisan key:generate --show>
CORS_ALLOWED_ORIGINS=https://app.example.com
DB_CONNECTION=pgsql
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
SESSION_SECURE_COOKIE=true
LOG_LEVEL=warning
SEED_DEMO_DATA=false
```

Run `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force`, `php artisan storage:link`, `php artisan optimize`, and a supervised `php artisan queue:work --tries=3`. Configure the selected broadcast provider and run its server/worker as documented by that provider.

Create real users with hashed passwords through an administrator-only provisioning process. Never run `WorkspaceSeeder` in production.

## Web client

Set `VITE_API_URL=https://api.example.com/api`, run `npm ci && npm run build`, and serve `teamsync/dist` through HTTPS with a restrictive Content Security Policy.

## Release checks

Run `php artisan test`, `npm run lint`, and `npm run build`. Verify login, logout, channel messages, direct messages, access denial between unrelated users, queue processing, broadcasts, uploads, backups, rate limits, and log/alert collection in staging before promoting the release.
