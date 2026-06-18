import { createServerFn } from "@tanstack/react-start";
import type { Lancamento, Categorias } from "./types";
import {
  listLancamentos,
  listCategorias,
  replaceAllLancamentos,
  replaceAllCategorias,
  seedIfEmpty,
} from "@/services/database";

export const getData = createServerFn({ method: "GET" }).handler(async () => {
  await seedIfEmpty();
  const [lancamentos, categorias] = await Promise.all([
    listLancamentos(),
    listCategorias(),
  ]);
  return { lancamentos, categorias };
});

export const saveLancamentos = createServerFn({ method: "POST" })
  .validator((data: Lancamento[]) => data)
  .handler(async ({ data }) => {
    await replaceAllLancamentos(data);
    const lancamentos = await listLancamentos();
    const categorias = await listCategorias();
    return { lancamentos, categorias };
  });

export const saveCategorias = createServerFn({ method: "POST" })
  .validator((data: Categorias) => data)
  .handler(async ({ data }) => {
    await replaceAllCategorias(data);
    const lancamentos = await listLancamentos();
    const categorias = await listCategorias();
    return { lancamentos, categorias };
  });
