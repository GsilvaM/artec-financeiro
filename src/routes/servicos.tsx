import { createFileRoute } from "@tanstack/react-router";
import { Wrench, ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Artec Financeiro" }] }),
  component: ServicosPage,
});

function ServicosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Serviços</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Acompanhamento de serviços em andamento</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Em Andamento", value: "0", icon: <Clock className="h-5 w-5" />, color: "#215797" },
          { label: "Concluídos", value: "0", icon: <CheckCircle2 className="h-5 w-5" />, color: "#10B981" },
          { label: "Atrasados", value: "0", icon: <AlertCircle className="h-5 w-5" />, color: "#EF4444" },
          { label: "Total", value: "0", icon: <ClipboardList className="h-5 w-5" />, color: "#6B2FD6" },
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
        <p className="text-[#4B5563] font-medium">Gestão de serviços em breve</p>
        <p className="text-sm text-[#9CA3AF] mt-1">Esta funcionalidade estará disponível em breve</p>
      </div>
    </div>
  );
}
