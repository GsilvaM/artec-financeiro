import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env";
import type { Lancamento, Categorias, Tecnico, Servico, Colaborador, ServicoCadastro, Meta, Usuario, Permissao } from "@/lib/financeiro/types";
import { CATEGORIAS_INICIAIS, LANCAMENTOS_SEED } from "@/lib/financeiro/seed";

let serviceClient: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (serviceClient) return serviceClient;

  const url = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_KEY");

  if (!url) {
    throw new Error("Variável SUPABASE_URL não encontrada. Verifique o arquivo .env");
  }
  if (!serviceKey) {
    throw new Error("Variável SUPABASE_SERVICE_KEY não encontrada. Verifique o arquivo .env");
  }

  serviceClient = createClient(url, serviceKey);
  return serviceClient;
}

// ─── Lancamentos ───────────────────────────────────────────

export async function listLancamentos(): Promise<Lancamento[]> {
  const { data, error } = await db()
    .from("lancamentos")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;
  return data as Lancamento[];
}

export async function replaceAllLancamentos(lancamentos: Lancamento[]): Promise<void> {
  const { error: delError } = await db().from("lancamentos").delete().neq("id", "__never__");
  if (delError) throw delError;

  if (lancamentos.length === 0) return;

  const { error: insError } = await db().from("lancamentos").insert(
    lancamentos.map((l) => ({
      id: l.id,
      data: l.data,
      tipo: l.tipo,
      categoria: l.categoria,
      descricao: l.descricao,
      contraparte: l.contraparte,
      valor: l.valor,
      status: l.status,
    }))
  );
  if (insError) throw insError;
}

// ─── Categorias ────────────────────────────────────────────

async function listCategoriaRows(): Promise<{ tipo: string; nome: string }[]> {
  const { data, error } = await db()
    .from("categorias")
    .select("tipo, nome")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function listCategorias(): Promise<Categorias> {
  const rows = await listCategoriaRows();

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
  const { error: delError } = await db().from("categorias").delete().neq("id", "__never__");
  if (delError) throw delError;

  const rows: { tipo: string; nome: string }[] = [];
  for (const [tipo, nomes] of Object.entries(categorias)) {
    for (const nome of nomes) {
      rows.push({ tipo, nome });
    }
  }

  if (rows.length === 0) return;

  const { error: insError } = await db().from("categorias").insert(rows);
  if (insError) throw insError;
}

// ─── Técnicos ────────────────────────────────────────────

export async function listTecnicos(): Promise<Tecnico[]> {
  const { data, error } = await db()
    .from("tecnicos")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllTecnicos(items: Tecnico[]): Promise<void> {
  const { error: delError } = await db().from("tecnicos").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("tecnicos").insert(
    items.map((t) => ({ id: t.id, nome: t.nome, especialidade: t.especialidade, telefone: t.telefone, email: t.email, ativo: t.ativo }))
  );
  if (insError) throw insError;
}

// ─── Serviços ────────────────────────────────────────────

export async function listServicos(): Promise<Servico[]> {
  const { data, error } = await db()
    .from("servicos")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllServicos(items: Servico[]): Promise<void> {
  const { error: delError } = await db().from("servicos").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("servicos").insert(
    items.map((s) => ({ id: s.id, cliente: s.cliente, tecnico: s.tecnico, descricao: s.descricao, data: s.data, valor: s.valor, status: s.status }))
  );
  if (insError) throw insError;
}

// ─── Colaboradores ───────────────────────────────────────

export async function listColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await db()
    .from("colaboradores")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllColaboradores(items: Colaborador[]): Promise<void> {
  const { error: delError } = await db().from("colaboradores").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("colaboradores").insert(
    items.map((c) => ({ id: c.id, nome: c.nome, cargo: c.cargo, departamento: c.departamento, telefone: c.telefone, email: c.email, ativo: c.ativo }))
  );
  if (insError) throw insError;
}

// ─── Catálogo de Serviços ────────────────────────────────

export async function listServicosCadastro(): Promise<ServicoCadastro[]> {
  const { data, error } = await db()
    .from("servicos_cadastro")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllServicosCadastro(items: ServicoCadastro[]): Promise<void> {
  const { error: delError } = await db().from("servicos_cadastro").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("servicos_cadastro").insert(
    items.map((s) => ({ id: s.id, nome: s.nome, descricao: s.descricao, valor: s.valor, categoria: s.categoria, ativo: s.ativo }))
  );
  if (insError) throw insError;
}

// ─── Metas ───────────────────────────────────────────────

export async function listMetas(): Promise<Meta[]> {
  const { data, error } = await db()
    .from("metas")
    .select("*")
    .order("periodo", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    descricao: r.descricao,
    valorMeta: r.valor_meta,
    valorAtual: r.valor_atual,
    periodo: r.periodo,
    tipo: r.tipo,
    criadoEm: r.created_at ?? "",
  }));
}

export async function replaceAllMetas(items: Meta[]): Promise<void> {
  const { error: delError } = await db().from("metas").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("metas").insert(
    items.map((m) => ({ id: m.id, descricao: m.descricao, valor_meta: m.valorMeta, valor_atual: m.valorAtual, periodo: m.periodo, tipo: m.tipo }))
  );
  if (insError) throw insError;
}

// ─── Usuários ────────────────────────────────────────────

export async function listUsuarios(): Promise<Usuario[]> {
  const { data, error } = await db()
    .from("usuarios")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllUsuarios(items: Usuario[]): Promise<void> {
  const { error: delError } = await db().from("usuarios").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("usuarios").insert(
    items.map((u) => ({ id: u.id, nome: u.nome, username: u.username, role: u.role, ativo: u.ativo }))
  );
  if (insError) throw insError;
}

// ─── Permissões ──────────────────────────────────────────

export async function listPermissoes(): Promise<Permissao[]> {
  const { data, error } = await db()
    .from("permissoes")
    .select("*")
    .order("role");

  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, criadoEm: r.created_at ?? "" }));
}

export async function replaceAllPermissoes(items: Permissao[]): Promise<void> {
  const { error: delError } = await db().from("permissoes").delete().neq("id", "__never__");
  if (delError) throw delError;
  if (items.length === 0) return;
  const { error: insError } = await db().from("permissoes").insert(
    items.map((p) => ({ id: p.id, role: p.role, recurso: p.recurso, leitura: p.leitura, escrita: p.escrita }))
  );
  if (insError) throw insError;
}

// ─── Seed ──────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<void> {
  const { count: catCount, error: catErr } = await db()
    .from("categorias")
    .select("*", { count: "exact", head: true });

  if (catErr) throw catErr;

  if (catCount !== null && catCount === 0) {
    await replaceAllCategorias(CATEGORIAS_INICIAIS);
  }

  const { count: lancCount, error: lancErr } = await db()
    .from("lancamentos")
    .select("*", { count: "exact", head: true });

  if (lancErr) throw lancErr;

  if (lancCount !== null && lancCount > 0) return;

  await replaceAllLancamentos(LANCAMENTOS_SEED);
}
