import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Users, Wrench, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTecnicos, type Tecnico } from "@/lib/financeiro/crud-storage";

export const Route = createFileRoute("/tecnicos")({
  head: () => ({ meta: [{ title: "Técnicos — Artec Financeiro" }] }),
  component: TecnicosPage,
});

function TecnicosPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = useTecnicos();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Tecnico, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((t) => {
    const q = busca.toLowerCase();
    return !q || t.nome.toLowerCase().includes(q) || t.especialidade.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  const ativos = items.filter((t) => t.ativo).length;
  const inativos = items.length - ativos;

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(t: Tecnico) { setForm({ ...t }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir este técnico?")) { remover(id); toast.success("Técnico excluído"); } }

  function salvar() {
    if (!form.nome.trim()) { toast.error("Informe o nome"); return; }
    if (editando) { atualizar(form as Tecnico); toast.success("Técnico atualizado"); }
    else { adicionar(form); toast.success("Técnico adicionado"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]"><Users className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Técnicos</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Gestão da equipe técnica</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Novo Técnico</button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{ativos}</div><div className="kpi-label">Ativos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#EF4444]">{inativos}</div><div className="kpi-label">Inativos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#6B2FD6]">{items.reduce((s, t) => s + (t.especialidade ? 1 : 0), 0)}</div><div className="kpi-label">Especialidades</div></div>
      </div>

      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar técnicos..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Nome</th>
                <th className="table-header th hidden sm:table-cell">Especialidade</th>
                <th className="table-header th hidden sm:table-cell">Telefone</th>
                <th className="table-header th hidden md:table-cell">Email</th>
                <th className="table-header th">Status</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhum técnico cadastrado.</td></tr>
              )}
              {filtrados.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="table-cell font-medium">{t.nome}</td>
                  <td className="table-cell hidden sm:table-cell"><Wrench className="h-3.5 w-3.5 inline mr-1 text-[#6B2FD6]" />{t.especialidade || "—"}</td>
                  <td className="table-cell hidden sm:table-cell"><Phone className="h-3.5 w-3.5 inline mr-1 text-[#9CA3AF]" />{t.telefone || "—"}</td>
                  <td className="table-cell hidden md:table-cell"><Mail className="h-3.5 w-3.5 inline mr-1 text-[#9CA3AF]" />{t.email || "—"}</td>
                  <td className="table-cell">{t.ativo ? <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Ativo</span> : <span className="text-[#9CA3AF] flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Inativo</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => editar(t)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => excluir(t.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar técnico" : "Novo técnico"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome *</label>
                <input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Especialidade</label>
                  <input value={form.especialidade} onChange={(e) => setForm(p => ({ ...p, especialidade: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Telefone</label>
                  <input value={form.telefone} onChange={(e) => setForm(p => ({ ...p, telefone: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
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
