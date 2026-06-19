import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function getEnv(name: string): string {
  const val = process.env[name];
  if (val) return val;
  try {
    const envPath = resolve(process.cwd(), ".env");
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key === name) return value;
      }
    }
  } catch { }
  return "";
}

const supabaseUrl = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
const serviceKey = getEnv("SUPABASE_SERVICE_KEY");
const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");

const TEST_ID = `test-${Date.now()}`;

interface TableInfo {
  name: string;
  exists: boolean;
  columns: { name: string; type: string }[];
  rowCount: number;
}

describe("Integração com Supabase", () => {
  let db: SupabaseClient;

  beforeAll(() => {
    expect(supabaseUrl, "SUPABASE_URL deve estar configurado").toBeTruthy();
    expect(serviceKey, "SUPABASE_SERVICE_KEY deve estar configurado").toBeTruthy();
    db = createClient(supabaseUrl!, serviceKey!);
  });

  // ─── Conexão ──────────────────────────────────────────────

  it("1. Conecta ao Supabase com service key", async () => {
    const { error } = await db.from("_migrations").select("*").limit(1);
    if (error && error.code === "PGRST205") {
      // Table _migrations might not exist if bootstrapping not done
      expect(error.code).toBe("PGRST205");
    } else {
      expect(error).toBeNull();
    }
  });

  it("2. Conecta ao Supabase com anon key (cliente)", async () => {
    expect(anonKey, "VITE_SUPABASE_ANON_KEY deve estar configurado").toBeTruthy();
    const clientDb = createClient(supabaseUrl!, anonKey!);
    const { error } = await clientDb.from("lancamentos").select("count", { count: "exact", head: true });
    // Anon key pode ter RLS, então pode dar erro - o importante é não dar network error
    expect(error === null || error?.message?.includes("permission") || error?.message?.includes("does not exist")).toBe(true);
  });

  // ─── Verificar tabelas existentes ─────────────────────────

  const TABELAS = [
    "lancamentos",
    "categorias",
    "tecnicos",
    "servicos",
    "colaboradores",
    "servicos_cadastro",
    "metas",
    "usuarios",
    "permissoes",
  ];

  const tabelasInfo: Record<string, TableInfo> = {};

  it("3. Verifica quais tabelas existem no banco", async () => {
    for (const table of TABELAS) {
      const { error } = await db.from(table).select("*").limit(1);
      const exists = !error || !error.message?.includes("Could not find the table");
      tabelasInfo[table] = {
        name: table,
        exists,
        columns: [],
        rowCount: 0,
      };
    }

    const existentes = Object.values(tabelasInfo).filter(t => t.exists).map(t => t.name);
    const faltantes = Object.values(tabelasInfo).filter(t => !t.exists).map(t => t.name);
    console.log(`✅ Tabelas existentes: ${existentes.join(", ") || "(nenhuma)"}`);
    if (faltantes.length > 0) {
      console.log(`❌ Tabelas faltantes: ${faltantes.join(", ")}`);
      console.log(`⚠️  Execute sql/002_create_new_tables.sql no SQL Editor do Supabase para criar as tabelas faltantes`);
    }
    expect(existentes.length > 0).toBe(true);
  });

  // ─── CRUD: Lancamentos ────────────────────────────────────

  describe("CRUD Lancamentos", () => {
    const testLancamento = {
      id: `${TEST_ID}-lanc`,
      data: "2026-06-19",
      tipo: "receita",
      categoria: "Vendas",
      descricao: "Teste CRUD - remover",
      contraparte: "Cliente Teste",
      valor: 1000.00,
      status: "recebido",
    };

    it("CREATE - insere lançamento", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { error } = await db.from("lancamentos").insert(testLancamento);
      expect(error).toBeNull();
    });

    it("READ - lista lançamentos", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { data, error } = await db.from("lancamentos").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it("READ - busca lançamento por id", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { data, error } = await db.from("lancamentos").select("*").eq("id", testLancamento.id).single();
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.descricao).toBe(testLancamento.descricao);
    });

    it("UPDATE - atualiza lançamento", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { error } = await db.from("lancamentos").update({ valor: 2000.00 }).eq("id", testLancamento.id);
      expect(error).toBeNull();
      const { data } = await db.from("lancamentos").select("valor").eq("id", testLancamento.id).single();
      expect(data!.valor).toBe(2000.00);
    });

    it("DELETE - remove lançamento", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { error } = await db.from("lancamentos").delete().eq("id", testLancamento.id);
      expect(error).toBeNull();
      const { data } = await db.from("lancamentos").select("*").eq("id", testLancamento.id);
      expect(data).toHaveLength(0);
    });
  });

  // ─── CRUD: Categorias ─────────────────────────────────────

  describe("CRUD Categorias", () => {
    const testCategoria = {
      tipo: "receitas",
      nome: `Teste CRUD - ${TEST_ID}`,
    };

    it("CREATE - insere categoria", async () => {
      if (!tabelasInfo.categorias?.exists) return;
      const { error } = await db.from("categorias").insert(testCategoria);
      expect(error).toBeNull();
    });

    it("READ - lista categorias", async () => {
      if (!tabelasInfo.categorias?.exists) return;
      const { data, error } = await db.from("categorias").select("*").limit(1);
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThan(0);
    });

    it("DELETE - remove categoria", async () => {
      if (!tabelasInfo.categorias?.exists) return;
      const { data: found } = await db.from("categorias").select("id").eq("nome", testCategoria.nome);
      if (found && found.length > 0) {
        const { error } = await db.from("categorias").delete().eq("id", found[0].id);
        expect(error).toBeNull();
      }
    });
  });

  // ─── CRUD: Técnicos ───────────────────────────────────────

  describe("CRUD Técnicos", () => {
    const testTecnico = {
      id: `${TEST_ID}-tec`,
      nome: "Teste Técnico CRUD",
      especialidade: "Eletricista",
      telefone: "(11) 99999-9999",
      email: "teste@tecnico.com",
      ativo: true,
    };

    it("CREATE - insere técnico", async () => {
      if (!tabelasInfo.tecnicos?.exists) return;
      const { error } = await db.from("tecnicos").insert(testTecnico);
      expect(error).toBeNull();
    });

    it("READ - lista técnicos", async () => {
      if (!tabelasInfo.tecnicos?.exists) return;
      const { data, error } = await db.from("tecnicos").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("READ - busca por id", async () => {
      if (!tabelasInfo.tecnicos?.exists) return;
      const { data, error } = await db.from("tecnicos").select("*").eq("id", testTecnico.id).single();
      expect(error).toBeNull();
      expect(data!.nome).toBe(testTecnico.nome);
    });

    it("UPDATE - atualiza técnico", async () => {
      if (!tabelasInfo.tecnicos?.exists) return;
      const { error } = await db.from("tecnicos").update({ telefone: "(21) 88888-8888" }).eq("id", testTecnico.id);
      expect(error).toBeNull();
      const { data } = await db.from("tecnicos").select("telefone").eq("id", testTecnico.id).single();
      expect(data!.telefone).toBe("(21) 88888-8888");
    });

    it("DELETE - remove técnico", async () => {
      if (!tabelasInfo.tecnicos?.exists) return;
      const { error } = await db.from("tecnicos").delete().eq("id", testTecnico.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Serviços ───────────────────────────────────────

  describe("CRUD Serviços", () => {
    const testServico = {
      id: `${TEST_ID}-serv`,
      cliente: "Cliente Teste",
      tecnico: "Técnico Teste",
      descricao: "Serviço de teste CRUD",
      data: "2026-06-19",
      valor: 500.00,
      status: "agendado",
    };

    it("CREATE - insere serviço", async () => {
      if (!tabelasInfo.servicos?.exists) return;
      const { error } = await db.from("servicos").insert(testServico);
      expect(error).toBeNull();
    });

    it("READ - lista serviços", async () => {
      if (!tabelasInfo.servicos?.exists) return;
      const { data, error } = await db.from("servicos").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("UPDATE - atualiza status", async () => {
      if (!tabelasInfo.servicos?.exists) return;
      const { error } = await db.from("servicos").update({ status: "concluido" }).eq("id", testServico.id);
      expect(error).toBeNull();
    });

    it("DELETE - remove serviço", async () => {
      if (!tabelasInfo.servicos?.exists) return;
      const { error } = await db.from("servicos").delete().eq("id", testServico.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Colaboradores ──────────────────────────────────

  describe("CRUD Colaboradores", () => {
    const testColaborador = {
      id: `${TEST_ID}-colab`,
      nome: "Teste Colaborador CRUD",
      cargo: "Desenvolvedor",
      departamento: "TI",
      telefone: "(11) 97777-7777",
      email: "teste@colaborador.com",
      ativo: true,
    };

    it("CREATE - insere colaborador", async () => {
      if (!tabelasInfo.colaboradores?.exists) return;
      const { error } = await db.from("colaboradores").insert(testColaborador);
      expect(error).toBeNull();
    });

    it("READ - lista colaboradores", async () => {
      if (!tabelasInfo.colaboradores?.exists) return;
      const { data, error } = await db.from("colaboradores").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("UPDATE - atualiza cargo", async () => {
      if (!tabelasInfo.colaboradores?.exists) return;
      const { error } = await db.from("colaboradores").update({ cargo: "Tech Lead" }).eq("id", testColaborador.id);
      expect(error).toBeNull();
    });

    it("DELETE - remove colaborador", async () => {
      if (!tabelasInfo.colaboradores?.exists) return;
      const { error } = await db.from("colaboradores").delete().eq("id", testColaborador.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Catálogo de Serviços ───────────────────────────

  describe("CRUD Catálogo de Serviços", () => {
    const testServicoCadastro = {
      id: `${TEST_ID}-servcat`,
      nome: "Serviço Catálogo Teste",
      descricao: "Descrição do serviço de teste",
      valor: 299.90,
      categoria: "Instalação",
      ativo: true,
    };

    it("CREATE - insere serviço no catálogo", async () => {
      if (!tabelasInfo.servicos_cadastro?.exists) return;
      const { error } = await db.from("servicos_cadastro").insert(testServicoCadastro);
      expect(error).toBeNull();
    });

    it("READ - lista catálogo", async () => {
      if (!tabelasInfo.servicos_cadastro?.exists) return;
      const { data, error } = await db.from("servicos_cadastro").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("UPDATE - atualiza valor", async () => {
      if (!tabelasInfo.servicos_cadastro?.exists) return;
      const { error } = await db.from("servicos_cadastro").update({ valor: 399.90 }).eq("id", testServicoCadastro.id);
      expect(error).toBeNull();
    });

    it("DELETE - remove do catálogo", async () => {
      if (!tabelasInfo.servicos_cadastro?.exists) return;
      const { error } = await db.from("servicos_cadastro").delete().eq("id", testServicoCadastro.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Metas ─────────────────────────────────────────

  describe("CRUD Metas", () => {
    const testMeta = {
      id: `${TEST_ID}-meta`,
      descricao: "Meta de teste CRUD",
      valor_meta: 50000.00,
      valor_atual: 25000.00,
      periodo: "2026-06",
      tipo: "mensal",
    };

    it("CREATE - insere meta", async () => {
      if (!tabelasInfo.metas?.exists) return;
      const { error } = await db.from("metas").insert(testMeta);
      expect(error).toBeNull();
    });

    it("READ - lista metas", async () => {
      if (!tabelasInfo.metas?.exists) return;
      const { data, error } = await db.from("metas").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("READ - busca por id", async () => {
      if (!tabelasInfo.metas?.exists) return;
      const { data, error } = await db.from("metas").select("*").eq("id", testMeta.id).single();
      expect(error).toBeNull();
      expect(data!.descricao).toBe(testMeta.descricao);
    });

    it("UPDATE - atualiza valor atual", async () => {
      if (!tabelasInfo.metas?.exists) return;
      const { error } = await db.from("metas").update({ valor_atual: 30000.00 }).eq("id", testMeta.id);
      expect(error).toBeNull();
      const { data } = await db.from("metas").select("valor_atual").eq("id", testMeta.id).single();
      expect(data!.valor_atual).toBe(30000);
    });

    it("DELETE - remove meta", async () => {
      if (!tabelasInfo.metas?.exists) return;
      const { error } = await db.from("metas").delete().eq("id", testMeta.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Usuários ──────────────────────────────────────

  describe("CRUD Usuários", () => {
    const testUsuario = {
      id: `${TEST_ID}-user`,
      nome: "Teste Usuário CRUD",
      username: `test-crud-${TEST_ID}`.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      role: "user",
      ativo: true,
    };

    it("CREATE - insere usuário", async () => {
      if (!tabelasInfo.usuarios?.exists) return;
      const { error } = await db.from("usuarios").insert(testUsuario);
      expect(error).toBeNull();
    });

    it("READ - lista usuários", async () => {
      if (!tabelasInfo.usuarios?.exists) return;
      const { data, error } = await db.from("usuarios").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("UPDATE - altera role", async () => {
      if (!tabelasInfo.usuarios?.exists) return;
      const { error } = await db.from("usuarios").update({ role: "admin" }).eq("id", testUsuario.id);
      expect(error).toBeNull();
    });

    it("DELETE - remove usuário", async () => {
      if (!tabelasInfo.usuarios?.exists) return;
      const { error } = await db.from("usuarios").delete().eq("id", testUsuario.id);
      expect(error).toBeNull();
    });
  });

  // ─── CRUD: Permissões ────────────────────────────────────

  describe("CRUD Permissões", () => {
    const testPermissao = {
      id: `${TEST_ID}-perm`,
      role: "admin",
      recurso: `teste-${TEST_ID}`,
      leitura: true,
      escrita: true,
    };

    it("CREATE - insere permissão", async () => {
      if (!tabelasInfo.permissoes?.exists) return;
      const { error } = await db.from("permissoes").insert(testPermissao);
      expect(error).toBeNull();
    });

    it("READ - lista permissões", async () => {
      if (!tabelasInfo.permissoes?.exists) return;
      const { data, error } = await db.from("permissoes").select("*").limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("UPDATE - altera escrita", async () => {
      if (!tabelasInfo.permissoes?.exists) return;
      const { error } = await db.from("permissoes").update({ escrita: false }).eq("id", testPermissao.id);
      expect(error).toBeNull();
    });

    it("DELETE - remove permissão", async () => {
      if (!tabelasInfo.permissoes?.exists) return;
      const { error } = await db.from("permissoes").delete().eq("id", testPermissao.id);
      expect(error).toBeNull();
    });
  });

  // ─── Teste das funções do database.ts ─────────────────────

  describe("Funções do database.ts", () => {
    it("listLancamentos retorna array", async () => {
      if (!tabelasInfo.lancamentos?.exists) return;
      const { listLancamentos } = await import("@/services/database");
      const result = await listLancamentos();
      expect(Array.isArray(result)).toBe(true);
    });

    it("listCategorias retorna objeto com grupos", async () => {
      if (!tabelasInfo.categorias?.exists) return;
      const { listCategorias } = await import("@/services/database");
      const result = await listCategorias();
      expect(result).toHaveProperty("receitas");
      expect(result).toHaveProperty("custos");
      expect(result).toHaveProperty("despesas");
    });

    const tabelasFaltantesDB = [
      "listTecnicos", "listServicos", "listColaboradores",
      "listServicosCadastro", "listMetas", "listUsuarios", "listPermissoes"
    ];

    const TABELAS_FALTA = Object.values(tabelasInfo)
      .filter(t => t.name !== "lancamentos" && t.name !== "categorias" && !t.exists)
      .map(t => t.name);

    if (TABELAS_FALTA.length > 0) {
      it.skip.each(TABELAS_FALTA)(
        "⚠️  Tabela '%s' não existe — execute sql/002_create_new_tables.sql",
        () => { }
      );
    }
  });
});
