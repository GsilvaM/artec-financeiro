import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { calcularDRE, fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/relatorios-operacionais")({
  head: () => ({ meta: [{ title: "Relatórios Operacionais — Artec Financeiro" }] }),
  component: RelatoriosOperacionaisPage,
});

function RelatoriosOperacionaisPage() {
  const [lancs] = useLancamentos();
  const dre = useMemo(() => calcularDRE(lancs), [lancs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Relatórios Operacionais</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Indicadores operacionais consolidados</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {[
          { label: "Receita Operacional", value: fmtBRL(dre.receitaBruta), icon: <TrendingUp className="h-5 w-5" />, color: "#10B981" },
          { label: "Custos Operacionais", value: fmtBRL(dre.custosDir + dre.despesasOp), icon: <TrendingDown className="h-5 w-5" />, color: "#EF4444" },
          { label: "Resultado Operacional", value: fmtBRL(dre.resultadoOperacional), icon: <DollarSign className="h-5 w-5" />, color: dre.resultadoOperacional >= 0 ? "#215797" : "#EF4444" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card-artec p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="kpi-icon-wrapper" style={{ background: `${color}15` }}>
                <div style={{ color }}>{icon}</div>
              </div>
            </div>
            <div className="kpi-value" style={{ color }}>{value}</div>
            <div className="kpi-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
