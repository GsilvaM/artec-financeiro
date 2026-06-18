import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Lancamento, Categorias } from "@/lib/financeiro/types";
import { CATEGORIAS_INICIAIS, LANCAMENTOS_SEED } from "@/lib/financeiro/seed";

let serviceClient: SupabaseClient | null = null;

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

  return groups as Categorias;
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

// ─── Seed ──────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<void> {
  const { count: lancCount, error: lancErr } = await db()
    .from("lancamentos")
    .select("*", { count: "exact", head: true });

  if (lancErr) throw lancErr;

  if (lancCount !== null && lancCount > 0) return;

  const { count: catCount, error: catErr } = await db()
    .from("categorias")
    .select("*", { count: "exact", head: true });

  if (catErr) throw catErr;

  if (catCount !== null && catCount > 0) return;

  await replaceAllCategorias(CATEGORIAS_INICIAIS);
  await replaceAllLancamentos(LANCAMENTOS_SEED);
}
