import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  AlertTriangle,
  BarChart3,
  Users,
} from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { useTecnicos, useServicos, useMetas } from "@/lib/financeiro/crud-storage";
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
  Area,
  AreaChart,
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

const CHART_COLORS = ["#215797", "#6B2FD6", "#10B981", "#F59E0B", "#EF4444"];

const META_FALLBACK = 85000;

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "neutral";
}

function KpiCard({ label, value, hint, icon, color, trend }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-3">
        <div className="kpi-icon-wrapper" style={{ background: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
          </div>
        )}
      </div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-label mt-0.5">{label}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

function Dashboard() {
  const [lancs] = useLancamentos();
  const { items: tecnicos } = useTecnicos();
  const { items: servicos } = useServicos();
  const { items: metas } = useMetas();
  const anos = anosDisponiveis(lancs);
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? new Date().getFullYear());
  const [mes, setMes] = useState<number | "todos">("todos");

  const filtrados = useMemo(() => filtrarPorPeriodo(lancs, ano, mes), [lancs, ano, mes]);
  const dre = useMemo(() => calcularDRE(filtrados), [filtrados]);

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const periodoMeta = `${ano === "todos" ? anoAtual : ano}-${String(mes === "todos" ? mesAtual + 1 : mes).padStart(2, "0")}`;
  const META_MENSAL = useMemo(() => {
    const match = metas.filter((m) => m.periodo === periodoMeta);
    return match.reduce((s, m) => s + m.valorMeta, 0) || META_FALLBACK;
  }, [metas, periodoMeta]);

  const dadosMensais = useMemo(() => {
    const anoRef = ano === "todos" ? anoAtual : ano;
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
  }, [lancs, ano, anoAtual]);

  const dadosAcumulados = useMemo(() => {
    let accReceita = 0;
    let accDespesa = 0;
    return dadosMensais.map((m) => {
      accReceita += m.Receita;
      accDespesa += m.Despesas;
      return {
        mes: m.mes,
        Receita: accReceita,
        Despesas: accDespesa,
        Saldo: accReceita - accDespesa,
      };
    });
  }, [dadosMensais]);

  const despesasCat = useMemo(() => {
    const map = { ...dre.despesasPorCategoria };
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dre]);

  const metaAtingida = dre.receitaBruta > 0
    ? Math.min(100, (dre.receitaBruta / META_MENSAL) * 100)
    : 0;

  const custosFixos = dre.despesasOp + dre.despesasFin;
  const margemContribuicao = dre.receitaBruta - dre.custosDir;
  const pontoEquilibrio = margemContribuicao > 0
    ? (custosFixos / margemContribuicao) * dre.receitaBruta
    : 0;

  const mesesComDados = dadosMensais.filter((m) => m.Receita > 0).length;
  const receitaMediaMensal = mesesComDados > 0 ? dre.receitaBruta / mesesComDados : 0;
  const saldoProjetado = receitaMediaMensal * 12 - (dre.custosDir + custosFixos) * 12;

  const ultimosMeses = dadosMensais.slice(-3);
  const tendenciaReceita = ultimosMeses.length >= 2 && ultimosMeses[ultimosMeses.length - 1].Receita > ultimosMeses[0].Receita ? "up" : "down";
  const tendenciaLucro = ultimosMeses.length >= 2 && ultimosMeses[ultimosMeses.length - 1].Lucro > ultimosMeses[0].Lucro ? "up" : "down";

  const alertas = useMemo(() => {
    const items: { label: string; value: string; type: "success" | "warning" | "critical" }[] = [];

    if (dre.receitaBruta < META_MENSAL * 0.5) {
      items.push({ label: "Faturamento muito abaixo da meta", value: fmtBRL(dre.receitaBruta), type: "critical" });
    } else if (dre.receitaBruta < META_MENSAL) {
      items.push({ label: "Faturamento abaixo da meta", value: `${fmtPct(metaAtingida)} atingida`, type: "warning" });
    } else {
      items.push({ label: "Meta do mês atingida", value: fmtPct(metaAtingida), type: "success" });
    }

    if (dre.receitaBruta > 0 && pontoEquilibrio > dre.receitaBruta) {
      items.push({ label: "Faturamento abaixo do ponto de equilíbrio", value: fmtBRL(pontoEquilibrio), type: "critical" });
    } else {
      items.push({ label: "Acima do ponto de equilíbrio", value: fmtBRL(pontoEquilibrio), type: "success" });
    }

    if (saldoProjetado < 0) {
      items.push({ label: "Caixa projetado negativo", value: fmtBRL(saldoProjetado), type: "critical" });
    } else {
      items.push({ label: "Caixa projetado positivo", value: fmtBRL(saldoProjetado), type: "success" });
    }

    const despesasTotal = dre.custosDir + dre.despesasOp + dre.despesasFin;
    if (dre.receitaBruta > 0 && despesasTotal / dre.receitaBruta > 0.9) {
      items.push({ label: "Despesas acima de 90% da receita", value: `${fmtPct((despesasTotal / dre.receitaBruta) * 100)}`, type: "critical" });
    } else if (dre.receitaBruta > 0 && despesasTotal / dre.receitaBruta > 0.7) {
      items.push({ label: "Despesas elevadas", value: `${fmtPct((despesasTotal / dre.receitaBruta) * 100)}`, type: "warning" });
    } else {
      items.push({ label: "Despesas sob controle", value: `${fmtPct((despesasTotal / dre.receitaBruta) * 100)}`, type: "success" });
    }

    return items;
  }, [dre, metaAtingida, pontoEquilibrio, saldoProjetado]);

  const TooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {fmtBRL(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Indicadores financeiros consolidados</p>
        </div>
        <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} />
      </div>

      {/* Row 1 - KPI Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="Receita"
          value={fmtBRL(dre.receitaBruta)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#215797"
          trend={tendenciaReceita}
          hint="Faturamento bruto do período"
        />
        <KpiCard
          label="Lucro Líquido"
          value={fmtBRL(dre.lucroLiquido)}
          icon={<DollarSign className="h-5 w-5" />}
          color="#10B981"
          trend={tendenciaLucro}
          hint={`Margem ${fmtPct(dre.margemLiquida)}`}
        />
        <KpiCard
          label="Meta Mensal"
          value={fmtPct(metaAtingida)}
          icon={<Target className="h-5 w-5" />}
          color="#F59E0B"
          hint={`Meta: ${fmtBRL(META_MENSAL)}`}
        />
        <KpiCard
          label="Ponto de Equilíbrio"
          value={fmtBRL(pontoEquilibrio)}
          icon={<PiggyBank className="h-5 w-5" />}
          color="#6B2FD6"
          hint={dre.receitaBruta >= pontoEquilibrio ? "Equilíbrio atingido" : "Abaixo do equilíbrio"}
        />
        <KpiCard
          label="Saldo Projetado"
          value={fmtBRL(saldoProjetado)}
          icon={<BarChart3 className="h-5 w-5" />}
          color={saldoProjetado >= 0 ? "#215797" : "#EF4444"}
          trend={saldoProjetado >= 0 ? "up" : "down"}
          hint="Projeção anual"
        />
      </div>

      {/* Row 2 - Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="card-artec-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1F2937]">Faturamento Mensal</h3>
            <span className="text-xs text-[#9CA3AF]">{ano === "todos" ? anoAtual : ano}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipContent />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="Receita" fill="#215797" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="card-artec-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#1F2937]">Fluxo de Caixa Acumulado</h3>
            <span className="text-xs text-[#9CA3AF]">Saldo progressivo</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosAcumulados}>
                <defs>
                  <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#215797" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#215797" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="Saldo"
                  stroke="#215797"
                  strokeWidth={2}
                  fill="url(#saldoGradient)"
                  dot={{ fill: "#215797", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "#215797" }}
                />
                <Line
                  type="monotone"
                  dataKey="Receita"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="Despesas"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Bottom Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profitability */}
        <div className="card-artec-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="kpi-icon-wrapper" style={{ background: "#10B98115" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937]">Rentabilidade</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#4B5563]">Margem Líquida</span>
                <span className="font-semibold text-[#1F2937]">{fmtPct(dre.margemLiquida)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, dre.margemLiquida * 2)}%`, background: "#10B981" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#4B5563]">Lucro Bruto</span>
                <span className="font-semibold text-[#1F2937]">{fmtBRL(dre.lucroBruto)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${dre.receitaBruta > 0 ? Math.min(100, (dre.lucroBruto / dre.receitaBruta) * 100) : 0}%`,
                    background: "#215797",
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-[#4B5563]">Resultado Operacional</span>
              <span className={`font-semibold ${dre.resultadoOperacional >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {fmtBRL(dre.resultadoOperacional)}
              </span>
            </div>
          </div>
        </div>

        {/* Productivity */}
        <div className="card-artec-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="kpi-icon-wrapper" style={{ background: "#6B2FD615" }}>
              <BarChart3 className="h-4 w-4" style={{ color: "#6B2FD6" }} />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937]">Produtividade</h3>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-[#6B2FD6]/5 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-[#6B2FD6]">{tecnicos.filter((t) => t.ativo).length}</div>
              <div className="text-[10px] text-[#9CA3AF]">Técnicos Ativos</div>
            </div>
            <div className="flex-1 bg-[#215797]/5 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-[#215797]">{servicos.filter((s) => s.status === "concluido").length}</div>
              <div className="text-[10px] text-[#9CA3AF]">Serviços Realizados</div>
            </div>
            <div className="flex-1 bg-[#F59E0B]/5 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-[#F59E0B]">{servicos.filter((s) => s.status === "em_andamento").length}</div>
              <div className="text-[10px] text-[#9CA3AF]">Em Andamento</div>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={despesasCat.length > 0 ? despesasCat : [{ name: "Sem dados", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                  innerRadius={38}
                >
                  {despesasCat.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {despesasCat.slice(0, 3).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="truncate max-w-[80px]">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card-artec-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="kpi-icon-wrapper" style={{ background: "#F59E0B15" }}>
              <AlertTriangle className="h-4 w-4" style={{ color: "#F59E0B" }} />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937]">Alertas</h3>
          </div>
          <div className="space-y-2">
            {alertas.map((alerta, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  alerta.type === "success" ? "bg-emerald-50 border border-emerald-100" :
                  alerta.type === "warning" ? "bg-amber-50 border border-amber-100" :
                  "bg-red-50 border border-red-100"
                }`}
              >
                <span className={`status-dot mt-1 shrink-0 ${
                  alerta.type === "success" ? "status-dot-success" :
                  alerta.type === "warning" ? "status-dot-warning" :
                  "status-dot-critical"
                }`} />
                <div className="min-w-0">
                  <div className={`text-xs font-medium ${
                    alerta.type === "success" ? "text-emerald-700" :
                    alerta.type === "warning" ? "text-amber-700" :
                    "text-red-700"
                  }`}>
                    {alerta.label}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${
                    alerta.type === "success" ? "text-emerald-500" :
                    alerta.type === "warning" ? "text-amber-500" :
                    "text-red-500"
                  }`}>
                    {alerta.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
