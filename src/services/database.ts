import type { Lancamento, Categorias, Tecnico, Servico, Colaborador, ServicoCadastro, Meta, Usuario, Permissao } from "@/lib/financeiro/types";
import { CATEGORIAS_INICIAIS, LANCAMENTOS_SEED } from "@/lib/financeiro/seed";
import { getPrisma } from "./prisma";

// ─── Lancamentos ───────────────────────────────────────────

export async function listLancamentos(): Promise<Lancamento[]> {
  const rows = await getPrisma().lancamento.findMany({
    orderBy: { data: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    data: r.data instanceof Date ? r.data.toISOString().slice(0, 10) : String(r.data).slice(0, 10),
    tipo: r.tipo as Lancamento["tipo"],
    categoria: r.categoria,
    descricao: r.descricao,
    contraparte: r.contraparte,
    valor: Number(r.valor),
    status: r.status as Lancamento["status"],
  }));
}

export async function replaceAllLancamentos(lancamentos: Lancamento[]): Promise<void> {
  await getPrisma().lancamento.deleteMany();

  if (lancamentos.length === 0) return;

  await getPrisma().lancamento.createMany({
    data: lancamentos.map((l) => ({
      id: l.id,
      data: l.data,
      tipo: l.tipo,
      categoria: l.categoria,
      descricao: l.descricao,
      contraparte: l.contraparte,
      valor: l.valor,
      status: l.status,
    })),
  });
}

// ─── Categorias ────────────────────────────────────────────

export async function listCategorias(): Promise<Categorias> {
  const rows = await getPrisma().categoria.findMany({
    orderBy: { nome: "asc" },
  });

  const groups: Record<string, string[]> = {
    receitas: [],
    custos: [],
    despesas: [],
    deducoes: [],
    receitas_financeiras: [],
    despesas_financeiras: [],
  };

  for (const row of rows) {
    if (groups[row.tipo]) {
      groups[row.tipo].push(row.nome);
    }
  }

  return groups as unknown as Categorias;
}

export async function replaceAllCategorias(categorias: Categorias): Promise<void> {
  await getPrisma().categoria.deleteMany();

  const rows: { tipo: string; nome: string }[] = [];
  for (const [tipo, nomes] of Object.entries(categorias)) {
    for (const nome of nomes) {
      rows.push({ tipo, nome });
    }
  }

  if (rows.length === 0) return;

  await getPrisma().categoria.createMany({ data: rows });
}

// ─── Técnicos ────────────────────────────────────────────

