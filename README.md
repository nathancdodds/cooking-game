# Recipe Finder

Recipe Finder is now configured for Cloudflare Workers + D1 so it can run with persistent shared recipe storage on the Cloudflare free tier.

## Architecture

- Static frontend is served from `public/` by a Worker assets binding.
- API endpoints are handled by `src/worker.js`.
- Shared recipes are stored in D1 (SQLite) using table schema in `migrations/0001_init.sql`.

## Local Development

1. Install dependencies:
    ```bash
    npm install
    ```
2. Create a D1 database in your Cloudflare account:
    ```bash
    npx wrangler d1 create cooking-game-db
    ```
3. Copy the returned database ID into `wrangler.toml` for:
    - `database_id`
    - `preview_database_id`
4. Apply the schema locally:
    ```bash
    npm run db:migrate:local
    ```
5. Run the app:
    ```bash
    npm run dev
    ```

## Deploy to Cloudflare

1. Authenticate Wrangler:
    ```bash
    npx wrangler login
    ```
2. Make sure `wrangler.toml` has your real D1 database ID.
3. Apply schema to remote D1:
    ```bash
    npm run db:migrate:remote
    ```
4. Deploy Worker:
    ```bash
    npm run deploy
    ```

After deploy, the Worker URL serves both the site and API.

## API

- `GET /api/recipes` returns all shared recipes.
- `POST /api/recipes` saves a shared recipe.

POST body format:

```json
{
  "name": "Recipe Name",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Step-by-step instructions",
  "source": "Optional source name",
  "sourceUrl": "https://optional-source-url.example"
}
```

## Project Files

- `src/worker.js` Cloudflare Worker API and static asset gateway.
- `public/index.html` main page.
- `public/app.js` frontend logic.
- `public/styles.css` styles.
- `public/recipes.js` built-in recipe list.
- `migrations/0001_init.sql` D1 schema.
- `wrangler.toml` Cloudflare Worker and D1 configuration.

## Legacy Render Files

`server.py` and `render.yaml` are left in the repo as legacy files from the previous deployment setup.
