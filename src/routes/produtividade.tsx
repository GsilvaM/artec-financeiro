import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, TrendingUp, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/produtividade")({
  head: () => ({ meta: [{ title: "Produtividade — Artec Financeiro" }] }),
  component: ProdutividadePage,
});

function ProdutividadePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#10B981]/10 text-[#10B981]">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Produtividade</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Indicadores de produtividade da equipe</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Serviços Realizados", value: "0", icon: <ClipboardList className="h-5 w-5" />, color: "#215797" },
          { label: "Ticket Médio", value: "R$ 0,00", icon: <TrendingUp className="h-5 w-5" />, color: "#10B981" },
          { label: "Técnicos Ativos", value: "0", icon: <Users className="h-5 w-5" />, color: "#6B2FD6" },
          { label: "Horas Trabalhadas", value: "0h", icon: <Clock className="h-5 w-5" />, color: "#F59E0B" },
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
