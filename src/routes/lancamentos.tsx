import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCategorias, useLancamentos } from "@/lib/financeiro/storage";
import {
  STATUS_LABEL,
  TIPO_LABEL,
  type Lancamento,
  type StatusLancamento,
  type TipoLancamento,
} from "@/lib/financeiro/types";
import { anosDisponiveis, filtrarPorPeriodo, fmtBRL } from "@/lib/financeiro/calc";
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

  const categoriasPorTipo = (tipo: TipoLancamento): string[] => {
    switch (tipo) {
      case "receita":
        return categorias.receitas;
      case "custo_direto":
        return categorias.custos;
      case "despesa_operacional":
        return categorias.despesas;
      case "receita_financeira":
        return categorias.receitas_financeiras;
      case "despesa_financeira":
        return categorias.despesas_financeiras;
    }
  };

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
    if (!form.categoria) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição");
      return;
    }
    if (form.valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (editando) {
      setLancs(lancs.map((l) => (l.id === form.id ? form : l)));
      toast.success("Lançamento atualizado");
    } else {
      setLancs([
        ...lancs,
        {
          ...form,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Lançamentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre receitas, custos e despesas. Tudo é salvo automaticamente.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={novo}>
              <Plus className="mr-2 h-4 w-4" /> Novo lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editando ? "Editar lançamento" : "Novo lançamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor || ""}
                  onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      tipo: v as TipoLancamento,
                      categoria: "",
                    })
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
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as StatusLancamento })}
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
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-medium text-muted-foreground">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm({ ...form, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasPorTipo(form.tipo).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-medium text-muted-foreground">Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Cliente ou Fornecedor
                </Label>
                <Input
                  value={form.contraparte}
                  onChange={(e) => setForm({ ...form, contraparte: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvar}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base text-primary">Filtros</CardTitle>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-72 pl-10"
              />
            </div>
            <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente/Fornecedor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground py-12"
                  >
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              )}
              {filtrados.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{TIPO_LABEL[l.tipo]}</TableCell>
                  <TableCell>{l.categoria}</TableCell>
                  <TableCell>{l.descricao}</TableCell>
                  <TableCell>{l.contraparte}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {fmtBRL(l.valor)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(l.status)}>{STATUS_LABEL[l.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => editar(l)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => excluir(l.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
