import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PieChart, TrendingUp, DollarSign, Percent } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { calcularDRE, fmtBRL, fmtPct } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/rentabilidade")({
  head: () => ({ meta: [{ title: "Rentabilidade — Artec Financeiro" }] }),
  component: RentabilidadePage,
});

function RentabilidadePage() {
  const [lancs] = useLancamentos();
  const dre = useMemo(() => calcularDRE(lancs), [lancs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#10B981]/10 text-[#10B981]">
          <PieChart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Rentabilidade</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Análise de rentabilidade por serviço e centro de custo</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Margem Líquida", value: fmtPct(dre.margemLiquida), icon: <Percent className="h-5 w-5" />, color: "#10B981" },
          { label: "Lucro Líquido", value: fmtBRL(dre.lucroLiquido), icon: <DollarSign className="h-5 w-5" />, color: "#215797" },
          { label: "Receita Total", value: fmtBRL(dre.receitaBruta), icon: <TrendingUp className="h-5 w-5" />, color: "#6B2FD6" },
          { label: "ROI", value: dre.receitaBruta > 0 ? fmtPct((dre.lucroLiquido / dre.receitaBruta) * 100) : "0%", icon: <PieChart className="h-5 w-5" />, color: "#F59E0B" },
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
