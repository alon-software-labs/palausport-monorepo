# `@repo/supabase`

Shared **Supabase** assets for the monorepo: TypeScript clients, optional **Next.js** helpers, and the **Supabase CLI project** (config, migrations, seed).

Apps do not ship their own `supabase/config.toml` or migration folders.

## TypeScript (all apps)

- **`@repo/supabase`** — `supabaseUrl`, `supabaseKey`, `createSupabaseJsClient` (Vite / browser), `createNextBrowserSupabaseClient` (Next client components).

## Next.js (`apps/crm` and any future Next app)

- **`@repo/supabase/next`** — server + middleware adapters that depend on `next` and `next/headers`:
  - `createNextServerSupabaseClient()` — `cookies()`-backed server client for RSC / server actions.
  - `createSupabaseSessionMiddleware(config)` — returns an `updateSession` handler (Supabase cookies + role-based redirects).

`next` is an **optional peer** so `apps/reservation` (Vite) does not need to install it.

CRM wires middleware like this: import `createSupabaseSessionMiddleware`, pass route/role config, call the returned function from `middleware.ts`.

## Database migrations (single copy in git)

All migration SQL lives under **`supabase/migrations/`** inside this package (standard Supabase layout: `packages/supabase/supabase/`).

| Direction | What happens |
|-----------|----------------|
| **Remote → git** | `pnpm db:pull` — diffs linked project into a **new** migration (Docker). If you see a migration history error, run **`pnpm db:fetch`** first or **`pnpm db:sync`** (fetch + pull). |
| **Git → remote** | `pnpm db:push` — applies local migration files to the linked database. |
| **Day-to-day** | Commit only `*.sql` under `supabase/migrations/` (no README there — the CLI matches timestamps to the remote history table). |

`pnpm db:link` stores CLI link state under `supabase/.branches` (gitignored). Run it again after cloning or if the link moved here from an old app path.

See **`MIGRATIONS.md`** for `db:list` / `db:fetch` / history repair.

## Root scripts

From the monorepo root: `pnpm db:link`, `pnpm db:list`, `pnpm db:fetch`, `pnpm db:pull`, `pnpm db:sync`, `pnpm db:push` (run in `packages/supabase`).

Requires [Docker](https://docs.docker.com/desktop/) for `db pull`.
