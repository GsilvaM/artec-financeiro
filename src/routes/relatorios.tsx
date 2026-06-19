import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Wallet, BarChart3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportarCSV, useLancamentos } from "@/lib/financeiro/storage";
import { anosDisponiveis, filtrarPorPeriodo, fmtBRL, fmtDateISO } from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";
import { STATUS_LABEL, TIPO_LABEL } from "@/lib/financeiro/types";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Artec Financeiro" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [lancs] = useLancamentos();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? 2026);
  const [mes, setMes] = useState<number | "todos">("todos");
  const [cat, setCat] = useState<string>("todas");

  const filtrados = useMemo(() => {
    const base = filtrarPorPeriodo(lancs, ano, mes);
    return base
      .filter((l) => cat === "todas" || l.categoria === cat)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [lancs, ano, mes, cat]);

  const categoriasDisponiveis = useMemo(
    () => Array.from(new Set(lancs.map((l) => l.categoria))).sort(),
    [lancs],
  );

  const resumo = useMemo(() => {
    const recebidas = filtrados.filter(
      (l) =>
        (l.tipo === "receita" || l.tipo === "receita_financeira") &&
        (l.status === "recebido" || l.status === "pago"),
    );
    const pagas = filtrados.filter(
      (l) =>
        (l.tipo === "custo_direto" ||
          l.tipo === "despesa_operacional" ||
          l.tipo === "despesa_financeira") &&
        (l.status === "pago" || l.status === "recebido"),
    );
    const totalRecebido = recebidas.reduce((s, l) => s + l.valor, 0);
    const totalPago = pagas.reduce((s, l) => s + l.valor, 0);
    const qtdReceitas = filtrados.filter(
      (l) => l.tipo === "receita" || l.tipo === "receita_financeira",
    ).length;
    const qtdDespesas = filtrados.filter(
      (l) =>
        l.tipo === "custo_direto" ||
        l.tipo === "despesa_operacional" ||
        l.tipo === "despesa_financeira",
    ).length;
    return {
      totalRecebido,
      totalPago,
      saldo: totalRecebido - totalPago,
      qtdReceitas,
      qtdDespesas,
    };
  }, [filtrados]);

  const cards = [
    { label: "Total Recebido", value: fmtBRL(resumo.totalRecebido), icon: <TrendingUp className="h-5 w-5" />, color: "#215797" },
    { label: "Total Pago", value: fmtBRL(resumo.totalPago), icon: <TrendingDown className="h-5 w-5" />, color: "#EF4444" },
    { label: "Saldo do Período", value: fmtBRL(resumo.saldo), icon: <Wallet className="h-5 w-5" />, color: "#10B981" },
    { label: "Qtd. Receitas", value: String(resumo.qtdReceitas), icon: <BarChart3 className="h-5 w-5" />, color: "#6B2FD6" },
    { label: "Qtd. Despesas", value: String(resumo.qtdDespesas), icon: <TrendingDown className="h-5 w-5" />, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Relatórios</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Resumo do período e exportação de dados</p>
          </div>
        </div>
        <button onClick={() => exportarCSV(filtrados)} className="btn-primary text-sm">
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="kpi-icon-wrapper" style={{ background: `${card.color}15` }}>
                <div style={{ color: card.color }}>{card.icon}</div>
              </div>
            </div>
            <div className="kpi-value" style={{ color: card.color }}>{card.value}</div>
            <div className="kpi-label mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-[#1F2937]">Filtros</h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-full sm:w-48 border-gray-200 bg-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categoriasDisponiveis.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Data</th>
                <th className="table-header th hidden sm:table-cell">Tipo</th>
                <th className="table-header th hidden sm:table-cell">Categoria</th>
                <th className="table-header th">Descrição</th>
                <th className="table-header th hidden sm:table-cell">Cliente/Fornecedor</th>
                <th className="table-header th text-right">Valor</th>
                <th className="table-header th hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-[#9CA3AF]">
                    Nenhum lançamento no período.
                  </td>
                </tr>
              )}
              {filtrados.map((l) => (
                <tr key={l.id} className="table-row">
                  <td className="table-cell whitespace-nowrap font-medium text-xs sm:text-sm">
                    {fmtDateISO(l.data)}
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      l.tipo === "receita" || l.tipo === "receita_financeira"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>{TIPO_LABEL[l.tipo]}</span>
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">{l.categoria}</td>
                  <td className="table-cell max-w-[120px] truncate sm:max-w-none">{l.descricao}</td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">{l.contraparte}</td>
                  <td className="table-cell text-right font-semibold tabular-nums whitespace-nowrap">
                    {fmtBRL(l.valor)}
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">
                    <Badge variant={l.status === "pendente" ? "secondary" : "default"} className="text-xs">
                      {STATUS_LABEL[l.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
