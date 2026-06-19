import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Tag, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useServicosCadastro, type ServicoCadastro } from "@/lib/financeiro/crud-storage";
import { fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/servicos-cadastro")({
  head: () => ({ meta: [{ title: "Catálogo de Serviços — Artec Financeiro" }] }),
  component: ServicosCadastroPage,
});

function ServicosCadastroPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = useServicosCadastro();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<ServicoCadastro, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((s) => {
    const q = busca.toLowerCase();
    return !q || s.nome.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q) || s.descricao.toLowerCase().includes(q);
  });

  const categorias = [...new Set(items.map((s) => s.categoria).filter(Boolean))];

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(s: ServicoCadastro) { setForm({ ...s }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir este serviço do catálogo?")) { remover(id); toast.success("Serviço excluído do catálogo"); } }
  function salvar() {
    if (!form.nome.trim()) { toast.error("Informe o nome do serviço"); return; }
    if (form.valor <= 0) { toast.error("Informe um valor válido"); return; }
    if (editando) { atualizar(form as ServicoCadastro); toast.success("Serviço atualizado"); }
    else { adicionar(form); toast.success("Serviço adicionado ao catálogo"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#10B981]/10 text-[#10B981]"><Package className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Catálogo de Serviços</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Serviços prestados pela Artec</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Novo Serviço</button>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{items.filter((s) => s.ativo).length}</div><div className="kpi-label">Ativos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#6B2FD6]">{categorias.length}</div><div className="kpi-label">Categorias</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#F59E0B]">{fmtBRL(items.reduce((s, sv) => s + sv.valor, 0))}</div><div className="kpi-label">Valor Total</div></div>
      </div>
      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar no catálogo..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Serviço</th>
                <th className="table-header th hidden sm:table-cell">Categoria</th>
                <th className="table-header th hidden md:table-cell">Descrição</th>
                <th className="table-header th text-right">Valor</th>
                <th className="table-header th">Status</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhum serviço no catálogo.</td></tr>
              )}
              {filtrados.map((s) => (
                <tr key={s.id} className="table-row">
                  <td className="table-cell font-medium">{s.nome}</td>
                  <td className="table-cell hidden sm:table-cell"><Tag className="h-3.5 w-3.5 inline mr-1 text-[#215797]" />{s.categoria || "—"}</td>
                  <td className="table-cell hidden md:table-cell max-w-[200px] truncate">{s.descricao}</td>
                  <td className="table-cell text-right font-semibold">{fmtBRL(s.valor)}</td>
                  <td className="table-cell">{s.ativo ? <span className="text-[#10B981] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Ativo</span> : <span className="text-[#9CA3AF] flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Inativo</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => editar(s)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => excluir(s.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar serviço" : "Novo serviço"}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Nome *</label>
                  <input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.valor || ""} onChange={(e) => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Categoria</label>
                <input value={form.categoria} onChange={(e) => setForm(p => ({ ...p, categoria: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} rows={3}
                  className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
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
