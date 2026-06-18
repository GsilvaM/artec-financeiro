import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORE_ID = "financeiro_store";

export async function getStore() {
  const { data, error } = await supabase
    .from("app_data")
    .select("data")
    .eq("id", STORE_ID)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data?.data as Record<string, unknown>) ?? null;
}

export async function setStore(storeData: Record<string, unknown>) {
  const { error } = await supabase
    .from("app_data")
    .upsert({ id: STORE_ID, data: storeData }, { onConflict: "id" });
  if (error) throw error;
}
