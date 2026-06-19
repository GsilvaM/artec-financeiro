import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useLancamentos } from "@/lib/financeiro/storage";
import { calcularDRE, fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/fluxo-caixa")({
  head: () => ({ meta: [{ title: "Fluxo de Caixa — Artec Financeiro" }] }),
  component: FluxoCaixaPage,
});

function FluxoCaixaPage() {
  const [lancs] = useLancamentos();
  const dre = useMemo(() => calcularDRE(lancs), [lancs]);

  const saldoOperacional = dre.receitaBruta - dre.custosDir - dre.despesasOp;
  const saldoPeriodo = dre.lucroLiquido;

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
          <div className="kpi-value" style={{ color: dre.receitaBruta >= 0 ? "#215797" : "#EF4444" }}>{fmtBRL(dre.receitaBruta)}</div>
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

      <div className="card-artec-static p-6 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-[#9CA3AF] mb-3" />
        <p className="text-[#4B5563] font-medium">Gráfico detalhado em breve</p>
        <p className="text-sm text-[#9CA3AF] mt-1">O gráfico de fluxo de caixa mensal será exibido aqui</p>
      </div>
    </div>
  );
}
