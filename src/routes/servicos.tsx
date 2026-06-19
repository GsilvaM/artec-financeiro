import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Wrench, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useServicos, useTecnicos, SERVICO_STATUS_LABEL, type Servico } from "@/lib/financeiro/crud-storage";
import { fmtDateISO, fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Artec Financeiro" }] }),
  component: ServicosPage,
});

const STATUS_OPTIONS = ["agendado", "em_andamento", "concluido", "cancelado"] as const;

const STATUS_ICONS: Record<string, React.ReactNode> = {
  agendado: <Clock className="h-3.5 w-3.5" />,
  em_andamento: <Wrench className="h-3.5 w-3.5" />,
  concluido: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelado: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_CORES: Record<string, string> = {
  agendado: "#F59E0B",
  em_andamento: "#215797",
  concluido: "#10B981",
  cancelado: "#EF4444",
};

function ServicosPage() {
  const { items, adicionar, atualizar, remover, emptyForm } = useServicos();
  const { items: tecnicos } = useTecnicos();
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Servico, "id" | "criadoEm"> & { id?: string }>(emptyForm());
  const editando = !!form.id;

  const filtrados = items.filter((s) => {
    const q = busca.toLowerCase();
    return !q || s.cliente.toLowerCase().includes(q) || s.descricao.toLowerCase().includes(q) || s.tecnico.toLowerCase().includes(q);
  });

  const emAndamento = items.filter((s) => s.status === "em_andamento").length;
  const concluidos = items.filter((s) => s.status === "concluido").length;
  const atrasados = items.filter((s) => s.status === "agendado").length;

  function novo() { setForm(emptyForm()); setOpen(true); }
  function editar(s: Servico) { setForm({ ...s }); setOpen(true); }
  function excluir(id: string) { if (confirm("Excluir este serviço?")) { remover(id); toast.success("Serviço excluído"); } }

  function salvar() {
    if (!form.cliente.trim()) { toast.error("Informe o cliente"); return; }
    if (form.valor <= 0) { toast.error("Informe um valor válido"); return; }
    if (editando) { atualizar(form as Servico); toast.success("Serviço atualizado"); }
    else { adicionar(form); toast.success("Serviço adicionado"); }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]"><Wrench className="h-5 w-5" /></div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Serviços</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Acompanhamento de serviços</p>
          </div>
        </div>
        <button onClick={novo} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Novo Serviço</button>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4"><div className="kpi-value text-[#215797]">{items.length}</div><div className="kpi-label">Total</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#10B981]">{concluidos}</div><div className="kpi-label">Concluídos</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#F59E0B]">{emAndamento}</div><div className="kpi-label">Em Andamento</div></div>
        <div className="card-artec p-4"><div className="kpi-value text-[#EF4444]">{atrasados}</div><div className="kpi-label">Agendados</div></div>
      </div>

      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pesquisar serviços..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all" />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Cliente</th>
                <th className="table-header th hidden sm:table-cell">Técnico</th>
                <th className="table-header th hidden md:table-cell">Descrição</th>
                <th className="table-header th">Data</th>
                <th className="table-header th text-right">Valor</th>
                <th className="table-header th">Status</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-[#9CA3AF]">Nenhum serviço cadastrado.</td></tr>
              )}
              {filtrados.map((s) => (
                <tr key={s.id} className="table-row">
                  <td className="table-cell font-medium">{s.cliente}</td>
                  <td className="table-cell hidden sm:table-cell">{s.tecnico || "—"}</td>
                  <td className="table-cell hidden md:table-cell max-w-[200px] truncate">{s.descricao}</td>
                  <td className="table-cell whitespace-nowrap">{fmtDateISO(s.data)}</td>
                  <td className="table-cell text-right font-semibold">{fmtBRL(s.valor)}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${STATUS_CORES[s.status]}15`, color: STATUS_CORES[s.status] }}>
                      {STATUS_ICONS[s.status]} {SERVICO_STATUS_LABEL[s.status]}
                    </span>
                  </td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">{editando ? "Editar serviço" : "Novo serviço"}</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Cliente *</label>
                  <input value={form.cliente} onChange={(e) => setForm(p => ({ ...p, cliente: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Técnico</label>
                  <select value={form.tecnico} onChange={(e) => setForm(p => ({ ...p, tecnico: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light">
                    <option value="">Selecione</option>
                    {tecnicos.filter((t) => t.ativo).map((t) => (<option key={t.id} value={t.nome}>{t.nome}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Descrição</label>
                <input value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Data</label>
                  <input type="date" value={form.data} onChange={(e) => setForm(p => ({ ...p, data: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.valor || ""} onChange={(e) => setForm(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as any }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary-light">
                  {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{SERVICO_STATUS_LABEL[s]}</option>))}
                </select>
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
