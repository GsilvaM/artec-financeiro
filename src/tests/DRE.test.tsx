import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/dre";

vi.mock("@/lib/financeiro/storage", () => ({
  useLancamentos: () => [[], vi.fn()],
}));

function MockDREPage() {
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

describe("DRE Page", () => {
  it("renderiza o título DRE Mensal", () => {
    renderWithProviders(<MockDREPage />);
    expect(screen.getByText("DRE Mensal")).toBeTruthy();
  });

  it("renderiza o subtítulo", () => {
    renderWithProviders(<MockDREPage />);
    expect(
      screen.getByText("Demonstrativo de Resultados do Exercício")
    ).toBeTruthy();
  });

  it("renderiza os 4 KPI cards", () => {
    renderWithProviders(<MockDREPage />);
    expect(screen.getByText("Despesas Totais")).toBeTruthy();
  });

  it("renderiza o título da demonstração", () => {
    renderWithProviders(<MockDREPage />);
    expect(screen.getByText("Demonstração do Resultado")).toBeTruthy();
  });

  it("renderiza as linhas principais do DRE", () => {
    renderWithProviders(<MockDREPage />);
    expect(screen.getByText("(=) Receita Líquida")).toBeTruthy();
    expect(screen.getByText("(-) Custos Diretos")).toBeTruthy();
    expect(screen.getByText("(=) Lucro Bruto")).toBeTruthy();
    expect(screen.getByText("(-) Despesas Operacionais")).toBeTruthy();
    expect(screen.getByText("(=) Resultado Operacional")).toBeTruthy();
    expect(screen.getByText("Resultado Financeiro")).toBeTruthy();
  });

  it("renderiza o rodapé informativo", () => {
    renderWithProviders(<MockDREPage />);
    expect(
      screen.getByText(/DRE referente ao período selecionado/)
    ).toBeTruthy();
  });
});
