import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let warned = false;

function getEnv(name: string): string {
  if (typeof import.meta.env !== "undefined" && import.meta.env[name]) {
    return import.meta.env[name];
  }
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  return "";
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = getEnv("VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warned) {
      console.warn(
        "[Supabase] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não configurados.\n" +
        "Crie um arquivo .env na raiz do projeto com base no .env.example."
      );
      warned = true;
    }
    throw new Error("Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
