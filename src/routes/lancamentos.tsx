import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCategorias, useLancamentos } from "@/lib/financeiro/storage";
import {
  STATUS_LABEL,
  TIPO_LABEL,
  type Lancamento,
  type StatusLancamento,
  type TipoLancamento,
} from "@/lib/financeiro/types";
import { anosDisponiveis, filtrarPorPeriodo, fmtBRL, fmtDateISO } from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [{ title: "Lançamentos — Artec Financeiro" }],
  }),
  component: LancamentosPage,
});

const TIPOS: TipoLancamento[] = [
  "receita",
  "custo_direto",
  "despesa_operacional",
  "deducao",
  "receita_financeira",
  "despesa_financeira",
];
const STATUS: StatusLancamento[] = ["pago", "recebido", "pendente"];

function emptyForm(): Lancamento {
  return {
    id: "",
    data: new Date().toISOString().slice(0, 10),
    tipo: "receita",
    categoria: "",
    descricao: "",
    contraparte: "",
    valor: 0,
    status: "pendente",
  };
}

function LancamentosPage() {
  const [lancs, setLancs] = useLancamentos();
  const [categorias] = useCategorias();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">("todos");
  const [mes, setMes] = useState<number | "todos">("todos");
  const [busca, setBusca] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Lancamento>(emptyForm());
  const editando = !!form.id;

  const categoriasPorTipo = useCallback((tipo: TipoLancamento): string[] => {
    switch (tipo) {
      case "receita":
        return categorias.receitas;
      case "custo_direto":
        return categorias.custos;
      case "despesa_operacional":
        return categorias.despesas;
      case "deducao":
        return categorias.deducoes;
      case "receita_financeira":
        return categorias.receitas_financeiras;
      case "despesa_financeira":
        return categorias.despesas_financeiras;
    }
  }, [categorias]);

  const semCategorias = categoriasPorTipo(form.tipo).length === 0;

  const filtrados = useMemo(() => {
    const base = filtrarPorPeriodo(lancs, ano, mes);
    const q = busca.trim().toLowerCase();
    return base
      .filter(
        (l) =>
          !q ||
          l.descricao.toLowerCase().includes(q) ||
          l.contraparte.toLowerCase().includes(q) ||
          l.categoria.toLowerCase().includes(q),
      )
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [lancs, ano, mes, busca]);

  const totalReceitas = filtrados
    .filter((l) => l.tipo === "receita" || l.tipo === "receita_financeira")
    .reduce((s, l) => s + l.valor, 0);

  const totalDespesas = filtrados
    .filter((l) => l.tipo === "custo_direto" || l.tipo === "despesa_operacional" || l.tipo === "despesa_financeira")
    .reduce((s, l) => s + l.valor, 0);

  const novo = () => {
    setForm(emptyForm());
    setOpen(true);
  };
  const editar = (l: Lancamento) => {
    setForm({ ...l });
    setOpen(true);
  };
  const excluir = (id: string) => {
    if (!confirm("Excluir este lançamento?")) return;
    setLancs(lancs.filter((l) => l.id !== id));
    toast.success("Lançamento excluído");
  };
  const salvar = () => {
    const current = form;
    if (semCategorias) {
      toast.error("Cadastre categorias em Configurações antes de criar lançamentos");
      return;
    }
    if (!current.categoria) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!current.descricao.trim()) {
      toast.error("Informe a descrição");
      return;
    }
    if (current.valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (current.id) {
      setLancs(lancs.map((l) => (l.id === current.id ? current : l)));
      toast.success("Lançamento atualizado");
    } else {
      setLancs([
        ...lancs,
        {
          ...current,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        },
      ]);
      toast.success("Lançamento adicionado");
    }
    setOpen(false);
  };

  const statusVariant = (s: StatusLancamento) => (s === "pendente" ? "secondary" : "default");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Lançamentos</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Cadastre receitas, custos e despesas</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button onClick={novo} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Novo Lançamento
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-[#215797]">
                {editando ? "Editar lançamento" : "Novo lançamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#9CA3AF]">Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#9CA3AF]">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#9CA3AF]">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm(prev => ({
                      ...prev,
                      tipo: v as TipoLancamento,
                      categoria: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#9CA3AF]">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm(prev => ({ ...prev, status: v as StatusLancamento }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium text-[#9CA3AF]">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm(prev => ({ ...prev, categoria: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {categoriasPorTipo(form.tipo).length === 0 ? (
                      <div className="px-2 py-4 text-xs text-center text-[#9CA3AF]">
                        Nenhuma categoria cadastrada
                      </div>
                    ) : (
                      categoriasPorTipo(form.tipo).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium text-[#9CA3AF]">Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium text-[#9CA3AF]">Cliente ou Fornecedor</Label>
                <Input
                  value={form.contraparte}
                  onChange={(e) => setForm(prev => ({ ...prev, contraparte: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setOpen(false)} className="btn-secondary text-sm">
                Cancelar
              </button>
              <button onClick={salvar} disabled={semCategorias} className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">Salvar</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="kpi-card">
          <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Total Lançamentos</div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1">{filtrados.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Receitas</div>
          <div className="text-2xl font-bold text-[#215797] mt-1">{fmtBRL(totalReceitas)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Despesas</div>
          <div className="text-2xl font-bold text-[#EF4444] mt-1">{fmtBRL(totalDespesas)}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Saldo</div>
          <div className={`text-2xl font-bold mt-1 ${totalReceitas - totalDespesas >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            {fmtBRL(totalReceitas - totalDespesas)}
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Pesquisar lançamentos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all"
              />
            </div>
            <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
          </div>
        </div>
        <div className="table-scroll">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-header th">Data</th>
                <th className="table-header th hidden sm:table-cell">Tipo</th>
                <th className="table-header th hidden sm:table-cell">Categoria</th>
                <th className="table-header th">Descrição</th>
                <th className="table-header th hidden sm:table-cell">Cliente/Fornecedor</th>
                <th className="table-header th text-right">Valor</th>
                <th className="table-header th hidden sm:table-cell">Status</th>
                <th className="table-header th w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#9CA3AF]">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
              {filtrados.map((l) => (
                <tr key={l.id} className="table-row">
                  <td className="table-cell whitespace-nowrap font-medium text-xs sm:text-sm">
                    {fmtDateISO(l.data)}
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      l.tipo === "receita" || l.tipo === "receita_financeira"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>{TIPO_LABEL[l.tipo]}</span>
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">{l.categoria}</td>
                  <td className="table-cell max-w-[120px] truncate sm:max-w-none">{l.descricao}</td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">{l.contraparte}</td>
                  <td className="table-cell text-right font-semibold tabular-nums whitespace-nowrap">
                    {fmtBRL(l.valor)}
                  </td>
                  <td className="table-cell hidden sm:table-cell whitespace-nowrap">
                    <Badge variant={statusVariant(l.status)} className="text-xs">
                      {STATUS_LABEL[l.status]}
                    </Badge>
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full sm:hidden ${
                        l.status === "pendente" ? "bg-amber-400" :
                        "bg-emerald-400"
                      }`} title={STATUS_LABEL[l.status]} />
                      <button onClick={() => editar(l)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => excluir(l.id)} className="btn-secondary !h-8 !w-8 !p-0 !min-w-0 !border-red-200 !text-red-500 hover:!bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
