import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/relatorios";

vi.mock("@/lib/financeiro/storage", () => ({
  useLancamentos: () => [[], vi.fn()],
  exportarCSV: vi.fn(),
}));

function MockRelatoriosPage() {
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

describe("Relatórios Page", () => {
  it("renderiza o título Relatórios", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(screen.getByText("Relatórios")).toBeTruthy();
  });

  it("renderiza o subtítulo", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(
      screen.getByText("Resumo do período e exportação de dados")
    ).toBeTruthy();
  });

  it("renderiza o botão Exportar CSV", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(screen.getByText("Exportar CSV")).toBeTruthy();
  });

  it("renderiza os 5 cards de resumo", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(screen.getByText("Total Recebido")).toBeTruthy();
    expect(screen.getByText("Total Pago")).toBeTruthy();
    expect(screen.getByText("Saldo do Período")).toBeTruthy();
    expect(screen.getByText("Qtd. Receitas")).toBeTruthy();
    expect(screen.getByText("Qtd. Despesas")).toBeTruthy();
  });

  it("renderiza o filtro de categorias", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(screen.getByText("Filtros")).toBeTruthy();
  });

  it("renderiza a mensagem de lista vazia", () => {
    renderWithProviders(<MockRelatoriosPage />);
    expect(screen.getByText("Nenhum lançamento no período.")).toBeTruthy();
  });
});
