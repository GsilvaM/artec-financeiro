# 💰 Artec Financeiro

Sistema de controle financeiro para **Artec Ambientes Climatizados** — gestão de lançamentos, DRE (Demonstração do Resultado do Exercício) e relatórios financeiros.

---

## 🚀 Tecnologias

| Categoria | Tecnologia |
|---|---|
| **Framework** | React 19 + TanStack Start (SSR) |
| **Router** | TanStack React Router (file-based) |
| **Build** | Vite 8 |
| **Linguagem** | TypeScript 5.8 |
| **Database** | Supabase (PostgreSQL) — `@supabase/supabase-js` |
| **Data Fetching** | TanStack React Query v5 |
| **Server Functions** | TanStack Start `createServerFn()` (RPC-style) |
| **UI** | shadcn/ui (Radix Primitives + Tailwind v4) |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **Formulários** | react-hook-form + zod |
| **Ícones** | lucide-react |
| **Gráficos** | Recharts |
| **Notificações** | sonner |
| **Datas** | date-fns |
| **Deploy** | Netlify (SSR via Netlify Functions) |
| **Gerenciador de pacotes** | Bun |

---

## 📁 Estrutura do Projeto

```
artec-cash-pal-main/
├── .env                          # Variáveis de ambiente (Supabase)
├── .gitignore
├── AGENTS.md                     # Instruções para agentes de IA (Lovable)
├── components.json               # Configuração shadcn/ui
├── eslint.config.js
├── netlify.toml                  # Configuração de deploy Netlify
├── package.json
├── vite.config.ts
├── tsconfig.json
├── bun.lock / bunfig.toml
├── public/
│   └── logo_artec.png            # Logo da empresa
├── sql/                          # Migrations do banco de dados
│   ├── 000_bootstrap.sql         # Cria tabela _migrations
│   └── 001_create_tables.sql     # Cria lancamentos + categorias
├── src/
│   ├── styles.css                # Tema CSS (variáveis, animações, Tailwind)
│   ├── server.ts                 # Entry point SSR (error wrapper)
│   ├── start.ts                  # Instância TanStack Start + middleware
│   ├── router.tsx                # Criação do router com QueryClient
│   ├── routeTree.gen.ts          # Árvore de rotas (auto-gerada)
│   │
│   ├── lib/
│   │   ├── utils.ts              # Utilitário cn() (clsx + tailwind-merge)
│   │   ├── supabase.ts           # Cliente Supabase anon (browser)
│   │   ├── error-capture.ts      # Captura global de erros
│   │   ├── error-page.ts         # Página HTML de erro fallback
│   │   ├── lovable-error-reporting.ts
│   │   └── financeiro/
│   │       ├── types.ts          # Tipos de domínio (Lancamento, Categorias)
│   │       ├── calc.ts           # Motor de cálculo DRE + formatação
│   │       ├── storage.ts        # Hooks React Query + import/export
│   │       ├── server-fns.ts     # Funções de servidor (RPC)
│   │       └── seed.ts           # Dados iniciais (categorias + lançamentos)
│   │
│   ├── services/
│   │   ├── database.ts           # CRUD Supabase (service client)
│   │   ├── env.ts                # Leitor de variáveis de ambiente
│   │   ├── migrations.ts         # Gerenciamento de migrations
│   │   └── migrate-cli.ts        # CLI para rodar migrations
│   │
│   ├── types/
│   │   └── database.ts           # Tipos das linhas do banco (row types)
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx        # Detecção de breakpoint mobile
│   │
│   ├── components/
│   │   ├── financeiro/
│   │   │   ├── AppSidebar.tsx     # Sidebar de navegação
│   │   │   └── PeriodoFiltro.tsx  # Seletor mês/ano
│   │   └── ui/                   # Componentes shadcn/ui (50+)
│   │       ├── button.tsx, card.tsx, dialog.tsx, input.tsx, ...
│   │       ├── select.tsx, table.tsx, badge.tsx, tabs.tsx, ...
│   │       ├── sidebar.tsx, sheet.tsx, popover.tsx, ...
│   │       ├── chart.tsx, calendar.tsx, command.tsx, ...
│   │       └── ...
│   │
│   └── routes/                   # Rotas (file-based)
│       ├── __root.tsx            # Layout raiz (shell, sidebar, header)
│       ├── index.tsx             # Dashboard (/)
│       ├── lancamentos.tsx       # Lançamentos (/lancamentos)
│       ├── dre.tsx               # DRE Mensal (/dre)
│       ├── relatorios.tsx        # Relatórios (/relatorios)
│       ├── configuracoes.tsx     # Configurações (/configuracoes)
│       └── README.md             # Convenções de roteamento
│
└── dist/                         # Build de produção
```

