import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, UserCheck, Key } from "lucide-react";

export const Route = createFileRoute("/permissoes")({
  head: () => ({ meta: [{ title: "Permissões — Artec Financeiro" }] }),
  component: PermissoesPage,
});

function PermissoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#6B2FD6]/10 text-[#6B2FD6]">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Permissões</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Controle de permissões do sistema</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Perfis", value: "2", icon: <Shield className="h-5 w-5" />, color: "#6B2FD6" },
          { label: "Admin", value: "Acesso Total", icon: <Lock className="h-5 w-5" />, color: "#215797" },
          { label: "Usuário", value: "Acesso Parcial", icon: <UserCheck className="h-5 w-5" />, color: "#F59E0B" },
          { label: "Permissões", value: "0", icon: <Key className="h-5 w-5" />, color: "#10B981" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card-artec p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="kpi-icon-wrapper" style={{ background: `${color}15` }}>
                <div style={{ color }}>{icon}</div>
              </div>
            </div>
            <div className="kpi-value !text-base" style={{ color }}>{value}</div>
            <div className="kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card-artec-static p-6 text-center">
        <p className="text-[#4B5563] font-medium">Controle de permissões em breve</p>
        <p className="text-sm text-[#9CA3AF] mt-1">Esta funcionalidade estará disponível em breve</p>
      </div>
    </div>
  );
}
