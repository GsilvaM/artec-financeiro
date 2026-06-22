# Artec Financeiro

Sistema de controle financeiro e gestão empresarial para **Artec Ambientes Climatizados** — gestão de lançamentos, DRE, relatórios, serviços, técnicos, metas, colaboradores e muito mais.

---

## Tecnologias

| Categoria | Tecnologia |
|---|---|
| **Framework** | React 19 + TanStack Start (SSR) |
| **Router** | TanStack React Router (file-based) |
| **Build** | Vite 8 |
| **Linguagem** | TypeScript 5.8 |
| **SSR Engine** | Nitro 3 |
| **Database ORM** | Prisma 7 + `@prisma/adapter-pg` (service layer) |
| **Database Client** | Supabase PostgreSQL (`@supabase/supabase-js`) |
| **Data Fetching** | TanStack React Query v5 |
| **Server Functions** | TanStack Start `createServerFn()` (RPC-style) |
| **UI** | shadcn/ui (Radix Primitives + Tailwind v4) |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **Formulários** | react-hook-form + zod |
| **Ícones** | lucide-react |
| **Gráficos** | Recharts |
| **Notificações** | sonner |
| **Datas** | date-fns |
| **Testes** | Vitest + Testing Library |
| **Lint / Formatter** | ESLint + Prettier |
| **Auth** | localStorage (credenciais fixas: `admin` / `admin123`) |
| **Deploy** | Netlify (SSR via Netlify Functions) |
| **Gerenciador de pacotes** | Bun |

---

## Estrutura do Projeto

```
artec-cash-pal-main/
├── .env                          # Variáveis de ambiente (Supabase + Prisma)
├── .gitignore
├── AGENTS.md                     # Instruções para agentes de IA (Lovable)
├── components.json               # Configuração shadcn/ui
├── eslint.config.js
├── netlify.toml                  # Configuração de deploy Netlify
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── prisma.config.ts              # Configuração de conexão Prisma CLI
├── tsconfig.json
├── bun.lock / bunfig.toml
├── public/
│   └── logo_artec.png
├── prisma/
│   └── schema.prisma             # Schema Prisma (9 modelos)
├── sql/                          # Migrations SQL
│   ├── 000_bootstrap.sql         # Cria tabela _migrations
│   ├── 001_create_tables.sql     # Cria lancamentos + categorias
│   └── 002_create_new_tables.sql # Cria demais tabelas
├── src/
│   ├── styles.css                # Tema CSS (variáveis, animações, Tailwind)
│   ├── server.ts                 # Entry point SSR (error wrapper)
│   ├── start.ts                  # Instância TanStack Start + middleware
│   ├── router.tsx                # Criação do router com QueryClient
│   ├── routeTree.gen.ts          # Árvore de rotas (auto-gerada)
│   │
│   ├── lib/
│   │   ├── utils.ts              # cn() (clsx + tailwind-merge)
│   │   ├── supabase.ts           # Cliente Supabase anon (browser)
│   │   ├── error-capture.ts      # Captura global de erros
│   │   ├── error-page.ts         # Fallback HTML de erro
│   │   ├── auth/
│   │   │   └── auth.tsx          # Auth context (localStorage)
│   │   └── financeiro/
│   │       ├── types.ts          # Tipos de domínio
│   │       ├── calc.ts           # Motor de cálculo DRE + formatação
│   │       ├── storage.ts        # Hooks React Query (financeiro)
│   │       ├── crud-storage.ts   # Hooks CRUD genéricos
│   │       ├── server-fns.ts     # Funções de servidor (RPC)
│   │       ├── seed.ts           # Dados iniciais
│   │       └── calc.test.ts      # Testes do motor de cálculo
│   │
│   ├── services/
│   │   ├── prisma.ts             # Singleton Prisma (PrismaPg adapter)
│   │   ├── database.ts           # CRUD via Prisma (all list/replaceAll)
│   │   ├── env.ts                # Leitor de variáveis de ambiente
│   │   ├── migrations.ts         # Gerenciamento de migrations
│   │   └── migrate-cli.ts        # CLI para rodar migrations
│   │
│   ├── types/
│   │   └── database.ts           # Tipos das linhas do banco
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx        # Detecção de breakpoint mobile
│   │
│   ├── components/
│   │   ├── financeiro/
│   │   │   ├── AppSidebar.tsx    # Sidebar de navegação
│   │   │   └── PeriodoFiltro.tsx # Seletor mês/ano
│   │   └── ui/                   # 46+ componentes shadcn/ui
│   │
│   ├── routes/                   # 24 rotas (file-based)
│   │   ├── __root.tsx            # Layout raiz (AuthGuard, Sidebar, Toaster)
│   │   ├── index.tsx             # Dashboard (/)
│   │   ├── login.tsx             # Login (/login)
│   │   ├── lancamentos.tsx       # Lançamentos (/lancamentos)
│   │   ├── dre.tsx               # DRE Mensal (/dre)
│   │   ├── relatorios.tsx        # Relatórios (/relatorios)
│   │   ├── fluxo-caixa.tsx       # Fluxo de Caixa (/fluxo-caixa)
│   │   ├── servicos.tsx          # Serviços (/servicos)
│   │   ├── servicos-cadastro.tsx # Cadastro de Serviços (/servicos-cadastro)
│   │   ├── tecnicos.tsx          # Técnicos (/tecnicos)
│   │   ├── colaboradores.tsx     # Colaboradores (/colaboradores)
│   │   ├── centros-custo.tsx     # Centros de Custo (/centros-custo)
│   │   ├── metas.tsx             # Metas (/metas)
│   │   ├── ponto-equilibrio.tsx  # Ponto de Equilíbrio (/ponto-equilibrio)
│   │   ├── rentabilidade.tsx     # Rentabilidade (/rentabilidade)
│   │   ├── produtividade.tsx     # Produtividade (/produtividade)
│   │   ├── permissoes.tsx        # Permissões (/permissoes)
│   │   ├── usuarios.tsx          # Usuários (/usuarios)
│   │   ├── admin.tsx             # Admin (/admin)
│   │   ├── dashboard-proprietario.tsx  # Dashboard Proprietário
│   │   ├── relatorios-operacionais.tsx # Rel. Operacionais
│   │   ├── relatorios-centros-custo.tsx# Rel. por Centros de Custo
│   │   ├── configuracoes.tsx     # Configurações (/configuracoes)
│   │   └── README.md             # Convenções de roteamento
│   │
│   └── tests/                    # ~200 testes, 16 arquivos
│
└── dist/                         # Build de produção
```

