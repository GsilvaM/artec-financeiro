import { createFileRoute } from "@tanstack/react-router";
import { Users, Wrench, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/tecnicos")({
  head: () => ({ meta: [{ title: "Técnicos — Artec Financeiro" }] }),
  component: TecnicosPage,
});

function TecnicosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Técnicos</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Gestão da equipe técnica</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Técnicos Ativos", value: "0", icon: <CheckCircle2 className="h-5 w-5" />, color: "#10B981" },
          { label: "Em Serviço", value: "0", icon: <Wrench className="h-5 w-5" />, color: "#215797" },
          { label: "Disponíveis", value: "0", icon: <Clock className="h-5 w-5" />, color: "#F59E0B" },
          { label: "Total", value: "0", icon: <Users className="h-5 w-5" />, color: "#6B2FD6" },
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
        <p className="text-[#4B5563] font-medium">Cadastro de técnicos em breve</p>
        <p className="text-sm text-[#9CA3AF] mt-1">Esta funcionalidade estará disponível em breve</p>
      </div>
    </div>
  );
}
