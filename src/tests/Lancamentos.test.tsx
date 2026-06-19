import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/lancamentos";

vi.mock("@/lib/financeiro/storage", () => ({
  useLancamentos: () => [[], vi.fn()],
  useCategorias: () => [{
    receitas: ["Vendas", "Serviços"],
    custos: ["Insumos", "Mão de obra"],
    despesas: ["Aluguel", "Marketing"],
    deducoes: [],
    receitas_financeiras: ["Juros"],
    despesas_financeiras: ["Taxas"],
  }, vi.fn()],
}));

function MockLancamentosPage() {
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

describe("Lançamentos Page", () => {
  it("renderiza o título Lançamentos", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(screen.getByText("Lançamentos")).toBeTruthy();
  });

  it("renderiza o subtítulo", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(
      screen.getByText("Cadastre receitas, custos e despesas")
    ).toBeTruthy();
  });

  it("renderiza o botão Novo Lançamento", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(screen.getByText("Novo Lançamento")).toBeTruthy();
  });

  it("renderiza os cards de sumário", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(screen.getByText("Total Lançamentos")).toBeTruthy();
    expect(screen.getByText("Receitas")).toBeTruthy();
    expect(screen.getByText("Despesas")).toBeTruthy();
    expect(screen.getByText("Saldo")).toBeTruthy();
  });

  it("renderiza o campo de pesquisa", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(
      screen.getByPlaceholderText("Pesquisar lançamentos...")
    ).toBeTruthy();
  });

  it("renderiza a mensagem de lista vazia", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(screen.getByText("Nenhum lançamento encontrado.")).toBeTruthy();
  });

  it("renderiza os cabeçalhos da tabela", () => {
    renderWithProviders(<MockLancamentosPage />);
    expect(screen.getByText("Descrição")).toBeTruthy();
    expect(screen.getByText("Valor")).toBeTruthy();
  });
});