---

## Banco de Dados

### Estratégia

- **Prisma ORM** (v7) no lado do servidor (`PrismaPg` adapter) para operações CRUD.
- **Supabase** (`@supabase/supabase-js`) no browser apenas para auth (futuro) e migrations.
- **replace-all**: ao salvar, todas as linhas são excluídas e reinseridas.

### Modelos (Prisma — 9 tabelas)

#### `lancamentos` — Lançamentos Financeiros
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `data` | `DATE NOT NULL` | Data do lançamento |
| `tipo` | `TEXT NOT NULL` | `receita`, `custo_direto`, `despesa_operacional`, `receita_financeira`, `despesa_financeira` |
| `categoria` | `TEXT NOT NULL` | Nome da categoria |
| `descricao` | `TEXT NOT NULL` | Descrição |
| `contraparte` | `TEXT NOT NULL` | Cliente ou fornecedor |
| `valor` | `NUMERIC(12,2)` | Valor |
| `status` | `TEXT NOT NULL` | `pago`, `recebido`, `pendente` |

#### `categorias` — Categorias
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID PK` | Auto-generado |
| `tipo` | `TEXT NOT NULL` | Grupo: `receitas`, `custos`, `despesas`, `deducoes`, `receitas_financeiras`, `despesas_financeiras` |
| `nome` | `TEXT NOT NULL` | Nome da categoria |

#### `tecnicos` — Técnicos
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `nome` | `TEXT NOT NULL` | Nome |
| `especialidade` | `TEXT` | Especialidade |
| `telefone` | `TEXT` | Telefone |
| `email` | `TEXT` | Email |
| `ativo` | `BOOLEAN` | Se está ativo |

#### `servicos` — Serviços Prestados
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `cliente` | `TEXT NOT NULL` | Cliente |
| `tecnico` | `TEXT` | Técnico responsável |
| `descricao` | `TEXT` | Descrição |
| `data` | `DATE NOT NULL` | Data |
| `valor` | `NUMERIC(12,2)` | Valor |
| `status` | `TEXT` | `agendado`, `em_andamento`, `concluido`, `cancelado` |

#### `colaboradores` — Colaboradores
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `nome` | `TEXT NOT NULL` | Nome |
| `cargo` | `TEXT` | Cargo |
| `departamento` | `TEXT` | Departamento |
| `telefone` | `TEXT` | Telefone |
| `email` | `TEXT` | Email |
| `ativo` | `BOOLEAN` | Se está ativo |

#### `servicos_cadastro` — Cadastro de Serviços
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `nome` | `TEXT NOT NULL` | Nome do serviço |
| `descricao` | `TEXT` | Descrição |
| `valor` | `NUMERIC(12,2)` | Valor padrão |
| `categoria` | `TEXT` | Categoria |
| `ativo` | `BOOLEAN` | Se está ativo |

#### `metas` — Metas
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `descricao` | `TEXT NOT NULL` | Descrição |
| `valor_meta` | `NUMERIC(12,2)` | Valor alvo |
| `valor_atual` | `NUMERIC(12,2)` | Valor atual |
| `periodo` | `TEXT` | Período de referência |
| `tipo` | `TEXT` | `mensal`, `trimestral`, `anual` |

#### `usuarios` — Usuários
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `nome` | `TEXT NOT NULL` | Nome |
| `username` | `TEXT UNIQUE NOT NULL` | Login |
| `role` | `TEXT` | `admin`, `user`, `proprietario` |
| `ativo` | `BOOLEAN` | Se está ativo |

#### `permissoes` — Permissões
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `TEXT PK` | UUID |
| `role` | `TEXT` | Perfil de acesso |
| `recurso` | `TEXT NOT NULL` | Nome do recurso |
| `leitura` | `BOOLEAN` | Permissão de leitura |
| `escrita` | `BOOLEAN` | Permissão de escrita |

### Seed automático

Ao iniciar, se o banco estiver vazio, o sistema popula automaticamente com dados de exemplo (lançamentos, categorias).

---

## Funcionalidades por Rota

### Dashboard (`/`)
- **4 KPIs:** Receita Bruta, Custos + Despesas, Lucro Líquido, Margem Líquida
- **4 gráficos Recharts** (receita x despesa, evolução do lucro, faturamento, despesas por categoria)
- **Filtro** por período (mês/ano)

### Login (`/login`)
- Autenticação via localStorage (credenciais fixas: `admin` / `admin123`)

### Lançamentos (`/lancamentos`)
- CRUD completo de lançamentos financeiros
- Filtros por período + busca textual
- Status visual com badges

### DRE Mensal (`/dre`)
- Demonstrativo hierárquico completo (Receita Bruta → Deduções → Custos → Despesas → Resultado Financeiro → Lucro Líquido)
- Destaque positivo (verde) / negativo (vermelho)

### Relatórios (`/relatorios`)
- Resumo financeiro (recebido, pago, saldo, quantidades)
- Filtro por período + categoria
- Exportação CSV

### Fluxo de Caixa (`/fluxo-caixa`)
- Acompanhamento do fluxo de caixa por período

### Serviços (`/servicos`) & Cadastro de Serviços (`/servicos-cadastro`)
- Gestão de serviços prestados e catálogo de serviços

### Técnicos (`/tecnicos`)
- Cadastro e gerenciamento de técnicos

### Colaboradores (`/colaboradores`)
- Cadastro e gerenciamento de colaboradores

### Centros de Custo (`/centros-custo`)
- Gestão de centros de custo

### Metas (`/metas`)
- Acompanhamento de metas financeiras

### Ponto de Equilíbrio (`/ponto-equilibrio`)
- Cálculo e visualização do ponto de equilíbrio

### Rentabilidade (`/rentabilidade`) & Produtividade (`/produtividade`)
- Indicadores de rentabilidade e produtividade

### Permissões (`/permissoes`) & Usuários (`/usuarios`)
- Controle de acesso baseado em perfis (RBAC)

### Admin (`/admin`)
- Painel administrativo

### Dashboard Proprietário (`/dashboard-proprietario`)
- Visão executiva para proprietários

### Relatórios Operacionais (`/relatorios-operacionais`)
- Relatórios operacionais detalhados

### Relatórios por Centros de Custo (`/relatorios-centros-custo`)
- Relatórios filtrados por centro de custo

### Configurações (`/configuracoes`)
- Gerenciamento de categorias por grupo
- Backup (exportar JSON) e Restore (importar JSON)

---

## Arquitetura

```
Browser (React)          Server (Node SSR)            Supabase (PostgreSQL)
     │                        │                            │
     │  TanStack React Query   │                            │
     │  (useQuery/useMutation) │                            │
     │                        │                            │
     ├── storage.ts ─────────>├── server-fns.ts ─────────>├── database.ts ──> Prisma ──> PostgreSQL
     │  (hooks + export)      │  (createServerFn RPC)     │  (PrismaClient)
     │                        │                            │
     │  Otimista:             │  GET  /getData             │  listLancamentos()
     │  onMutate → setData    │  POST /saveLancamentos     │  replaceAllLancamentos()
     │  onSettled → refetch   │  POST /saveCategorias      │  replaceAllCategorias()
     │                        │                            │  seedIfEmpty()
