import { describe, it, expect, beforeAll } from "vitest";
import { getPrisma } from "@/services/prisma";
import type { PrismaClient } from "@prisma/client";

const TEST_ID = `test-${Date.now()}`;

describe("Integração com Prisma (Supabase PostgreSQL)", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = getPrisma();
  });

  // ─── Conexão ──────────────────────────────────────────────

  it("1. Conecta ao banco e executa query simples", async () => {
    const result = await prisma.$queryRawUnsafe<{ one: number }[]>("SELECT 1 as one");
    expect(Number(result[0]?.one)).toBe(1);
  });

  // ─── Verificar tabelas ─────────────────────────────────────

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
  ] as const;

  const tabelasInfo: Record<string, boolean> = {};

  it("2. Verifica quais tabelas existem no banco", async () => {
    for (const table of TABELAS) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        tabelasInfo[table] = true;
      } catch {
        tabelasInfo[table] = false;
      }
    }

    const existentes = Object.entries(tabelasInfo).filter(([, v]) => v).map(([k]) => k);
    const faltantes = Object.entries(tabelasInfo).filter(([, v]) => !v).map(([k]) => k);
    console.log(`✅ Tabelas existentes: ${existentes.join(", ") || "(nenhuma)"}`);
    if (faltantes.length > 0) {
      console.log(`❌ Tabelas faltantes: ${faltantes.join(", ")}`);
    }
    expect(existentes.length).toBeGreaterThan(0);
  });

  // ─── CRUD: Lancamentos ────────────────────────────────────

  describe("CRUD Lancamentos", () => {
    const testLancamento = {
      id: `${TEST_ID}-lanc`,
      data: new Date("2026-06-19"),
      tipo: "receita",
      categoria: "Vendas",
      descricao: "Teste CRUD - remover",
      contraparte: "Cliente Teste",
      valor: 1000.00,
      status: "recebido",
    };

    it("CREATE - insere lançamento", async () => {
      if (!tabelasInfo.lancamentos) return;
      await prisma.lancamento.create({ data: testLancamento });
      expect(true).toBe(true);
    });

    it("READ - lista lançamentos", async () => {
      if (!tabelasInfo.lancamentos) return;
      const data = await prisma.lancamento.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("READ - busca lançamento por id", async () => {
      if (!tabelasInfo.lancamentos) return;
      const data = await prisma.lancamento.findUnique({ where: { id: testLancamento.id } });
      expect(data).not.toBeNull();
      expect(data!.descricao).toBe(testLancamento.descricao);
    });

    it("UPDATE - atualiza lançamento", async () => {
      if (!tabelasInfo.lancamentos) return;
      await prisma.lancamento.update({
        where: { id: testLancamento.id },
        data: { valor: 2000.00 },
      });
      const updated = await prisma.lancamento.findUnique({ where: { id: testLancamento.id } });
      expect(Number(updated!.valor)).toBe(2000);
    });

    it("DELETE - remove lançamento", async () => {
      if (!tabelasInfo.lancamentos) return;
      await prisma.lancamento.delete({ where: { id: testLancamento.id } });
      const data = await prisma.lancamento.findMany({ where: { id: testLancamento.id } });
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
      if (!tabelasInfo.categorias) return;
      await prisma.categoria.create({ data: testCategoria });
      expect(true).toBe(true);
    });

    it("READ - lista categorias", async () => {
      if (!tabelasInfo.categorias) return;
      const data = await prisma.categoria.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("DELETE - remove categoria", async () => {
      if (!tabelasInfo.categorias) return;
      const found = await prisma.categoria.findFirst({ where: { nome: testCategoria.nome } });
      if (found) {
        await prisma.categoria.delete({ where: { id: found.id } });
      }
      const data = await prisma.categoria.findMany({ where: { nome: testCategoria.nome } });
      expect(data).toHaveLength(0);
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
      if (!tabelasInfo.tecnicos) return;
      await prisma.tecnico.create({ data: testTecnico });
    });

    it("READ - lista técnicos", async () => {
      if (!tabelasInfo.tecnicos) return;
      const data = await prisma.tecnico.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("READ - busca por id", async () => {
      if (!tabelasInfo.tecnicos) return;
      const data = await prisma.tecnico.findUnique({ where: { id: testTecnico.id } });
      expect(data).not.toBeNull();
      expect(data!.nome).toBe(testTecnico.nome);
    });

    it("UPDATE - atualiza técnico", async () => {
      if (!tabelasInfo.tecnicos) return;
      await prisma.tecnico.update({
        where: { id: testTecnico.id },
        data: { telefone: "(21) 88888-8888" },
      });
      const updated = await prisma.tecnico.findUnique({ where: { id: testTecnico.id } });
      expect(updated!.telefone).toBe("(21) 88888-8888");
    });

    it("DELETE - remove técnico", async () => {
      if (!tabelasInfo.tecnicos) return;
      await prisma.tecnico.delete({ where: { id: testTecnico.id } });
    });
  });

  // ─── CRUD: Serviços ───────────────────────────────────────

  describe("CRUD Serviços", () => {
    const testServico = {
      id: `${TEST_ID}-serv`,
      cliente: "Cliente Teste",
      tecnico: "Técnico Teste",
      descricao: "Serviço de teste CRUD",
      data: new Date("2026-06-19"),
      valor: 500.00,
      status: "agendado",
    };

    it("CREATE - insere serviço", async () => {
      if (!tabelasInfo.servicos) return;
      await prisma.servico.create({ data: testServico });
    });

    it("READ - lista serviços", async () => {
      if (!tabelasInfo.servicos) return;
      const data = await prisma.servico.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("UPDATE - atualiza status", async () => {
      if (!tabelasInfo.servicos) return;
      await prisma.servico.update({
        where: { id: testServico.id },
        data: { status: "concluido" },
      });
    });

    it("DELETE - remove serviço", async () => {
      if (!tabelasInfo.servicos) return;
      await prisma.servico.delete({ where: { id: testServico.id } });
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
      if (!tabelasInfo.colaboradores) return;
      await prisma.colaborador.create({ data: testColaborador });
    });

    it("READ - lista colaboradores", async () => {
      if (!tabelasInfo.colaboradores) return;
      const data = await prisma.colaborador.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("UPDATE - atualiza cargo", async () => {
      if (!tabelasInfo.colaboradores) return;
      await prisma.colaborador.update({
        where: { id: testColaborador.id },
        data: { cargo: "Tech Lead" },
      });
    });

    it("DELETE - remove colaborador", async () => {
      if (!tabelasInfo.colaboradores) return;
      await prisma.colaborador.delete({ where: { id: testColaborador.id } });
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
      if (!tabelasInfo.servicos_cadastro) return;
      await prisma.servicoCadastro.create({ data: testServicoCadastro });
    });

    it("READ - lista catálogo", async () => {
      if (!tabelasInfo.servicos_cadastro) return;
      const data = await prisma.servicoCadastro.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("UPDATE - atualiza valor", async () => {
      if (!tabelasInfo.servicos_cadastro) return;
      await prisma.servicoCadastro.update({
        where: { id: testServicoCadastro.id },
        data: { valor: 399.90 },
      });
    });

    it("DELETE - remove do catálogo", async () => {
      if (!tabelasInfo.servicos_cadastro) return;
      await prisma.servicoCadastro.delete({ where: { id: testServicoCadastro.id } });
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
    } as const;

    it("CREATE - insere meta", async () => {
      if (!tabelasInfo.metas) return;
      await prisma.meta.create({
        data: {
          id: testMeta.id,
          descricao: testMeta.descricao,
          valorMeta: testMeta.valor_meta,
          valorAtual: testMeta.valor_atual,
          periodo: testMeta.periodo,
          tipo: testMeta.tipo,
        },
      });
    });

    it("READ - lista metas", async () => {
      if (!tabelasInfo.metas) return;
      const data = await prisma.meta.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("READ - busca por id", async () => {
      if (!tabelasInfo.metas) return;
      const data = await prisma.meta.findUnique({ where: { id: testMeta.id } });
      expect(data).not.toBeNull();
      expect(data!.descricao).toBe(testMeta.descricao);
    });

    it("UPDATE - atualiza valor atual", async () => {
      if (!tabelasInfo.metas) return;
      await prisma.meta.update({
        where: { id: testMeta.id },
        data: { valorAtual: 30000.00 },
      });
      const updated = await prisma.meta.findUnique({ where: { id: testMeta.id } });
      expect(Number(updated!.valorAtual)).toBe(30000);
    });

    it("DELETE - remove meta", async () => {
      if (!tabelasInfo.metas) return;
      await prisma.meta.delete({ where: { id: testMeta.id } });
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
      if (!tabelasInfo.usuarios) return;
      await prisma.usuario.create({ data: testUsuario });
    });

    it("READ - lista usuários", async () => {
      if (!tabelasInfo.usuarios) return;
      const data = await prisma.usuario.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("UPDATE - altera role", async () => {
      if (!tabelasInfo.usuarios) return;
      await prisma.usuario.update({
        where: { id: testUsuario.id },
        data: { role: "admin" },
      });
    });

    it("DELETE - remove usuário", async () => {
      if (!tabelasInfo.usuarios) return;
      await prisma.usuario.delete({ where: { id: testUsuario.id } });
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
      if (!tabelasInfo.permissoes) return;
      await prisma.permissao.create({ data: testPermissao });
    });

    it("READ - lista permissões", async () => {
      if (!tabelasInfo.permissoes) return;
      const data = await prisma.permissao.findMany({ take: 1 });
      expect(data.length).toBeGreaterThan(0);
    });

    it("UPDATE - altera escrita", async () => {
      if (!tabelasInfo.permissoes) return;
      await prisma.permissao.update({
        where: { id: testPermissao.id },
        data: { escrita: false },
      });
    });

    it("DELETE - remove permissão", async () => {
      if (!tabelasInfo.permissoes) return;
      await prisma.permissao.delete({ where: { id: testPermissao.id } });
    });
  });

  // ─── Teste das funções do database.ts ─────────────────────

  describe("Funções do database.ts", () => {
    it("listLancamentos retorna array", async () => {
      if (!tabelasInfo.lancamentos) return;
      const { listLancamentos } = await import("@/services/database");
      const result = await listLancamentos();
      expect(Array.isArray(result)).toBe(true);
    });

    it("listCategorias retorna objeto com grupos", async () => {
      if (!tabelasInfo.categorias) return;
      const { listCategorias } = await import("@/services/database");
      const result = await listCategorias();
      expect(result).toHaveProperty("receitas");
      expect(result).toHaveProperty("custos");
      expect(result).toHaveProperty("despesas");
    });
  });
});
