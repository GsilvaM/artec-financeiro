import { createServerFn } from "@tanstack/react-start";
import type { Lancamento, Categorias } from "./types";
import { CATEGORIAS_INICIAIS, LANCAMENTOS_SEED } from "./seed";
import { getStore, setStore } from "./supabase";

const SEED_KEY = "financeiro_initialized";

async function readData() {
  let store = await getStore();

  if (!store) {
    store = {
      lancamentos: LANCAMENTOS_SEED,
      categorias: CATEGORIAS_INICIAIS,
      [SEED_KEY]: true,
    };
    await setStore(store as Record<string, unknown>);
  }

  return store as unknown as {
    lancamentos: Lancamento[];
    categorias: Categorias;
  };
}

async function writeData(data: { lancamentos: Lancamento[]; categorias: Categorias }) {
  await setStore(data as Record<string, unknown>);
}

export const getData = createServerFn({ method: "GET" }).handler(async () => {
  return readData();
});

export const saveLancamentos = createServerFn({ method: "POST" })
  .validator((data: Lancamento[]) => data)
  .handler(async ({ data }) => {
    const store = await readData();
    store.lancamentos = data;
    await writeData(store);
    return store;
  });

export const saveCategorias = createServerFn({ method: "POST" })
  .validator((data: Categorias) => data)
  .handler(async ({ data }) => {
    const store = await readData();
    store.categorias = data;
    await writeData(store);
    return store;
  });