---

## 🗄️ Banco de Dados

### Supabase (PostgreSQL)

#### Tabela `_migrations` (bootstrap)
| Coluna | Tipo | Descrição |
|---|---|---|
| `name` | `TEXT PK` | Nome do arquivo de migration |
| `hash` | `TEXT NOT NULL` | Hash do conteúdo |
| `applied_at` | `TIMESTAMPTZ` | Quando foi aplicada |

#### Tabela `lancamentos` (lançamentos financeiros)
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `TEXT` | PRIMARY KEY |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() |
| `data` | `DATE` | NOT NULL |
| `tipo` | `TEXT` | NOT NULL — `receita`, `custo_direto`, `despesa_operacional`, `receita_financeira`, `despesa_financeira` |
| `categoria` | `TEXT` | NOT NULL |
| `descricao` | `TEXT` | NOT NULL |
| `contraparte` | `TEXT` | NOT NULL DEFAULT '' — cliente ou fornecedor |
| `valor` | `NUMERIC(12,2)` | NOT NULL DEFAULT 0 |
| `status` | `TEXT` | NOT NULL DEFAULT 'pendente' — `pago`, `recebido`, `pendente` |

**Índices:** `data`, `tipo`, `status`, `categoria`, `(tipo, data)`.

#### Tabela `categorias` (categorias)
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `UUID` | PK DEFAULT gen_random_uuid() |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() |
| `tipo` | `TEXT` | NOT NULL — grupo: `receitas`, `custos`, `despesas`, `deducoes`, `receitas_financeiras`, `despesas_financeiras` |
| `nome` | `TEXT` | NOT NULL |

**Índices:** `tipo`. **Unique:** `(tipo, nome)`.

### Estratégia de dados

O sistema utiliza uma abordagem **replace-all**: ao salvar, todas as linhas são excluídas e reinseridas. Não há atualização incremental.

### Seed automático

Ao iniciar, se o banco estiver vazio, o sistema popula automaticamente com:
- **12 lançamentos** de exemplo (últimos 3 meses) com categorias como "Venda de Equipamentos", "Instalação", "Manutenção", etc.
- **6 grupos de categorias** com ~30 categorias no total.

---

## 🧭 Layout

### Shell principal (`__root.tsx`)

```
<html>
  <body>
    <QueryClientProvider>
      <SidebarProvider>
        <AppSidebar />              ← Sidebar colapsável (gradiente escuro)
        <main>
          <header class="glass-header">  ← Header fixo com gradiente, logo, trigger
          <main>
            <Outlet />              ← Conteúdo da rota ativa
          </main>
        </main>
        <Toaster />                 ← Notificações toast (top-right)
      </SidebarProvider>
    </QueryClientProvider>
  </body>
</html>
```

### Sidebar
- 5 itens de navegação: **Dashboard**, **Lançamentos**, **DRE Mensal**, **Relatórios**, **Configurações**
- Modo colapsável (ícones apenas) em telas pequenas
- Indicador visual de rota ativa (barra gradiente à esquerda)
- Status "Sistema ativo" no rodapé

### Header
- Efeito glass-morphism com backdrop-filter
- Botão de toggle da sidebar
- Nome da empresa + subtítulo "Controle Financeiro"
- Logo da Artec

### Tema
- Esquema de cores institucional (azul `#215797` como primary, vermelho `#EB4134` como accent)
- Suporte a **modo claro e escuro**
- Animações suaves (fade-in, slide-up, scale-in)
- Responsivo (breakpoints `sm:`, `lg:`)

---

## 🧩 Funcionalidades por Rota

### 1. Dashboard (`/`)
- **4 KPIs:** Receita Bruta, Custos + Despesas, Lucro Líquido, Margem Líquida
- **4 gráficos Recharts:**
  - Receita x Despesas (barras agrupadas mensais)
  - Evolução do Lucro (linha)
  - Evolução do Faturamento (linha)
  - Despesas por Categoria (pizza)
