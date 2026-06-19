import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import type { Tecnico, Servico, Colaborador, ServicoCadastro, Meta, Usuario, Permissao, } from "./types";
export type { Tecnico, Servico, Colaborador, ServicoCadastro, Meta, Usuario, Permissao, };
import {
  getTecnicos as listTecnicosApi,
  saveTecnicos,
  getServicos as listServicosApi,
  saveServicos,
  getColaboradores as listColaboradoresApi,
  saveColaboradores,
  getServicosCadastro as listServicosCadastroApi,
  saveServicosCadastro,
  getMetas as listMetasApi,
  saveMetas,
  getUsuarios as listUsuariosApi,
  saveUsuarios,
  getPermissoes as listPermissoesApi,
  savePermissoes,
} from "./server-fns";

function useCrudSupabase<T extends { id: string }>(
  queryKey: unknown[],
  listFn: () => Promise<T[]>,
  saveFn: (items: T[]) => Promise<T[]>,
) {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey,
    queryFn: listFn,
    staleTime: 60_000,
  });

  const { mutate } = useMutation({
    mutationFn: async (novos: T[]) => {
      return await saveFn(novos);
    },
    onMutate: (novos) => {
      queryClient.setQueryData(queryKey, novos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error(`Erro ao salvar:`, err);
      toast.error("Erro ao salvar. Tente novamente.");
    },
  });

  const adicionar = useCallback(
    (item: Omit<T, "id" | "criadoEm"> & { id?: string; criadoEm?: string }) => {
      const novo = {
        ...item,
        id: item.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        criadoEm: item.criadoEm || new Date().toISOString(),
      } as T;
      mutate([...items, novo]);
      return novo;
    },
    [items, mutate],
  );

  const atualizar = useCallback(
    (item: T) => {
      mutate(items.map((p) => (p.id === item.id ? item : p)));
    },
    [items, mutate],
  );

  const remover = useCallback(
    (id: string) => {
      mutate(items.filter((p) => p.id !== id));
    },
    [items, mutate],
  );

  const getById = useCallback(
    (id: string) => items.find((p) => p.id === id) ?? null,
    [items],
  );

  return { items, adicionar, atualizar, remover, getById };
}

export function useTecnicos() {
  const crud = useCrudSupabase<Tecnico>(["crud", "tecnicos"], listTecnicosApi, saveTecnicos);
  return { ...crud, emptyForm: (): Omit<Tecnico, "id" | "criadoEm"> => ({ nome: "", especialidade: "", telefone: "", email: "", ativo: true }) };
}

export function useServicos() {
  const crud = useCrudSupabase<Servico>(["crud", "servicos"], listServicosApi, saveServicos);
  return { ...crud, emptyForm: (): Omit<Servico, "id" | "criadoEm"> => ({ cliente: "", tecnico: "", descricao: "", data: new Date().toISOString().slice(0, 10), valor: 0, status: "agendado" }) };
}

export function useColaboradores() {
  const crud = useCrudSupabase<Colaborador>(["crud", "colaboradores"], listColaboradoresApi, saveColaboradores);
  return { ...crud, emptyForm: (): Omit<Colaborador, "id" | "criadoEm"> => ({ nome: "", cargo: "", departamento: "", telefone: "", email: "", ativo: true }) };
}

export function useServicosCadastro() {
  const crud = useCrudSupabase<ServicoCadastro>(["crud", "servicos-cadastro"], listServicosCadastroApi, saveServicosCadastro);
  return { ...crud, emptyForm: (): Omit<ServicoCadastro, "id" | "criadoEm"> => ({ nome: "", descricao: "", valor: 0, categoria: "", ativo: true }) };
}

export function useMetas() {
  const crud = useCrudSupabase<Meta>(["crud", "metas"], listMetasApi, saveMetas);
  return { ...crud, emptyForm: (): Omit<Meta, "id" | "criadoEm"> => ({ descricao: "", valorMeta: 0, valorAtual: 0, periodo: new Date().toISOString().slice(0, 7), tipo: "mensal" }) };
}

export function useUsuarios() {
  const crud = useCrudSupabase<Usuario>(["crud", "usuarios"], listUsuariosApi, saveUsuarios);
  return { ...crud, emptyForm: (): Omit<Usuario, "id" | "criadoEm"> => ({ nome: "", username: "", role: "user", ativo: true }) };
}

export function usePermissoes() {
  const crud = useCrudSupabase<Permissao>(["crud", "permissoes"], listPermissoesApi, savePermissoes);
  return { ...crud, emptyForm: (): Omit<Permissao, "id" | "criadoEm"> => ({ role: "user", recurso: "", leitura: true, escrita: false }) };
}

export { SERVICO_STATUS_LABEL } from "./types";
