import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ClipboardList, TrendingUp, Users, Clock, CheckCircle2, Wrench } from "lucide-react";
import { useTecnicos, useServicos, SERVICO_STATUS_LABEL } from "@/lib/financeiro/crud-storage";
import { fmtBRL } from "@/lib/financeiro/calc";

export const Route = createFileRoute("/produtividade")({
  head: () => ({ meta: [{ title: "Produtividade — Artec Financeiro" }] }),
  component: ProdutividadePage,
});

function ProdutividadePage() {
  const { items: tecnicos } = useTecnicos();
  const { items: servicos } = useServicos();

  const tecnicosAtivos = tecnicos.filter((t) => t.ativo).length;
  const servicosConcluidos = servicos.filter((s) => s.status === "concluido");
  const servicosAndamento = servicos.filter((s) => s.status === "em_andamento");
  const ticketMedio = servicosConcluidos.length > 0
    ? servicosConcluidos.reduce((s, sv) => s + sv.valor, 0) / servicosConcluidos.length
    : 0;

  const servicosPorTecnico = useMemo(() => {
    const map: Record<string, number> = {};
    servicosConcluidos.forEach((s) => {
      if (s.tecnico) map[s.tecnico] = (map[s.tecnico] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [servicosConcluidos]);

  const melhorTecnico = servicosPorTecnico[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#10B981]/10 text-[#10B981]">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Produtividade</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Indicadores de produtividade da equipe</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#21579715" }}>
              <ClipboardList className="h-4 w-4" style={{ color: "#215797" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#215797" }}>{servicosConcluidos.length}</div>
          <div className="kpi-label">Serviços Realizados</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#10B98115" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#10B981" }}>{fmtBRL(ticketMedio)}</div>
          <div className="kpi-label">Ticket Médio</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#6B2FD615" }}>
              <Users className="h-4 w-4" style={{ color: "#6B2FD6" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#6B2FD6" }}>{tecnicosAtivos}</div>
          <div className="kpi-label">Técnicos Ativos</div>
        </div>
        <div className="card-artec p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="kpi-icon-wrapper" style={{ background: "#F59E0B15" }}>
              <Wrench className="h-4 w-4" style={{ color: "#F59E0B" }} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "#F59E0B" }}>{servicosAndamento.length}</div>
          <div className="kpi-label">Em Andamento</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-artec-static p-5">
          <h3 className="text-base font-semibold text-[#1F2937] mb-4">Ranking de Técnicos</h3>
          {servicosPorTecnico.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#9CA3AF]">Nenhum serviço concluído ainda.</div>
          ) : (
            <div className="space-y-2">
              {servicosPorTecnico.map(([nome, qtd], idx) => (
                <div key={nome} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? "bg-[#F59E0B]" : idx === 1 ? "bg-[#9CA3AF]" : idx === 2 ? "bg-amber-700" : "bg-[#215797]"}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#1F2937] truncate">{nome}</div>
                    <div className="text-xs text-[#9CA3AF]">{qtd} serviço{qtd !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#215797]">{qtd}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-artec-static p-5">
          <h3 className="text-base font-semibold text-[#1F2937] mb-4">Resumo de Serviços</h3>
          <div className="space-y-3">
            {(["concluido", "em_andamento", "agendado", "cancelado"] as const).map((status) => {
              const qtd = servicos.filter((s) => s.status === status).length;
              const total = servicos.length || 1;
              const pct = Math.round((qtd / total) * 100);
              const cores: Record<string, string> = { concluido: "#10B981", em_andamento: "#215797", agendado: "#F59E0B", cancelado: "#EF4444" };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#4B5563]">{SERVICO_STATUS_LABEL[status]}</span>
                    <span className="font-semibold text-[#1F2937]">{qtd}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cores[status] }} />
                  </div>
                </div>
              );
            })}
          </div>
          {melhorTecnico && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-[#4B5563]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Melhor técnico: <span className="font-semibold text-[#1F2937]">{melhorTecnico[0]}</span> ({melhorTecnico[1]} serviços)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
