import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, TrendingUp, TrendingDown, Wallet, Receipt, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { exportarCSV, useLancamentos } from "@/lib/financeiro/storage";
import { anosDisponiveis, filtrarPorPeriodo, fmtBRL } from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";
import { STATUS_LABEL, TIPO_LABEL } from "@/lib/financeiro/types";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Artec Financeiro" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [lancs] = useLancamentos();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? new Date().getFullYear());
  const [mes, setMes] = useState<number | "todos">("todos");
  const [cat, setCat] = useState<string>("todas");

  const filtrados = useMemo(() => {
    const base = filtrarPorPeriodo(lancs, ano, mes);
    return base
      .filter((l) => cat === "todas" || l.categoria === cat)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [lancs, ano, mes, cat]);

  const categoriasDisponiveis = useMemo(
    () => Array.from(new Set(lancs.map((l) => l.categoria))).sort(),
    [lancs],
  );

  const resumo = useMemo(() => {
    const recebidas = filtrados.filter(
      (l) =>
        (l.tipo === "receita" || l.tipo === "receita_financeira") &&
        (l.status === "recebido" || l.status === "pago"),
    );
    const pagas = filtrados.filter(
      (l) =>
        (l.tipo === "custo_direto" ||
          l.tipo === "despesa_operacional" ||
          l.tipo === "despesa_financeira") &&
        (l.status === "pago" || l.status === "recebido"),
    );
    const totalRecebido = recebidas.reduce((s, l) => s + l.valor, 0);
    const totalPago = pagas.reduce((s, l) => s + l.valor, 0);
    const qtdReceitas = filtrados.filter(
      (l) => l.tipo === "receita" || l.tipo === "receita_financeira",
    ).length;
    const qtdDespesas = filtrados.filter(
      (l) =>
        l.tipo === "custo_direto" ||
        l.tipo === "despesa_operacional" ||
        l.tipo === "despesa_financeira",
    ).length;
    return {
      totalRecebido,
      totalPago,
      saldo: totalRecebido - totalPago,
      qtdReceitas,
      qtdDespesas,
    };
  }, [filtrados]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Relatórios</h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Resumo do período e tabela exportável em CSV.
          </p>
        </div>
        <Button onClick={() => exportarCSV(filtrados)} className="shrink-0 text-xs sm:text-sm">
          <Download className="mr-1.5 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        <Card className="animate-slide-up transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="flex items-center gap-2 p-2 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#215797]/10 text-[#215797] sm:h-11 sm:w-11">
              <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                Total Recebido
              </p>
              <p className="text-[11px] font-bold text-[#215797] tabular-nums sm:text-lg">
                {fmtBRL(resumo.totalRecebido)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="flex items-center gap-2 p-2 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EB4134]/10 text-[#EB4134] sm:h-11 sm:w-11">
              <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                Total Pago
              </p>
              <p className="text-[11px] font-bold text-[#EB4134] tabular-nums sm:text-lg">
                {fmtBRL(resumo.totalPago)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="flex items-center gap-2 p-2 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2783C3]/10 text-[#2783C3] sm:h-11 sm:w-11">
              <Wallet className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                Saldo do Período
              </p>
              <p className="text-[11px] font-bold text-[#2783C3] tabular-nums sm:text-lg">
                {fmtBRL(resumo.saldo)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="flex items-center gap-2 p-2 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2C3A5C]/10 text-[#2C3A5C] sm:h-11 sm:w-11">
              <Receipt className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                Qtd. Receitas
              </p>
              <p className="text-[11px] font-bold text-[#2C3A5C] tabular-nums sm:text-lg">{resumo.qtdReceitas}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="flex items-center gap-2 p-2 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EB4134]/10 text-[#EB4134] sm:h-11 sm:w-11">
              <ArrowRightLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                Qtd. Despesas
              </p>
              <p className="text-[11px] font-bold text-[#EB4134] tabular-nums sm:text-lg">{resumo.qtdDespesas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-sm text-primary sm:text-base">Filtros</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-full sm:w-48 border-primary/20 bg-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categoriasDisponiveis.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Data</TableHead>
                <TableHead className="hidden max-sm:hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="text-xs sm:text-sm">Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Cliente/Fornecedor</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Valor</TableHead>
                <TableHead className="hidden max-sm:hidden">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-sm text-muted-foreground"
                  >
                    Nenhum lançamento no período.
                  </TableCell>
                </TableRow>
              )}
              {filtrados.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm p-2 sm:p-3">
                    {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="hidden max-sm:hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">{TIPO_LABEL[l.tipo]}</TableCell>
                  <TableCell className="hidden sm:table-cell whitespace-nowrap">{l.categoria}</TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs sm:text-sm sm:max-w-none p-2 sm:p-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full sm:hidden ${
                        l.status === "pendente" ? "bg-amber-400" :
                        l.status === "pago" || l.status === "recebido" ? "bg-emerald-400" :
                        "bg-gray-400"
                      }`} />
                      {l.descricao}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell whitespace-nowrap">{l.contraparte}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums whitespace-nowrap text-xs sm:text-sm p-2 sm:p-3">
                    {fmtBRL(l.valor)}
                  </TableCell>
                  <TableCell className="hidden max-sm:hidden whitespace-nowrap">
                    <Badge variant={l.status === "pendente" ? "secondary" : "default"} className="text-xs">
                      {STATUS_LABEL[l.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
