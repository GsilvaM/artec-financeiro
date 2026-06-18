import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import type { Categorias, Lancamento } from "./types";
import { CATEGORIAS_INICIAIS } from "./seed";
import {
  getData,
  saveLancamentos as saveLancamentosApi,
  saveCategorias as saveCategoriasApi,
} from "./server-fns";

const LANC_KEY = ["financeiro", "lancamentos"];
const CAT_KEY = ["financeiro", "categorias"];

export function useLancamentos(): [Lancamento[], (l: Lancamento[]) => void] {
  const queryClient = useQueryClient();

  const { data: lancamentos = [] } = useQuery({
    queryKey: LANC_KEY,
    queryFn: async () => {
      const data = await getData();
      return Array.isArray(data.lancamentos) ? data.lancamentos : [];
    },
    staleTime: 60_000,
  });

  const { mutate } = useMutation({
    mutationFn: async (novos: Lancamento[]) => {
      await saveLancamentosApi({ data: novos });
    },
    onMutate: (novos) => {
      queryClient.setQueryData(LANC_KEY, novos);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LANC_KEY });
    },
    onError: (err) => {
      console.error("Erro ao salvar lançamentos:", err);
      toast.error("Erro ao salvar lançamentos. Tente novamente.");
    },
  });

  const setter = useCallback((novos: Lancamento[]) => mutate(novos), [mutate]);

  return [lancamentos, setter];
}

export function useCategorias(): [Categorias, (c: Categorias) => void] {
  const queryClient = useQueryClient();

  const { data: categorias } = useQuery({
    queryKey: CAT_KEY,
    queryFn: async () => {
      const data = await getData();
      return {
        receitas: data?.categorias?.receitas ?? [],
        custos: data?.categorias?.custos ?? [],
        despesas: data?.categorias?.despesas ?? [],
        deducoes: data?.categorias?.deducoes ?? [],
        receitas_financeiras: data?.categorias?.receitas_financeiras ?? [],
        despesas_financeiras: data?.categorias?.despesas_financeiras ?? [],
      } satisfies Categorias;
    },
    staleTime: 60_000,
  });

  const { mutate } = useMutation({
    mutationFn: async (novas: Categorias) => {
      await saveCategoriasApi({ data: novas });
    },
    onMutate: (novas) => {
      queryClient.setQueryData(CAT_KEY, novas);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CAT_KEY });
    },
    onError: (err) => {
      console.error("Erro ao salvar categorias:", err);
      toast.error("Erro ao salvar categorias. Tente novamente.");
    },
  });

  const setter = useCallback((novas: Categorias) => mutate(novas), [mutate]);

  return [categorias ?? CATEGORIAS_INICIAIS, setter];
}

export async function exportarBackup() {
  const data = await getData();

  const backup = {
    exportadoEm: new Date().toISOString(),
    categorias: data.categorias,
    lancamentos: data.lancamentos,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `artec-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importarBackup(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (data.categorias && typeof data.categorias === "object") {
    await saveCategoriasApi({ data: data.categorias });
  }
  if (Array.isArray(data.lancamentos)) {
    await saveLancamentosApi({ data: data.lancamentos });
  }
}

export function exportarCSV(lancamentos: Lancamento[]) {
  const headers = [
    "Data",
    "Tipo",
    "Categoria",
    "Descricao",
    "Cliente/Fornecedor",
    "Valor",
    "Status",
  ];

  const rows = lancamentos.map((l) => [
    l.data,
    l.tipo,
    l.categoria,
    l.descricao,
    l.contraparte,
    l.valor.toFixed(2).replace(".", ","),
    l.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return text.includes(";") || text.includes('"') || text.includes("\n")
            ? `"${text.replace(/"/g, '""')}"`
            : text;
        })
        .join(";"),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `artec-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
