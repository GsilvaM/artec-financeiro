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

## Database Setup

> [!IMPORTANT]
> The 7 new CRUD tables (tecnicos, servicos, colaboradores, servicos_cadastro, metas, usuarios, permissoes) defined in `sql/002_create_new_tables.sql` need to be created manually in Supabase SQL editor for data persistence across reloads. The pages work with local state via TanStack Query optimistic updates either way.

## Quick Start

- `npm run dev` — start dev server
- `npm test` — run test suite
- `npm run build` — full build (client + SSR + Nitro)
- Default login: `admin` / `admin123`
- Tests: 158 tests across 15 files, all passing
- 7 CRUD pages: tecnicos, servicos, colaboradores, servicos-cadastro, metas, usuarios, permissoes
