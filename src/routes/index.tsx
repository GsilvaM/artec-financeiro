import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLancamentos } from "@/lib/financeiro/storage";
import {
  anosDisponiveis,
  calcularDRE,
  filtrarPorPeriodo,
  fmtBRL,
  fmtPct,
  MESES,
} from "@/lib/financeiro/calc";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Artec Financeiro" },
      {
        name: "description",
        content: "Visão geral dos indicadores financeiros da Artec.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = ["#215797", "#2783C3", "#83ABCD", "#2C3A5C", "#EB4134"];

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  colorClass: string;
}

function KpiCard({ label, value, hint, icon, colorClass }: KpiCardProps) {
  return (
    <Card className="animate-slide-up overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`flex w-14 items-center justify-center sm:w-16 ${colorClass}`}>{icon}</div>
          <div className="flex flex-1 flex-col justify-center px-3 py-3 sm:px-4 sm:py-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
              {label}
            </span>
            <span className="mt-0.5 text-base font-bold text-foreground sm:text-xl">{value}</span>
            {hint && <span className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{hint}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [lancs] = useLancamentos();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? new Date().getFullYear());
  const [mes, setMes] = useState<number | "todos">("todos");

  const filtrados = useMemo(() => filtrarPorPeriodo(lancs, ano, mes), [lancs, ano, mes]);
  const dre = useMemo(() => calcularDRE(filtrados), [filtrados]);

  const dadosMensais = useMemo(() => {
    const anoRef = ano === "todos" ? new Date().getFullYear() : ano;
    return MESES.map((nome, i) => {
      const sub = lancs.filter((l) => {
        const d = new Date(l.data + "T00:00:00");
        return d.getFullYear() === anoRef && d.getMonth() === i;
      });
      const d = calcularDRE(sub);
      return {
        mes: nome.slice(0, 3),
        Receita: d.receitaBruta,
        Despesas: d.custosDir + d.despesasOp + d.despesasFin,
        Lucro: d.lucroLiquido,
      };
    });
  }, [lancs, ano]);

  const despesasCat = useMemo(() => {
    const map: Record<string, number> = {
      ...dre.despesasPorCategoria,
    };
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dre]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicadores financeiros consolidados do período selecionado.
          </p>
        </div>
        <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita Bruta"
          value={fmtBRL(dre.receitaBruta)}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          colorClass="bg-[#215797]"
        />
        <KpiCard
          label="Custos + Despesas"
          value={fmtBRL(dre.custosDir + dre.despesasOp + dre.despesasFin)}
          icon={<TrendingDown className="h-5 w-5 text-white" />}
          colorClass="bg-[#EB4134]"
        />
        <KpiCard
          label="Lucro Líquido"
          value={fmtBRL(dre.lucroLiquido)}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          colorClass="bg-[#2783C3]"
        />
        <KpiCard
          label="Margem Líquida"
          value={fmtPct(dre.margemLiquida)}
          icon={<PiggyBank className="h-5 w-5 text-white" />}
          colorClass="bg-[#2C3A5C]"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-sm text-primary sm:text-base">
              Receita x Despesas ({ano === "todos" ? new Date().getFullYear() : ano})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#D6E2ED" />
                <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <YAxis fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <Tooltip
                  formatter={(v: number) => fmtBRL(v)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #D6E2ED",
                    boxShadow: "0 4px 12px rgba(33,87,151,0.12)",
                  }}
                />
                <Legend />
                <Bar dataKey="Receita" fill="#215797" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="#EB4134" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-sm text-primary sm:text-base">Evolução do Lucro</CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#D6E2ED" />
                <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <YAxis fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <Tooltip
                  formatter={(v: number) => fmtBRL(v)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #D6E2ED",
                    boxShadow: "0 4px 12px rgba(33,87,151,0.12)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Lucro"
                  stroke="#2783C3"
                  strokeWidth={3}
                  dot={{ fill: "#2783C3", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#2783C3" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-sm text-primary sm:text-base">Evolução do Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#D6E2ED" />
                <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <YAxis fontSize={12} tick={{ fill: "#6B7A8F" }} />
                <Tooltip
                  formatter={(v: number) => fmtBRL(v)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #D6E2ED",
                    boxShadow: "0 4px 12px rgba(33,87,151,0.12)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Receita"
                  stroke="#215797"
                  strokeWidth={3}
                  dot={{ fill: "#215797", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#215797" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-sm text-primary sm:text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {despesasCat.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem despesas no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={despesasCat}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={(e: { name: string; percent: number }) =>
                      `${e.name} (${(e.percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: "#D6E2ED" }}
                  >
                    {despesasCat.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => fmtBRL(v)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #D6E2ED",
                      boxShadow: "0 4px 12px rgba(33,87,151,0.12)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
