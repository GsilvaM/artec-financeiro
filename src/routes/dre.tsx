import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import {
  anosDisponiveis,
  calcularDRE,
  filtrarPorPeriodo,
  fmtBRL,
  fmtPct,
} from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";

export const Route = createFileRoute("/dre")({
  head: () => ({
    meta: [{ title: "DRE — Artec Financeiro" }],
  }),
  component: DREPage,
});

function Linha({
  label,
  valor,
  bold,
  level = 0,
  highlight,
}: {
  label: string;
  valor: number | string;
  bold?: boolean;
  level?: number;
  highlight?: "positive" | "negative" | "header";
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 text-sm border-b border-gray-100 transition-colors hover:bg-gray-50/50 ${
        bold ? "font-semibold text-[#1F2937]" : "text-[#4B5563]"
      }`}
      style={{ paddingLeft: level * 20 + 16, paddingRight: 16 }}
    >
      <span className={`${highlight === "header" ? "font-semibold text-[#215797]" : ""}`}>{label}</span>
      <span className={`tabular-nums ${
        highlight === "positive" ? "text-emerald-600 font-semibold" :
        highlight === "negative" ? "text-red-500 font-semibold" : ""
      }`}>
        {typeof valor === "number" ? fmtBRL(valor) : valor}
      </span>
    </div>
  );
}

function DREPage() {
  const [lancs] = useLancamentos();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? 2026);
  const [mes, setMes] = useState<number | "todos">(1);

  const filtrados = useMemo(() => filtrarPorPeriodo(lancs, ano, mes), [lancs, ano, mes]);
  const dre = useMemo(() => calcularDRE(filtrados), [filtrados]);

  const cards = [
    { label: "Receita Bruta", value: fmtBRL(dre.receitaBruta), icon: <TrendingUp className="h-5 w-5" />, color: "#215797" },
    { label: "Lucro Líquido", value: fmtBRL(dre.lucroLiquido), icon: <DollarSign className="h-5 w-5" />, color: "#10B981" },
    { label: "Margem Líquida", value: fmtPct(dre.margemLiquida), icon: <TrendingUp className="h-5 w-5" />, color: "#6B2FD6" },
    { label: "Despesas Totais", value: fmtBRL(dre.custosDir + dre.despesasOp + dre.despesasFin), icon: <TrendingDown className="h-5 w-5" />, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">DRE Mensal</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Demonstrativo de Resultados do Exercício</p>
          </div>
        </div>
        <PeriodoFiltro
          ano={ano}
          mes={mes}
          anos={anos}
          onAno={setAno}
          onMes={setMes}
          incluirTodos={false}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          <h3 className="text-base font-semibold text-[#1F2937]">Demonstração do Resultado</h3>
        </div>
        <div className="py-2">
          <Linha label="Receita Bruta" valor={dre.receitaBruta} bold highlight="header" />
          {Object.entries(dre.receitasPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}
          <Linha label="(-) Deduções" valor={dre.deducoes} level={1} />
          <Linha label="(=) Receita Líquida" valor={dre.receitaLiquida} bold />

          <div className="mx-4 my-3 border-t border-gray-200" />

          <Linha label="(-) Custos Diretos" valor={dre.custosDir} bold highlight="header" />
          {Object.entries(dre.custosPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}

          <Linha
            label="(=) Lucro Bruto"
            valor={dre.lucroBruto}
            bold
            highlight={dre.lucroBruto >= 0 ? "positive" : "negative"}
          />

          <div className="mx-4 my-3 border-t border-gray-200" />

          <Linha label="(-) Despesas Operacionais" valor={dre.despesasOp} bold highlight="header" />
          {Object.entries(dre.despesasPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}

          <Linha
            label="(=) Resultado Operacional"
            valor={dre.resultadoOperacional}
            bold
            highlight={dre.resultadoOperacional >= 0 ? "positive" : "negative"}
          />

          <div className="mx-4 my-3 border-t border-gray-200" />

          <Linha label="Resultado Financeiro" valor={dre.resultadoFinanceiro} bold highlight="header" />
          <Linha label="(+) Receitas Financeiras" valor={dre.receitasFin} level={1} />
          <Linha label="(-) Despesas Financeiras" valor={dre.despesasFin} level={1} />

          <div className="mx-4 my-3 border-t-2 border-[#215797]/20" />

          <Linha
            label="(=) Lucro Líquido"
            valor={dre.lucroLiquido}
            bold
            highlight={dre.lucroLiquido >= 0 ? "positive" : "negative"}
          />
          <Linha label="Margem Líquida" valor={fmtPct(dre.margemLiquida)} bold />
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-[#9CA3AF]">
            DRE referente ao período selecionado. Valores em Reais (R$).
          </p>
        </div>
      </div>
    </div>
  );
}