- **Filtro** por período (mês/ano)

### 2. Lançamentos (`/lancamentos`)
- CRUD completo de lançamentos financeiros
- **Campos:** data, tipo, categoria (dinâmica por tipo), descrição, cliente/fornecedor, valor, status
- **Filtros:** período + busca textual (descrição, contraparte, categoria)
- Status visual com badges + indicadores coloridos (mobile)

### 3. DRE Mensal (`/dre`)
- Demonstrativo hierárquico completo:
  ```
  Receita Bruta
  ├── Categoria A, B, ...
  (-) Deduções
  = Receita Líquida
  (-) Custos Diretos
  = Lucro Bruto
  (-) Despesas Operacionais
  = Resultado Operacional
  (+/-) Resultado Financeiro
  = Lucro Líquido + Margem Líquida
  ```
- Destaque visual positivo (verde) / negativo (vermelho)
- Filtro por mês específico (sem opção "todos")

### 4. Relatórios (`/relatorios`)
- **5 cartões de resumo:** Total Recebido, Total Pago, Saldo, Qtd. Receitas, Qtd. Despesas
- Tabela filtrada por período + categoria
- **Exportação CSV** com separador `;` e BOM para Excel

### 5. Configurações (`/configuracoes`)
- Gerenciamento de categorias por grupo (abas):
  - Receitas, Custos Diretos, Despesas Operacionais, Deduções, Receitas Financeiras, Despesas Financeiras
- Adicionar/remover categorias
- **Backup:** exportar JSON completo (lançamentos + categorias)
- **Restore:** importar JSON de backup

---

## 🏗️ Arquitetura

```
Browser (React)          Server (Node SSR)          Supabase (PostgreSQL)
     │                        │                           │
     │  TanStack React Query   │                           │
     │  (useQuery/useMutation) │                           │
     │                        │                           │
     ├── storage.ts ─────────>├── server-fns.ts ────────>├── database.ts ──> Supabase
     │  (hooks + export)      │  (createServerFn RPC)    │  (service client)
     │                        │                           │
     │  Otimista:             │  GET  /getData            │  listLancamentos()
     │  onMutate → setData    │  POST /saveLancamentos    │  replaceAllLancamentos()
     │  onSettled → refetch   │  POST /saveCategorias     │  replaceAllCategorias()
     │                        │                           │  seedIfEmpty()
```

### Camadas
1. **Storage (hooks React Query)** — `src/lib/financeiro/storage.ts`
   - `useLancamentos()` / `useCategorias()`
   - Mutations com **otimistic update** (atualiza cache antes da resposta do servidor)
   - Funções de export (`exportarBackup`, `importarBackup`, `exportarCSV`)

2. **Server Functions (RPC)** — `src/lib/financeiro/server-fns.ts`
   - `getData()` — busca dados + seed automático
   - `saveLancamentos()` — substitui todos os lançamentos
   - `saveCategorias()` — substitui todas as categorias

3. **Database Service** — `src/services/database.ts`
   - Service client com `SUPABASE_SERVICE_KEY` (acesso total, sem RLS)
   - CRUD direto nas tabelas `lancamentos` e `categorias`

4. **Cálculo DRE** — `src/lib/financeiro/calc.ts`
   - Funções puras: `calcularDRE()`, `filtrarPorPeriodo()`, `somaPor()`
   - Formatação: `fmtBRL()`, `fmtPct()`

### Migrations

Sistema próprio de migrations SQL:
- Arquivos em `sql/` numerados sequencialmente
- Tabela `_migrations` controla o que já foi aplicado
- CLI: `npm run migrate` (listar pendentes) / `npm run migrate:create` (criar nova)
- Aplicação manual via SQL Editor do Supabase

---

## ⚙️ Como rodar

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente (copie .env.example ou configure):
# SUPABASE_URL, SUPABASE_SERVICE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# Rodar em desenvolvimento
bun run dev

# Build de produção
bun run build

# Preview do build
bun run preview

# Lint
bun run lint

# Migrations
bun run migrate
```

---

## 📦 Deploy

O projeto está configurado para **Netlify** com SSR via Netlify Functions (`netlify.toml` + preset nitro `netlify`). Também integrado ao [Lovable.dev](https://lovable.dev) para edição visual.
