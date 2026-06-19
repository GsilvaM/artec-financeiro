import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/dashboard-proprietario";

vi.mock("@/lib/financeiro/storage", () => ({
  useLancamentos: () => [[], vi.fn()],
  useCategorias: () => [{
    receitas: [],
    custos: [],
    despesas: [],
    deducoes: [],
    receitas_financeiras: [],
    despesas_financeiras: [],
  }, vi.fn()],
}));

vi.mock("@/lib/financeiro/crud-storage", () => ({
  useTecnicos: () => ({ items: [], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: vi.fn() }),
  useServicos: () => ({ items: [], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: vi.fn() }),
  useMetas: () => ({ items: [], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: vi.fn() }),
  SERVICO_STATUS_LABEL: { agendado: "Agendado", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" },
}));

function MockDashboardProprietario() {
  const Component = Route.options.component;
  return <Component />;
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("Dashboard do Proprietário", () => {
  it("renderiza o título da página", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Dashboard do Proprietário")).toBeTruthy();
  });

  it("renderiza o subtítulo executivo", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Visão executiva completa do negócio")).toBeTruthy();
  });

  it("renderiza os 10 indicadores da primeira linha", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Receita do Mês")).toBeTruthy();
    expect(screen.getByText("Lucro Líquido")).toBeTruthy();
    expect(screen.getByText("Margem Líquida")).toBeTruthy();
    expect(screen.getByText("Meta Atingida")).toBeTruthy();
    expect(screen.getByText("Ponto de Equilíbrio")).toBeTruthy();
  });

  it("renderiza os indicadores da segunda linha", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Caixa Atual")).toBeTruthy();
    expect(screen.getByText("Caixa Projetado")).toBeTruthy();
    expect(screen.getByText("Melhor Técnico")).toBeTruthy();
    expect(screen.getByText("Serviço + Lucrativo")).toBeTruthy();
    expect(screen.getByText("CC Mais Rentável")).toBeTruthy();
  });

  it("renderiza o gráfico de evolução mensal", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Evolução Mensal")).toBeTruthy();
  });

  it("renderiza a seção de Alertas Inteligentes", () => {
    renderWithProviders(<MockDashboardProprietario />);
    expect(screen.getByText("Alertas Inteligentes")).toBeTruthy();
  });

  it("renderiza o ícone de coroa (crown) no título", () => {
    renderWithProviders(<MockDashboardProprietario />);
    const crowns = document.querySelectorAll(".lucide-crown");
    expect(crowns.length).toBeGreaterThan(0);
  });
});
