import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  Wallet,
  BarChart3,
  Award,
  Star,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Crown,
} from "lucide-react";
import { useLancamentos, useCategorias } from "@/lib/financeiro/storage";
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

export const Route = createFileRoute("/dashboard-proprietario")({
  head: () => ({
    meta: [
      { title: "Dashboard do Proprietário — Artec Financeiro" },
    ],
  }),
  component: DashboardProprietario,
});

const META_MENSAL = 85000;

function IndicadorCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-2">
        <div className="kpi-icon-wrapper" style={{ background: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-label mt-0.5">{label}</div>
      {subtitle && <div className="text-[11px] text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function AlertaCard({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "success" | "warning" | "critical";
}) {
  const colors = {
    success: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      value: "text-emerald-500",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      value: "text-amber-500",
      icon: AlertTriangle,
    },
    critical: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      value: "text-red-500",
      icon: AlertTriangle,
    },
  };
  const c = colors[type];
  const Icon = c.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${c.text}`} />
      <div>
        <div className={`text-sm font-medium ${c.text}`}>{label}</div>
        <div className={`text-xs mt-0.5 ${c.value}`}>{value}</div>
      </div>
    </div>
  );
}

function DashboardProprietario() {
  const [lancs] = useLancamentos();
  const [categorias] = useCategorias();
  const anos = anosDisponiveis(lancs);
  const now = new Date();
  const [ano, setAno] = useState<number | "todos">(anos[0] ?? now.getFullYear());
  const [mes, setMes] = useState<number | "todos">(now.getMonth() + 1);

  const filtrados = useMemo(() => filtrarPorPeriodo(lancs, ano, mes), [lancs, ano, mes]);
  const dre = useMemo(() => calcularDRE(filtrados), [filtrados]);

  const anoAtual = now.getFullYear();

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
        Margem: d.margemLiquida,
      };
    });
  }, [lancs, ano, anoAtual]);

  const custosFixos = dre.despesasOp + dre.despesasFin;
  const margemContribuicao = dre.receitaBruta - dre.custosDir;
  const pontoEquilibrio = margemContribuicao > 0
    ? (custosFixos / margemContribuicao) * dre.receitaBruta
    : 0;

  const metaAtingida = dre.receitaBruta > 0
    ? Math.min(100, (dre.receitaBruta / META_MENSAL) * 100)
    : 0;

  const mesesComDados = dadosMensais.filter((m) => m.Receita > 0).length;
  const receitaMediaMensal = mesesComDados > 0 ? dre.receitaBruta / mesesComDados : 0;
  const saldoProjetado = receitaMediaMensal * 12 - (dre.custosDir + custosFixos) * 12;

  const totalEntradas = filtrados
    .filter((l) => l.tipo === "receita" || l.tipo === "receita_financeira")
    .reduce((s, l) => s + l.valor, 0);

  const totalSaidas = filtrados
    .filter((l) => l.tipo === "custo_direto" || l.tipo === "despesa_operacional" || l.tipo === "despesa_financeira")
    .reduce((s, l) => s + l.valor, 0);

  const caixaAtual = totalEntradas - totalSaidas;

  const catNames = [
    ...categorias.receitas,
    ...categorias.custos,
    ...categorias.despesas,
    ...categorias.receitas_financeiras,
    ...categorias.despesas_financeiras,
  ];

  const faturamentoPorCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    filtrados
      .filter((l) => l.tipo === "receita" || l.tipo === "receita_financeira")
      .forEach((l) => {
        map[l.categoria] = (map[l.categoria] || 0) + l.valor;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtrados]);

  const servicoMaisLucrativo = faturamentoPorCategoria[0] ?? ["N/A", 0];
  const centroCustoMaisRentavel = useMemo(() => {
    const map: Record<string, { receita: number; despesa: number }> = {};
    filtrados.forEach((l) => {
      if (!map[l.categoria]) map[l.categoria] = { receita: 0, despesa: 0 };
      if (l.tipo === "receita" || l.tipo === "receita_financeira") {
        map[l.categoria].receita += l.valor;
      } else {
        map[l.categoria].despesa += l.valor;
      }
    });
    const entries = Object.entries(map)
      .map(([cat, v]) => ({ cat, margem: v.receita - v.despesa }))
      .sort((a, b) => b.margem - a.margem);
    return entries[0] ?? { cat: "N/A", margem: 0 };
  }, [filtrados]);

  const despesasTotal = dre.custosDir + dre.despesasOp + dre.despesasFin;
  const ultimosMeses = dadosMensais.slice(-3);
  const receitaCresceu = ultimosMeses.length >= 2 &&
    ultimosMeses[ultimosMeses.length - 1].Receita > ultimosMeses[0].Receita;

  const alertas = useMemo(() => {
    const items: { label: string; value: string; type: "success" | "warning" | "critical" }[] = [];

    if (dre.receitaBruta < META_MENSAL * 0.5) {
      items.push({ label: "Faturamento muito abaixo da meta", value: `Apenas ${fmtPct(metaAtingida)} da meta`, type: "critical" });
    } else if (dre.receitaBruta < META_MENSAL) {
      items.push({ label: "Faturamento abaixo da meta", value: `${fmtPct(metaAtingida)} da meta atingida`, type: "warning" });
    } else {
      items.push({ label: "Meta do mês atingida com sucesso", value: `${fmtPct(metaAtingida)} de cumprimento`, type: "success" });
    }

    if (dre.receitaBruta > 0 && pontoEquilibrio > dre.receitaBruta) {
      items.push({ label: "Faturamento abaixo do ponto de equilíbrio", value: `PE: ${fmtBRL(pontoEquilibrio)}`, type: "critical" });
    } else if (dre.receitaBruta > 0) {
      items.push({ label: "Operando acima do ponto de equilíbrio", value: `PE: ${fmtBRL(pontoEquilibrio)}`, type: "success" });
    }

    if (saldoProjetado < 0) {
      items.push({ label: "Caixa projetado negativo para o ano", value: fmtBRL(saldoProjetado), type: "critical" });
    } else {
      items.push({ label: "Caixa projetado positivo para o ano", value: fmtBRL(saldoProjetado), type: "success" });
    }

    if (dre.receitaBruta > 0 && despesasTotal / dre.receitaBruta > 0.9) {
      items.push({ label: "Despesas críticas", value: `${fmtPct((despesasTotal / dre.receitaBruta) * 100)} da receita`, type: "critical" });
    } else if (dre.receitaBruta > 0 && despesasTotal / dre.receitaBruta > 0.7) {
      items.push({ label: "Despesas elevadas", value: `${fmtPct((despesasTotal / dre.receitaBruta) * 100)} da receita`, type: "warning" });
    }

    if (centroCustoMaisRentavel.cat !== "N/A" && centroCustoMaisRentavel.margem < 0) {
      items.push({ label: "Centro de custo com baixa rentabilidade", value: centroCustoMaisRentavel.cat, type: "warning" });
    }

    if (!receitaCresceu && ultimosMeses.length >= 2) {
      items.push({ label: "Queda de faturamento nos últimos meses", value: "Comparativo mensal negativo", type: "warning" });
    }

    return items;
  }, [dre, metaAtingida, pontoEquilibrio, saldoProjetado, despesasTotal, centroCustoMaisRentavel, receitaCresceu, ultimosMeses.length]);

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
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Dashboard do Proprietário</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Visão executiva completa do negócio</p>
        </div>
        <div className="flex-1" />
        <PeriodoFiltro ano={ano} mes={mes} anos={anos} onAno={setAno} onMes={setMes} incluirTodos={false} />
      </div>

      {/* Row 1 - Key Indicators */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <IndicadorCard
          label="Receita do Mês"
          value={fmtBRL(dre.receitaBruta)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#215797"
          subtitle="Faturamento bruto"
        />
        <IndicadorCard
          label="Lucro Líquido"
          value={fmtBRL(dre.lucroLiquido)}
          icon={<DollarSign className="h-5 w-5" />}
          color="#10B981"
          subtitle={`Margem ${fmtPct(dre.margemLiquida)}`}
        />
        <IndicadorCard
          label="Margem Líquida"
          value={fmtPct(dre.margemLiquida)}
          icon={<Target className="h-5 w-5" />}
          color="#6B2FD6"
          subtitle="Rentabilidade do período"
        />
        <IndicadorCard
          label="Meta Atingida"
          value={fmtPct(metaAtingida)}
          icon={<Award className="h-5 w-5" />}
          color="#F59E0B"
          subtitle={`Meta: ${fmtBRL(META_MENSAL)}`}
        />
        <IndicadorCard
          label="Ponto de Equilíbrio"
          value={fmtBRL(pontoEquilibrio)}
          icon={<PiggyBank className="h-5 w-5" />}
          color={dre.receitaBruta >= pontoEquilibrio ? "#10B981" : "#EF4444"}
          subtitle={dre.receitaBruta >= pontoEquilibrio ? "Equilíbrio superado" : "Abaixo do equilíbrio"}
        />
      </div>

      {/* Row 2 - More Indicators */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <IndicadorCard
          label="Caixa Atual"
          value={fmtBRL(caixaAtual)}
          icon={<Wallet className="h-5 w-5" />}
          color={caixaAtual >= 0 ? "#215797" : "#EF4444"}
          subtitle="Saldo do período"
        />
        <IndicadorCard
          label="Caixa Projetado"
          value={fmtBRL(saldoProjetado)}
          icon={<BarChart3 className="h-5 w-5" />}
          color={saldoProjetado >= 0 ? "#215797" : "#EF4444"}
          subtitle="Projeção anual"
        />
        <IndicadorCard
          label="Melhor Técnico"
          value="—"
          icon={<Users className="h-5 w-5" />}
          color="#6B2FD6"
          subtitle="Ranking de performance"
        />
        <IndicadorCard
          label="Serviço + Lucrativo"
          value={servicoMaisLucrativo[0] as string}
          icon={<Star className="h-5 w-5" />}
          color="#F59E0B"
          subtitle={typeof servicoMaisLucrativo[1] === "number" ? fmtBRL(servicoMaisLucrativo[1]) : "N/A"}
        />
        <IndicadorCard
          label="CC Mais Rentável"
          value={centroCustoMaisRentavel.cat}
          icon={<Building2 className="h-5 w-5" />}
          color="#10B981"
          subtitle={fmtBRL(centroCustoMaisRentavel.margem)}
        />
      </div>

      {/* Row 3 - Chart */}
      <div className="card-artec-static p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#1F2937]">Evolução Mensal</h3>
          <span className="text-xs text-[#9CA3AF]">Receita vs Lucro</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosMensais} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="Receita" fill="#215797" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Line
                type="monotone"
                dataKey="Lucro"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#10B981" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 - Alerts */}
      <div>
        <h3 className="section-title flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
          Alertas Inteligentes
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alertas.map((alerta, idx) => (
            <AlertaCard key={idx} {...alerta} />
          ))}
        </div>
      </div>
    </div>
  );
}
