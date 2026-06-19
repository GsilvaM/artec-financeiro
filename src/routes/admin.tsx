import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth";
import {
  Shield,
  User,
  Key,
  Save,
  Database,
  HardDrive,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administração — Artec Financeiro" }],
  }),
  component: AdminPage,
});

const RECEITA_META = 85000;

function AdminPage() {
  const { user, changePassword, updateUser } = useAuth();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.navigate({ to: "/login" });
    }
  }, [user, router]);

  if (!user) return null;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }
    setSaving(true);
    const ok = await changePassword(oldPassword, newPassword);
    setSaving(false);
    if (ok) {
      toast.success("Senha alterada com sucesso.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Senha atual incorreta.");
    }
  }

  function handleUpdateName(name: string) {
    updateUser({ name });
    toast.success("Nome atualizado.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#6B2FD6]/10 text-[#6B2FD6]">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Administração</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Gerencie usuários, senhas e dados do sistema</p>
        </div>
      </div>

      {/* User Info */}
      <div className="card-artec p-5">
        <h3 className="text-base font-semibold text-[#1F2937] flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[#215797]" />
          Informações do Usuário
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Usuário</label>
            <p className="text-sm font-medium text-[#1F2937]">{user.username}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Permissão</label>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6B2FD6]/10 text-[#6B2FD6]">
              <Shield className="h-3 w-3" />
              {user.role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome de exibição</label>
            <input
              type="text"
              defaultValue={user.name}
              onBlur={(e) => {
                if (e.target.value !== user.name) handleUpdateName(e.target.value);
              }}
              className="flex h-9 w-full max-w-xs rounded-lg border border-input bg-white px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary-light"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card-artec p-5">
        <h3 className="text-base font-semibold text-[#1F2937] flex items-center gap-2 mb-4">
          <Key className="h-4 w-4 text-[#F59E0B]" />
          Alterar Senha
        </h3>
        <form onSubmit={handleChangePassword} className="max-w-sm space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Senha atual</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary-light"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary-light"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary-light"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      </div>

      {/* System Info */}
      <div className="card-artec p-5">
        <h3 className="text-base font-semibold text-[#1F2937] flex items-center gap-2 mb-4">
          <HardDrive className="h-4 w-4 text-[#10B981]" />
          Informações do Sistema
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Versão", value: "1.0.0", icon: <Database className="h-4 w-4" />, color: "#215797" },
            { label: "Ambiente", value: "Produção", icon: <Building2 className="h-4 w-4" />, color: "#10B981" },
            { label: "Meta Mensal", value: `R$ ${RECEITA_META.toLocaleString("pt-BR")}`, icon: <Calendar className="h-4 w-4" />, color: "#F59E0B" },
            { label: "Status", value: "Operacional", icon: <CheckCircle2 className="h-4 w-4" />, color: "#10B981" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg shrink-0" style={{ background: `${color}15` }}>
                <div style={{ color }}>{icon}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#9CA3AF]">{label}</div>
                <div className="text-sm font-semibold text-[#1F2937]">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