```

### Camadas
1. **Storage (hooks React Query)** — `src/lib/financeiro/storage.ts` + `crud-storage.ts`
2. **Server Functions (RPC)** — `src/lib/financeiro/server-fns.ts`
3. **Database Service** — `src/services/database.ts` (Prisma)
4. **Cálculo DRE** — `src/lib/financeiro/calc.ts`

### Migrations

Sistema próprio de migrations SQL:
- Arquivos em `sql/` numerados sequencialmente
- Tabela `_migrations` controla o que já foi aplicado
- CLI: `npm run migrate` / `npm run migrate:create`

---

## Como rodar

```bash
# Instalar dependências
bun install

# Gerar cliente Prisma (após alterar schema)
npx prisma generate

# Configurar variáveis de ambiente (.env):
# SUPABASE_URL, SUPABASE_SERVICE_KEY, VITE_SUPABASE_URL,
# VITE_SUPABASE_ANON_KEY, DATABASE_URL

# Desenvolvimento
bun run dev

# Build de produção
bun run build

# Preview do build
bun run preview

# Testes
bun test            # uma execução
bun run test:watch  # modo watch
bun run test:coverage

# Lint / Formatação
bun run lint
bun run format

# Migrations
bun run migrate
bun run migrate:create
```

---

## Deploy

Configurado para **Netlify** com SSR via Netlify Functions (`netlify.toml` + preset nitro `netlify`). Integrado ao [Lovable.dev](https://lovable.dev) para edição visual.