export async function listTecnicos(): Promise<Tecnico[]> {
  const rows = await getPrisma().tecnico.findMany({ orderBy: { nome: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    especialidade: r.especialidade,
    telefone: r.telefone,
    email: r.email,
    ativo: r.ativo,
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllTecnicos(items: Tecnico[]): Promise<void> {
  await getPrisma().tecnico.deleteMany();
  if (items.length === 0) return;
  await getPrisma().tecnico.createMany({
    data: items.map((t) => ({
      id: t.id,
      nome: t.nome,
      especialidade: t.especialidade,
      telefone: t.telefone,
      email: t.email,
      ativo: t.ativo,
    })),
  });
}

// ─── Serviços ────────────────────────────────────────────

export async function listServicos(): Promise<Servico[]> {
  const rows = await getPrisma().servico.findMany({ orderBy: { data: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    cliente: r.cliente,
    tecnico: r.tecnico,
    descricao: r.descricao,
    data: r.data instanceof Date ? r.data.toISOString().slice(0, 10) : String(r.data).slice(0, 10),
    valor: Number(r.valor),
    status: r.status as Servico["status"],
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllServicos(items: Servico[]): Promise<void> {
  await getPrisma().servico.deleteMany();
  if (items.length === 0) return;
  await getPrisma().servico.createMany({
    data: items.map((s) => ({
      id: s.id,
      cliente: s.cliente,
      tecnico: s.tecnico,
      descricao: s.descricao,
      data: s.data,
      valor: s.valor,
      status: s.status,
    })),
  });
}

// ─── Colaboradores ───────────────────────────────────────

export async function listColaboradores(): Promise<Colaborador[]> {
  const rows = await getPrisma().colaborador.findMany({ orderBy: { nome: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    cargo: r.cargo,
    departamento: r.departamento,
    telefone: r.telefone,
    email: r.email,
    ativo: r.ativo,
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllColaboradores(items: Colaborador[]): Promise<void> {
  await getPrisma().colaborador.deleteMany();
  if (items.length === 0) return;
  await getPrisma().colaborador.createMany({
    data: items.map((c) => ({
      id: c.id,
      nome: c.nome,
      cargo: c.cargo,
      departamento: c.departamento,
      telefone: c.telefone,
      email: c.email,
      ativo: c.ativo,
    })),
  });
}

// ─── Catálogo de Serviços ────────────────────────────────

export async function listServicosCadastro(): Promise<ServicoCadastro[]> {
  const rows = await getPrisma().servicoCadastro.findMany({ orderBy: { nome: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    descricao: r.descricao,
    valor: Number(r.valor),
    categoria: r.categoria,
    ativo: r.ativo,
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllServicosCadastro(items: ServicoCadastro[]): Promise<void> {
  await getPrisma().servicoCadastro.deleteMany();
  if (items.length === 0) return;
  await getPrisma().servicoCadastro.createMany({
    data: items.map((s) => ({
      id: s.id,
      nome: s.nome,
      descricao: s.descricao,
      valor: s.valor,
      categoria: s.categoria,
      ativo: s.ativo,
    })),
  });
}

// ─── Metas ───────────────────────────────────────────────

export async function listMetas(): Promise<Meta[]> {
  const rows = await getPrisma().meta.findMany({ orderBy: { periodo: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    descricao: r.descricao,
    valorMeta: Number(r.valorMeta),
    valorAtual: Number(r.valorAtual),
    periodo: r.periodo,
    tipo: r.tipo as Meta["tipo"],
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllMetas(items: Meta[]): Promise<void> {
  await getPrisma().meta.deleteMany();
  if (items.length === 0) return;
  await getPrisma().meta.createMany({
    data: items.map((m) => ({
      id: m.id,
      descricao: m.descricao,
      valorMeta: m.valorMeta,
      valorAtual: m.valorAtual,
      periodo: m.periodo,
      tipo: m.tipo,
    })),
  });
}

// ─── Usuários ────────────────────────────────────────────

export async function listUsuarios(): Promise<Usuario[]> {
  const rows = await getPrisma().usuario.findMany({ orderBy: { nome: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    username: r.username,
    role: r.role as Usuario["role"],
    ativo: r.ativo,
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllUsuarios(items: Usuario[]): Promise<void> {
  await getPrisma().usuario.deleteMany();
  if (items.length === 0) return;
  await getPrisma().usuario.createMany({
    data: items.map((u) => ({
      id: u.id,
      nome: u.nome,
      username: u.username,
      role: u.role,
      ativo: u.ativo,
    })),
  });
}

// ─── Permissões ──────────────────────────────────────────

export async function listPermissoes(): Promise<Permissao[]> {
  const rows = await getPrisma().permissao.findMany({ orderBy: { role: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    recurso: r.recurso,
    leitura: r.leitura,
    escrita: r.escrita,
    criadoEm: r.criadoEm?.toISOString() ?? "",
  }));
}

export async function replaceAllPermissoes(items: Permissao[]): Promise<void> {
  await getPrisma().permissao.deleteMany();
  if (items.length === 0) return;
  await getPrisma().permissao.createMany({
    data: items.map((p) => ({
      id: p.id,
      role: p.role,
      recurso: p.recurso,
      leitura: p.leitura,
      escrita: p.escrita,
    })),
  });
}

// ─── Seed ──────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<void> {
  const catCount = await getPrisma().categoria.count();

  if (catCount === 0) {
    await replaceAllCategorias(CATEGORIAS_INICIAIS);
  }

  const lancCount = await getPrisma().lancamento.count();

  if (lancCount > 0) return;

  await replaceAllLancamentos(LANCAMENTOS_SEED);
}
