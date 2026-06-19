import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Scale, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { calcularDRE, fmtBRL, fmtPct } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/ponto-equilibrio")({
  head: () => ({ meta: [{ title: "Ponto de Equilíbrio — Artec Financeiro" }] }),
  component: PontoEquilibrioPage,
});

function PontoEquilibrioPage() {
  const [lancs] = useLancamentos();
  const dre = useMemo(() => calcularDRE(lancs), [lancs]);

  const custosFixos = dre.despesasOp + dre.despesasFin;
  const margemContribuicao = dre.receitaBruta - dre.custosDir;
  const pontoEquilibrio = margemContribuicao > 0
    ? (custosFixos / margemContribuicao) * dre.receitaBruta
    : 0;
  const margemSeguranca = pontoEquilibrio > 0 && dre.receitaBruta > 0
    ? ((dre.receitaBruta - pontoEquilibrio) / dre.receitaBruta) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#6B2FD6]/10 text-[#6B2FD6]">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Ponto de Equilíbrio</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Análise do ponto de equilíbrio financeiro</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4">
          <Target className="h-5 w-5 text-[#6B2FD6] mb-2" />
          <div className="kpi-value" style={{ color: "#6B2FD6" }}>{fmtBRL(pontoEquilibrio)}</div>
          <div className="kpi-label">Ponto de Equilíbrio</div>
        </div>
        <div className="card-artec p-4">
          <TrendingUp className="h-5 w-5 text-[#215797] mb-2" />
          <div className="kpi-value" style={{ color: "#215797" }}>{fmtBRL(dre.receitaBruta)}</div>
          <div className="kpi-label">Receita Atual</div>
        </div>
        <div className="card-artec p-4">
          <TrendingDown className="h-5 w-5 text-[#EF4444] mb-2" />
          <div className="kpi-value" style={{ color: "#EF4444" }}>{fmtBRL(custosFixos)}</div>
          <div className="kpi-label">Custos Fixos</div>
        </div>
        <div className="card-artec p-4">
          <Scale className="h-5 w-5 text-[#10B981] mb-2" />
          <div className="kpi-value" style={{ color: margemSeguranca >= 0 ? "#10B981" : "#EF4444" }}>{fmtPct(margemSeguranca)}</div>
          <div className="kpi-label">Margem de Segurança</div>
        </div>
      </div>
    </div>
  );
}
