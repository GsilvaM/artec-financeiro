import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/index";

vi.mock("@/lib/financeiro/storage", () => ({
  useLancamentos: () => [[], vi.fn()],
}));

function MockDashboardPage() {
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

describe("Dashboard Page", () => {
  it("renderiza o título Dashboard", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renderiza o subtítulo", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Indicadores financeiros consolidados")).toBeTruthy();
  });

  it("renderiza os 5 KPI cards principais", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Receita")).toBeTruthy();
    expect(screen.getByText("Lucro Líquido")).toBeTruthy();
    expect(screen.getByText("Meta Mensal")).toBeTruthy();
    expect(screen.getByText("Ponto de Equilíbrio")).toBeTruthy();
    expect(screen.getByText("Saldo Projetado")).toBeTruthy();
  });

  it("renderiza o período do filtro de faturamento", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Faturamento Mensal")).toBeTruthy();
  });

  it("renderiza o título do fluxo de caixa", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Fluxo de Caixa Acumulado")).toBeTruthy();
  });

  it("renderiza a seção de Rentabilidade", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Rentabilidade")).toBeTruthy();
  });

  it("renderiza a seção de Produtividade", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Produtividade")).toBeTruthy();
  });

  it("renderiza a seção de Alertas", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Alertas")).toBeTruthy();
  });

  it("renderiza o rótulo Margem Líquida", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Margem Líquida")).toBeTruthy();
  });

  it("renderiza o rótulo Resultado Operacional", () => {
    renderWithProviders(<MockDashboardPage />);
    expect(screen.getByText("Resultado Operacional")).toBeTruthy();
  });
});
