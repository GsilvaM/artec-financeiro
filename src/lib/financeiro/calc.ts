import type { Lancamento } from "./types";

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function fmtDateISO(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export const fmtPct = (n: number) => `${(isFinite(n) ? n : 0).toFixed(1).replace(".", ",")}%`;

export function filtrarPorPeriodo(
  lancs: Lancamento[],
  ano: number | "todos",
  mes: number | "todos",
) {
  return lancs.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    if (ano !== "todos" && d.getFullYear() !== ano) return false;
    if (mes !== "todos" && d.getMonth() + 1 !== mes) return false;
    return true;
  });
}

export function somaPor(lancs: Lancamento[], tipo: Lancamento["tipo"], categoria?: string) {
  return lancs
    .filter((l) => l.tipo === tipo && (!categoria || l.categoria === categoria))
    .reduce((s, l) => s + l.valor, 0);
}

export interface DRE {
  receitaBruta: number;
  receitasPorCategoria: Record<string, number>;
  deducoes: number;
  receitaLiquida: number;
  custosDir: number;
  custosPorCategoria: Record<string, number>;
  lucroBruto: number;
  despesasOp: number;
  despesasPorCategoria: Record<string, number>;
  resultadoOperacional: number;
  receitasFin: number;
  despesasFin: number;
  resultadoFinanceiro: number;
  lucroLiquido: number;
  margemLiquida: number;
}

export function calcularDRE(lancs: Lancamento[]): DRE {
  const byCat = (tipo: Lancamento["tipo"]) => {
    const out: Record<string, number> = {};
    lancs
      .filter((l) => l.tipo === tipo)
      .forEach((l) => (out[l.categoria] = (out[l.categoria] || 0) + l.valor));
    return out;
  };

  const receitasPorCategoria = byCat("receita");
  const receitaBruta = Object.values(receitasPorCategoria).reduce((a, b) => a + b, 0);
  const deducoes = somaPor(lancs, "deducao");
  const receitaLiquida = receitaBruta - deducoes;

  const custosPorCategoria = byCat("custo_direto");
  const custosDir = Object.values(custosPorCategoria).reduce((a, b) => a + b, 0);
  const lucroBruto = receitaLiquida - custosDir;

  const despesasPorCategoria = byCat("despesa_operacional");
  const despesasOp = Object.values(despesasPorCategoria).reduce((a, b) => a + b, 0);
  const resultadoOperacional = lucroBruto - despesasOp;

  const receitasFin = somaPor(lancs, "receita_financeira");
  const despesasFin = somaPor(lancs, "despesa_financeira");
  const resultadoFinanceiro = receitasFin - despesasFin;

  const lucroLiquido = resultadoOperacional + resultadoFinanceiro;
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  return {
    receitaBruta,
    receitasPorCategoria,
    deducoes,
    receitaLiquida,
    custosDir,
    custosPorCategoria,
    lucroBruto,
    despesasOp,
    despesasPorCategoria,
    resultadoOperacional,
    receitasFin,
    despesasFin,
    resultadoFinanceiro,
    lucroLiquido,
    margemLiquida,
  };
}

export function anosDisponiveis(lancs: Lancamento[]): number[] {
  const set = new Set<number>();
  lancs.forEach((l) => set.add(new Date(l.data + "T00:00:00").getFullYear()));
  if (set.size === 0) set.add(new Date().getFullYear());
  return Array.from(set).sort((a, b) => b - a);
}

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
