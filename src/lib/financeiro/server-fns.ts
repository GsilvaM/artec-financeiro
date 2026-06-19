import { createServerFn } from "@tanstack/react-start";
import type { Lancamento, Categorias, Tecnico, Servico, Colaborador, ServicoCadastro, Meta, Usuario, Permissao } from "./types";
import {
  listLancamentos,
  listCategorias,
  replaceAllLancamentos,
  replaceAllCategorias,
  seedIfEmpty,
  listTecnicos,
  replaceAllTecnicos,
  listServicos,
  replaceAllServicos,
  listColaboradores,
  replaceAllColaboradores,
  listServicosCadastro,
  replaceAllServicosCadastro,
  listMetas,
  replaceAllMetas,
  listUsuarios,
  replaceAllUsuarios,
  listPermissoes,
  replaceAllPermissoes,
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

// ─── Novas entidades ─────────────────────────────────────

export const getTecnicos = createServerFn({ method: "GET" }).handler(async () => {
  return await listTecnicos();
});

export const saveTecnicos = createServerFn({ method: "POST" })
  .validator((data: Tecnico[]) => data)
  .handler(async ({ data }) => {
    await replaceAllTecnicos(data);
    return await listTecnicos();
  });

export const getServicos = createServerFn({ method: "GET" }).handler(async () => {
  return await listServicos();
});

export const saveServicos = createServerFn({ method: "POST" })
  .validator((data: Servico[]) => data)
  .handler(async ({ data }) => {
    await replaceAllServicos(data);
    return await listServicos();
  });

export const getColaboradores = createServerFn({ method: "GET" }).handler(async () => {
  return await listColaboradores();
});

export const saveColaboradores = createServerFn({ method: "POST" })
  .validator((data: Colaborador[]) => data)
  .handler(async ({ data }) => {
    await replaceAllColaboradores(data);
    return await listColaboradores();
  });

export const getServicosCadastro = createServerFn({ method: "GET" }).handler(async () => {
  return await listServicosCadastro();
});

export const saveServicosCadastro = createServerFn({ method: "POST" })
  .validator((data: ServicoCadastro[]) => data)
  .handler(async ({ data }) => {
    await replaceAllServicosCadastro(data);
    return await listServicosCadastro();
  });

export const getMetas = createServerFn({ method: "GET" }).handler(async () => {
  return await listMetas();
});

export const saveMetas = createServerFn({ method: "POST" })
  .validator((data: Meta[]) => data)
  .handler(async ({ data }) => {
    await replaceAllMetas(data);
    return await listMetas();
  });

export const getUsuarios = createServerFn({ method: "GET" }).handler(async () => {
  return await listUsuarios();
});

export const saveUsuarios = createServerFn({ method: "POST" })
  .validator((data: Usuario[]) => data)
  .handler(async ({ data }) => {
    await replaceAllUsuarios(data);
    return await listUsuarios();
  });

export const getPermissoes = createServerFn({ method: "GET" }).handler(async () => {
  return await listPermissoes();
});

export const savePermissoes = createServerFn({ method: "POST" })
  .validator((data: Permissao[]) => data)
  .handler(async ({ data }) => {
    await replaceAllPermissoes(data);
    return await listPermissoes();
  });
