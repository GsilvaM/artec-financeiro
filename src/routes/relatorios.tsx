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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Relatórios</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumo do período e tabela detalhada exportável em CSV.
          </p>
        </div>
        <Button onClick={() => exportarCSV(filtrados)}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#215797]/10 text-[#215797]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Recebido
              </p>
              <p className="text-lg font-bold text-[#215797] tabular-nums">
                {fmtBRL(resumo.totalRecebido)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EB4134]/10 text-[#EB4134]">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Pago
              </p>
              <p className="text-lg font-bold text-[#EB4134] tabular-nums">
                {fmtBRL(resumo.totalPago)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2783C3]/10 text-[#2783C3]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Saldo do Período
              </p>
              <p className="text-lg font-bold text-[#2783C3] tabular-nums">
                {fmtBRL(resumo.saldo)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2C3A5C]/10 text-[#2C3A5C]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Qtd. Receitas
              </p>
              <p className="text-lg font-bold text-[#2C3A5C] tabular-nums">{resumo.qtdReceitas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EB4134]/10 text-[#EB4134]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Qtd. Despesas
              </p>
              <p className="text-lg font-bold text-[#EB4134] tabular-nums">{resumo.qtdDespesas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base text-primary">Filtros</CardTitle>
          <div className="flex flex-wrap gap-3">
            <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-48 border-primary/20 bg-white">
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
                    <Badge variant={l.status === "pendente" ? "secondary" : "default"}>
                      {STATUS_LABEL[l.status]}
                    </Badge>
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
