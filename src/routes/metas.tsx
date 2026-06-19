import { createFileRoute } from "@tanstack/react-router";
import { Target, TrendingUp, DollarSign, Calendar } from "lucide-react";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas — Artec Financeiro" }] }),
  component: MetasPage,
});

const META_MENSAL = 85000;

function MetasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Metas</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Configuração de metas financeiras</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Meta Mensal", value: `R$ ${META_MENSAL.toLocaleString("pt-BR")}`, icon: <Target className="h-5 w-5" />, color: "#F59E0B" },
          { label: "Meta Anual", value: `R$ ${(META_MENSAL * 12).toLocaleString("pt-BR")}`, icon: <Calendar className="h-5 w-5" />, color: "#215797" },
          { label: "Progresso", value: "0%", icon: <TrendingUp className="h-5 w-5" />, color: "#10B981" },
          { label: "Atingimento", value: "R$ 0,00", icon: <DollarSign className="h-5 w-5" />, color: "#6B2FD6" },
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

      <div className="card-artec-static p-6 text-center">
        <p className="text-[#4B5563] font-medium">Gestão de metas em breve</p>
        <p className="text-sm text-[#9CA3AF] mt-1">Esta funcionalidade estará disponível em breve</p>
      </div>
    </div>
  );
}
