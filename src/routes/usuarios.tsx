import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Users, Shield, User, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useUsuarios, type Usuario } from "@/lib/financeiro/crud-storage";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Artec Financeiro" }] }),
  component: UsuariosPage,
});

function UsuariosPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = useUsuarios();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Usuario, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((u) => {
    const q = busca.toLowerCase();
    return !q || u.nome.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const admins = items.filter((u) => u.role === "admin").length;
  const ativos = items.filter((u) => u.ativo).length;

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(u: Usuario) { setForm({ ...u }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir este usuário?")) { remover(id); toast.success("Usuário excluído"); } }
  function salvar() {
    if (!form.nome.trim()) { toast.error("Informe o nome"); return; }
    if (!form.username.trim()) { toast.error("Informe o username"); return; }
    if (editando) { atualizar(form as Usuario); toast.success("Usuário atualizado"); }
    else { adicionar(form); toast.success("Usuário adicionado"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#6B2FD6]/10 text-[#6B2FD6]"><Users className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Usuários</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Controle de acesso ao sistema</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Novo Usuário</button>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{ativos}</div><div className="kpi-label">Ativos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#EF4444]">{items.length - ativos}</div><div className="kpi-label">Inativos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#F59E0B]">{admins}</div><div className="kpi-label">Administradores</div></div>
      </div>
      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar usuários..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Nome</th>
                <th className="table-header th">Username</th>
                <th className="table-header th hidden sm:table-cell">Função</th>
                <th className="table-header th">Status</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhum usuário cadastrado.</td></tr>
              )}
              {filtrados.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="table-cell font-medium"><User className="h-3.5 w-3.5 inline mr-1.5 text-[#9CA3AF]" />{u.nome}</td>
                  <td className="table-cell text-sm text-[#6B7280]">@{u.username}</td>
                  <td className="table-cell hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#215797]/10 text-[#215797]"}`}>
                      <Shield className="h-3 w-3" />{u.role === "admin" ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="table-cell">{u.ativo ? <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Ativo</span> : <span className="text-[#9CA3AF] flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Inativo</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => editar(u)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => excluir(u.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar usuário" : "Novo usuário"}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome *</label>
                  <input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Username *</label>
                  <input value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Função</label>
                <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value as "admin" | "user" }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light">
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#4B5563] cursor-pointer">
                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm(p => ({ ...p, ativo: e.target.checked }))} className="rounded" />
                Ativo
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setOpen(false)} className="btn-secondary text-sm">Cancelar</button>
              <button onClick={salvar} className="btn-primary text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
