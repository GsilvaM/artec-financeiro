<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Database

This project uses **Prisma ORM** with `@prisma/client` (legacy `prisma-client-js` generator) connecting to Supabase PostgreSQL via the `@prisma/adapter-pg` adapter.

- Schema: `prisma/schema.prisma` — 9 models (PascalCase) mapping to snake_case tables via `@@map`/`@map`
- Config: `prisma.config.ts` — loads `.env` via `dotenv`, defines `DATABASE_URL` for Prisma CLI
- Runtime connection: `src/services/prisma.ts` — singleton `getPrisma()` using `PrismaPg` adapter + URL from env
- Database layer: `src/services/database.ts` — all `list*` and `replaceAll*` functions use Prisma
- Supabase client (`@supabase/supabase-js`) is still used for **Auth** (`src/lib/supabase.ts`) and **migrations** (`src/services/migrations.ts`)

### Prisma 7 notes
- Constructor accepts `{ adapter }` or `{ accelerateUrl }` — NOT `datasources` or `datasourceUrl`
- `url` property in `schema.prisma` datasource block is **not supported** by Prisma 7 CLI; use `prisma.config.ts` instead
- Use `npx prisma generate` to regenerate client after schema changes
- Decimal fields come back as `number`; `listLancamentos` uses `Number(r.valor)` to guarantee number type

## Quick Start

- `npm run dev` — start dev server
- `npm test` — run test suite (200 tests, 16 files)
- `npm run build` — full build (client + SSR + Nitro)
- Default login: `admin` / `admin123
