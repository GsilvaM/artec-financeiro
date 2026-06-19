import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Target, TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useMetas, type Meta } from "@/lib/financeiro/crud-storage";
import { fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas — Artec Financeiro" }] }),
  component: MetasPage,
});

const TIPOS = ["mensal", "trimestral", "anual"] as const;
const TIPO_LABEL: Record<string, string> = { mensal: "Mensal", trimestral: "Trimestral", anual: "Anual" };

function MetasPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = useMetas();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Meta, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((m) => {
    const q = busca.toLowerCase();
    return !q || m.descricao.toLowerCase().includes(q) || m.tipo.toLowerCase().includes(q);
  });

  const atingidas = items.filter((m) => m.valorAtual >= m.valorMeta).length;
  const progressoTotal = items.length ? items.reduce((s, m) => s + (m.valorMeta > 0 ? m.valorAtual / m.valorMeta : 0), 0) / items.length * 100 : 0;

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(m: Meta) { setForm({ ...m }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir esta meta?")) { remover(id); toast.success("Meta excluída"); } }
  function salvar() {
    if (!form.descricao.trim()) { toast.error("Informe a descrição"); return; }
    if (form.valorMeta <= 0) { toast.error("Informe um valor de meta válido"); return; }
    if (editando) { atualizar(form as Meta); toast.success("Meta atualizada"); }
    else { adicionar(form); toast.success("Meta adicionada"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#10B981]/10 text-[#10B981]"><Target className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Metas</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Acompanhamento de metas financeiras</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Nova Meta</button>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{atingidas}</div><div className="kpi-label">Atingidas</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#F59E0B]">{items.length ? `${Math.round(progressoTotal)}%` : "—"}</div><div className="kpi-label">Progresso Médio</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#6B2FD6]">{fmtBRL(items.reduce((s, m) => s + m.valorMeta, 0))}</div><div className="kpi-label">Meta Total</div></div>
      </div>
      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar metas..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Descrição</th>
                <th className="table-header th text-right">Meta</th>
                <th className="table-header th text-right">Atual</th>
                <th className="table-header th hidden sm:table-cell">Progresso</th>
                <th className="table-header th hidden md:table-cell">Período</th>
                <th className="table-header th">Tipo</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhuma meta cadastrada.</td></tr>
              )}
              {filtrados.map((m) => {
                const pct = m.valorMeta > 0 ? Math.min(m.valorAtual / m.valorMeta, 1) : 0;
                const atingiu = m.valorAtual >= m.valorMeta;
                return (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell font-medium">{m.descricao}</td>
                    <td className="table-cell text-right">{fmtBRL(m.valorMeta)}</td>
                    <td className="table-cell text-right">{fmtBRL(m.valorAtual)}</td>
                    <td className="table-cell hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(pct * 100)}%`, background: atingiu ? "#10B981" : "#215797" }} />
                        </div>
                        <span className="text-xs font-medium text-[#6B7280] min-w-[32px]">{Math.round(pct * 100)}%</span>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">{m.periodo || "—"}</td>
                    <td className="table-cell"><span className="text-xs font-medium text-[#215797] bg-[#215797]/10 px-2 py-0.5 rounded-full">{TIPO_LABEL[m.tipo]}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => editar(m)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => excluir(m.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar meta" : "Nova meta"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Descrição *</label>
                <input value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Valor Meta (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.valorMeta || ""} onChange={(e) => setForm(p => ({ ...p, valorMeta: parseFloat(e.target.value) || 0 }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Valor Atual (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.valorAtual || ""} onChange={(e) => setForm(p => ({ ...p, valorAtual: parseFloat(e.target.value) || 0 }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Período (mês)</label>
                  <input type="month" value={form.periodo} onChange={(e) => setForm(p => ({ ...p, periodo: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm(p => ({ ...p, tipo: e.target.value as any }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light">
                    {TIPOS.map((t) => (<option key={t} value={t}>{TIPO_LABEL[t]}</option>))}
                  </select>
                </div>
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
