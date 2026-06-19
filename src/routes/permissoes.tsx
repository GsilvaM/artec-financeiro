import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ShieldCheck, Lock, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { usePermissoes, type Permissao } from "@/lib/financeiro/crud-storage";

export const Route = createFileRoute("/permissoes")({
  head: () => ({ meta: [{ title: "Permissões — Artec Financeiro" }] }),
  component: PermissoesPage,
});

const ROLES = ["admin", "user", "supervisor", "financeiro"] as const;
const ROLE_LABEL: Record<string, string> = { admin: "Admin", user: "Usuário", supervisor: "Supervisor", financeiro: "Financeiro" };

const RECURSOS_SUGESTOES = ["lancamentos", "categorias", "tecnicos", "servicos", "colaboradores", "servicos-cadastro", "metas", "usuarios", "permissoes", "fluxo-caixa", "relatorios", "dashboard"];

function PermissoesPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = usePermissoes();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Permissao, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((p) => {
    const q = busca.toLowerCase();
    return !q || p.role.toLowerCase().includes(q) || p.recurso.toLowerCase().includes(q);
  });

  const rolesCount = [...new Set(items.map((p) => p.role))].length;
  const recursosCount = [...new Set(items.map((p) => p.recurso))].length;

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(p: Permissao) { setForm({ ...p }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir esta permissão?")) { remover(id); toast.success("Permissão excluída"); } }
  function salvar() {
    if (!form.recurso.trim()) { toast.error("Informe o recurso"); return; }
    if (editando) { atualizar(form as Permissao); toast.success("Permissão atualizada"); }
    else { adicionar(form); toast.success("Permissão adicionada"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#EF4444]/10 text-[#EF4444]"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Permissões</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Regras de acesso por função</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Nova Permissão</button>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#6B2FD6]">{rolesCount}</div><div className="kpi-label">Funções</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{recursosCount}</div><div className="kpi-label">Recursos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#F59E0B]">{items.filter((p) => p.escrita).length}</div><div className="kpi-label">Permissões de Escrita</div></div>
      </div>
      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar permissões..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Função</th>
                <th className="table-header th">Recurso</th>
                <th className="table-header th text-center">Leitura</th>
                <th className="table-header th text-center">Escrita</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhuma permissão cadastrada.</td></tr>
              )}
              {filtrados.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.role === "admin" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#215797]/10 text-[#215797]"}`}>
                      <Lock className="h-3 w-3" />{ROLE_LABEL[p.role] || p.role}
                    </span>
                  </td>
                  <td className="table-cell font-medium">{p.recurso}</td>
                  <td className="table-cell text-center">{p.leitura ? <Eye className="h-4 w-4 inline text-[#10B981]" /> : <span className="text-[#D1D5DB]">—</span>}</td>
                  <td className="table-cell text-center">{p.escrita ? <Edit3 className="h-4 w-4 inline text-[#6B2FD6]" /> : <span className="text-[#D1D5DB]">—</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => editar(p)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => excluir(p.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar permissão" : "Nova permissão"}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Função</label>
                  <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light">
                    {ROLES.filter(Boolean).map((r) => (<option key={r} value={r}>{ROLE_LABEL[r]}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Recurso *</label>
                  <input value={form.recurso} list="recursos-list" onChange={(e) => setForm(p => ({ ...p, recurso: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                  <datalist id="recursos-list">
                    {RECURSOS_SUGESTOES.map((r) => (<option key={r} value={r} />))}
                  </datalist>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-[#4B5563] cursor-pointer">
                  <input type="checkbox" checked={form.leitura} onChange={(e) => setForm(p => ({ ...p, leitura: e.target.checked }))} className="rounded" />
                  <Eye className="h-4 w-4 text-[#10B981]" /> Leitura
                </label>
                <label className="flex items-center gap-2 text-sm text-[#4B5563] cursor-pointer">
                  <input type="checkbox" checked={form.escrita} onChange={(e) => setForm(p => ({ ...p, escrita: e.target.checked }))} className="rounded" />
                  <Edit3 className="h-4 w-4 text-[#6B2FD6]" /> Escrita
                </label>
              </div>
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
