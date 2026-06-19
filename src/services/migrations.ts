import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { getEnv } from "./env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SQL_DIR = resolve(import.meta.dirname, "../../sql");

let _client: SupabaseClient | null = null;

function svc(): SupabaseClient {
  if (_client) return _client;
  const url = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configurados no .env");
  }
  _client = createClient(url, key);
  return _client;
}

function contentHash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h + content.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function listFiles(): string[] {
  if (!existsSync(SQL_DIR)) return [];
  return readdirSync(SQL_DIR)
    .filter((f) => f.endsWith(".sql") && /^(?!000_)\d{3,}/.test(f))
    .sort();
}

function listAllFiles(): string[] {
  if (!existsSync(SQL_DIR)) return [];
  return readdirSync(SQL_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function bootstrapRequired(): Promise<boolean> {
  const { error } = await svc().from("_migrations").select("*").limit(1);
  return error !== null && error !== undefined;
}

async function getApplied(): Promise<Map<string, string>> {
  try {
    const { data, error } = await svc()
      .from("_migrations")
      .select("name, hash")
      .order("name");
    if (error) return new Map();
    return new Map((data ?? []).map((r: any) => [r.name, r.hash]));
  } catch {
    return new Map();
  }
}

export async function markAsApplied(filename: string): Promise<void> {
  const filepath = join(SQL_DIR, filename);
  if (!existsSync(filepath)) {
    throw new Error(`Arquivo não encontrado: sql/${filename}`);
  }
  const sql = readFileSync(filepath, "utf-8");
  const hash = contentHash(sql);

  const { error } = await svc()
    .from("_migrations")
    .upsert({ name: filename, hash }, { onConflict: "name" });

  if (error) {
    if (error.message?.includes("does not exist") || error.code === "PGRST204") {
      throw new Error(
        "Tabela _migrations não encontrada.\n\n" +
        "Execute o bootstrap no Supabase Dashboard:\n" +
        "  1. Acesse https://supabase.com/dashboard/project/uglhjopqcoduncgumuzs/sql/new\n" +
        "  2. Cole e execute o conteúdo de sql/000_bootstrap.sql\n" +
        "  3. Tente novamente"
      );
    }
    throw error;
  }
}

export function createMigrationFile(name: string): string {
  if (!existsSync(SQL_DIR)) {
    mkdirSync(SQL_DIR, { recursive: true });
  }

  const existing = readdirSync(SQL_DIR);
  const nums = existing
    .filter((f) => /^\d+/.test(f))
    .map((f) => parseInt(f.match(/^\d+/)?.[0] ?? "0", 10));
  const next = nums.length > 0 ? String(Math.max(...nums) + 1).padStart(3, "0") : "001";

  const filename = `${next}_${name.replace(/\s+/g, "_").toLowerCase()}.sql`;
  const filepath = join(SQL_DIR, filename);

  writeFileSync(
    filepath,
    `-- ${filename}\n-- Created: ${new Date().toISOString().slice(0, 10)}\n\n`
  );

  return filepath;
}

export async function showPending(): Promise<{
  pending: { name: string; sql: string }[];
  applied: string[];
  needsBootstrap: boolean;
}> {
  const needsBootstrap = await bootstrapRequired();

  if (needsBootstrap) {
    const files = listAllFiles();
    return {
      pending: files.map((f) => ({
        name: f,
        sql: readFileSync(join(SQL_DIR, f), "utf-8"),
      })),
      applied: [],
      needsBootstrap: true,
    };
  }

  const applied = await getApplied();
  const files = listFiles();

  const pending = files
    .filter((f) => !applied.has(f))
    .map((f) => ({
      name: f,
      sql: readFileSync(join(SQL_DIR, f), "utf-8"),
    }));

  const appliedList = files.filter((f) => applied.has(f));

  return {
    pending,
    applied: appliedList,
    needsBootstrap: false,
  };
}
