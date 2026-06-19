import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "@/routes/configuracoes";

vi.mock("@/lib/financeiro/storage", () => ({
  useCategorias: () => [{
    receitas: ["Vendas", "Serviços"],
    custos: ["Insumos"],
    despesas: ["Aluguel", "Marketing", "Internet"],
    deducoes: [],
    receitas_financeiras: ["Juros"],
    despesas_financeiras: ["Taxas"],
  }, vi.fn()],
  exportarBackup: vi.fn(),
  importarBackup: vi.fn(),
}));

function MockConfigPage() {
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

describe("Configurações Page", () => {
  it("renderiza o título Configurações", () => {
    renderWithProviders(<MockConfigPage />);
    expect(screen.getByText("Configurações")).toBeTruthy();
  });

  it("renderiza o subtítulo", () => {
    renderWithProviders(<MockConfigPage />);
    expect(
      screen.getByText("Gerencie categorias e faça backup dos dados")
    ).toBeTruthy();
  });

  it("renderiza os botões de Exportar e Importar", () => {
    renderWithProviders(<MockConfigPage />);
    expect(screen.getByText("Exportar")).toBeTruthy();
    expect(screen.getByText("Importar")).toBeTruthy();
  });

  it("renderiza o título da seção de categorias", () => {
    renderWithProviders(<MockConfigPage />);
    expect(screen.getByText("Categorias")).toBeTruthy();
  });

  it("renderiza as abas de categorias", () => {
    renderWithProviders(<MockConfigPage />);
    expect(screen.getByText("Receitas")).toBeTruthy();
    expect(screen.getByText("Custos Diretos")).toBeTruthy();
    expect(screen.getByText("Despesas Operacionais")).toBeTruthy();
    expect(screen.getByText("Deduções")).toBeTruthy();
    expect(screen.getByText("Receitas Financeiras")).toBeTruthy();
    expect(screen.getByText("Despesas Financeiras")).toBeTruthy();
  });

  it("renderiza categorias existentes na aba Receitas", () => {
    renderWithProviders(<MockConfigPage />);
    expect(screen.getByText("Vendas")).toBeTruthy();
    expect(screen.getByText("Serviços")).toBeTruthy();
  });

  it("renderiza os campos para adicionar nova categoria", () => {
    renderWithProviders(<MockConfigPage />);
    expect(
      screen.getByPlaceholderText("Nova categoria")
    ).toBeTruthy();
    expect(screen.getByText("Adicionar")).toBeTruthy();
  });

  it("renderiza botões de exclusão nas categorias", () => {
    renderWithProviders(<MockConfigPage />);
    const deleteButtons = document.querySelectorAll(".lucide-trash-2");
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
