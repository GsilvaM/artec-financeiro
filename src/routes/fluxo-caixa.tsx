import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { calcularDRE, fmtBRL, MESES } from "@/lib/financeiro/calc";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/fluxo-caixa")({
  head: () => ({ meta: [{ title: "Fluxo de Caixa — Artec Financeiro" }] }),
  component: FluxoCaixaPage,
});

function FluxoCaixaPage() {
  const [lancs] = useLancamentos();
  const dre = useMemo(() => calcularDRE(lancs), [lancs]);

  const saldoOperacional = dre.receitaBruta - dre.custosDir - dre.despesasOp;
  const saldoPeriodo = dre.lucroLiquido;

  const [anoAtual, setAnoAtual] = useState(2026);
  useEffect(() => { setAnoAtual(new Date().getFullYear()); }, []);

  const dadosMensais = useMemo(() => {
    return MESES.map((nome, i) => {
      const sub = lancs.filter((l) => {
        const d = new Date(l.data + "T00:00:00");
        return d.getFullYear() === anoAtual && d.getMonth() === i;
      });
      const d = calcularDRE(sub);
      return {
        mes: nome.slice(0, 3),
        Entradas: d.receitaBruta + d.receitasFin,
        Saidas: d.custosDir + d.despesasOp + d.despesasFin,
        Saldo: d.lucroLiquido,
      };
    });
  }, [lancs, anoAtual]);

  function TooltipContent({ active, payload, label }: any) {
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
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Fluxo de Caixa</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Movimentação financeira do período</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#10B98115" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#10B981" }}>{fmtBRL(saldoOperacional)}</div>
          <div className="kpi-label">Saldo Operacional</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#21579715" }}>
              <DollarSign className="h-4 w-4" style={{ color: "#215797" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: dre.receitaBruta >= 0 ? "#215797" : "#EF4444" }}>{fmtBRL(dre.receitaBruta + dre.receitasFin)}</div>
          <div className="kpi-label">Entradas</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#EF444415" }}>
              <TrendingDown className="h-4 w-4" style={{ color: "#EF4444" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#EF4444" }}>{fmtBRL(Math.abs(dre.custosDir + dre.despesasOp + dre.despesasFin))}</div>
          <div className="kpi-label">Saídas</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#6B2FD615" }}>
              <BarChart3 className="h-4 w-4" style={{ color: "#6B2FD6" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: saldoPeriodo >= 0 ? "#10B981" : "#EF4444" }}>{fmtBRL(saldoPeriodo)}</div>
          <div className="kpi-label">Saldo do Período</div>
        </div>
      </div>

      <div className="card-artec-static p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#1F2937]">Fluxo de Caixa Mensal</h3>
          <span className="text-xs text-[#9CA3AF]">Entradas vs Saídas</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosMensais} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} tick={{ fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="Entradas" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Saidas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
