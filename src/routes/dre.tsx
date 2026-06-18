import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLancamentos } from "@/lib/financeiro/storage";
import {
  anosDisponiveis,
  calcularDRE,
  filtrarPorPeriodo,
  fmtBRL,
  fmtPct,
} from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dre")({
  head: () => ({
    meta: [{ title: "DRE — Artec Financeiro" }],
  }),
  component: DREPage,
});

function Linha({
  label,
  valor,
  bold,
  level = 0,
  highlight,
}: {
  label: string;
  valor: number | string;
  bold?: boolean;
  level?: number;
  highlight?: "positive" | "negative" | "header";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border py-2.5 text-sm transition-colors hover:bg-muted/30",
        bold && "font-bold text-foreground",
        highlight === "header" && "bg-primary/5 px-3 -mx-3 rounded-lg font-semibold text-primary",
        highlight === "positive" && "text-emerald-600 font-semibold",
        highlight === "negative" && "text-red-500 font-semibold",
      )}
      style={{ paddingLeft: level * 20 + (highlight === "header" ? 12 : 0) }}
    >
      <span>{label}</span>
      <span className="tabular-nums">{typeof valor === "number" ? fmtBRL(valor) : valor}</span>
    </div>
  );
}

function DREPage() {
  const [lancs] = useLancamentos();
  const anos = anosDisponiveis(lancs);
  const now = new Date();
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? now.getFullYear());
  const [mes, setMes] = useState<number | "todos">(now.getMonth() + 1);

  const filtrados = useMemo(() => filtrarPorPeriodo(lancs, ano, mes), [lancs, ano, mes]);
  const dre = useMemo(() => calcularDRE(filtrados), [filtrados]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">DRE Mensal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demonstrativo gerado automaticamente com base nos lançamentos.
          </p>
        </div>
        <PeriodoFiltro
          ano={ano}
          mes={mes}
          anos={anos}
          onAno={setAno}
          onMes={setMes}
          incluirTodos={false}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary">Demonstração do Resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5">
          <Linha label="Receita Bruta" valor={dre.receitaBruta} bold highlight="header" />
          {Object.entries(dre.receitasPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}
          <Linha label="(-) Deduções" valor={dre.deducoes} level={1} />
          <Linha label="(=) Receita Líquida" valor={dre.receitaLiquida} bold />

          <div className="my-3 border-t border-border" />

          <Linha label="(-) Custos Diretos" valor={dre.custosDir} bold highlight="header" />
          {Object.entries(dre.custosPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}

          <Linha
            label="(=) Lucro Bruto"
            valor={dre.lucroBruto}
            bold
            highlight={dre.lucroBruto >= 0 ? "positive" : "negative"}
          />

          <div className="my-3 border-t border-border" />

          <Linha label="(-) Despesas Operacionais" valor={dre.despesasOp} bold highlight="header" />
          {Object.entries(dre.despesasPorCategoria).map(([c, v]) => (
            <Linha key={c} label={c} valor={v} level={1} />
          ))}

          <Linha
            label="(=) Resultado Operacional"
            valor={dre.resultadoOperacional}
            bold
            highlight={dre.resultadoOperacional >= 0 ? "positive" : "negative"}
          />

          <div className="my-3 border-t border-border" />

          <Linha
            label="Resultado Financeiro"
            valor={dre.resultadoFinanceiro}
            bold
            highlight="header"
          />
          <Linha label="(+) Receitas Financeiras" valor={dre.receitasFin} level={1} />
          <Linha label="(-) Despesas Financeiras" valor={dre.despesasFin} level={1} />

          <div className="my-3 border-t-2 border-primary/20" />

          <Linha
            label="(=) Lucro Líquido"
            valor={dre.lucroLiquido}
            bold
            highlight={dre.lucroLiquido >= 0 ? "positive" : "negative"}
          />
          <Linha label="Margem Líquida" valor={fmtPct(dre.margemLiquida)} bold />

          <div className="mt-4 rounded-xl bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">
              DRE referente ao período selecionado. Valores em Reais (R$).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
