import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route as TecnicosRoute } from "@/routes/tecnicos";
import { Route as ServicosRoute } from "@/routes/servicos";
import { Route as ColaboradoresRoute } from "@/routes/colaboradores";
import { Route as ServicosCadastroRoute } from "@/routes/servicos-cadastro";
import { Route as MetasRoute } from "@/routes/metas";
import { Route as UsuariosRoute } from "@/routes/usuarios";
import { Route as PermissoesRoute } from "@/routes/permissoes";

const mockTecnico = vi.hoisted(() => ({ id: "1", nome: "João Silva", especialidade: "Elétrica", telefone: "11999999999", email: "joao@teste.com", ativo: true, criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockServico = vi.hoisted(() => ({ id: "1", cliente: "Empresa ABC", tecnico: "João Silva", descricao: "Instalação elétrica", data: "2024-06-01", valor: 1500, status: "concluido", criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockColaborador = vi.hoisted(() => ({ id: "1", nome: "Maria Souza", cargo: "Analista", departamento: "Financeiro", telefone: "11988888888", email: "maria@teste.com", ativo: true, criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockServicoCadastro = vi.hoisted(() => ({ id: "1", nome: "Instalação Elétrica", descricao: "Instalação completa", valor: 2500, categoria: "Elétrica", ativo: true, criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockMeta = vi.hoisted(() => ({ id: "1", descricao: "Faturamento mensal", valorMeta: 50000, valorAtual: 35000, periodo: "2024-06", tipo: "mensal" as const, criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockUsuario = vi.hoisted(() => ({ id: "1", nome: "Admin", username: "admin", role: "admin" as const, ativo: true, criadoEm: "2024-01-01T00:00:00.000Z" }));
const mockPermissao = vi.hoisted(() => ({ id: "1", role: "admin", recurso: "lancamentos", leitura: true, escrita: true, criadoEm: "2024-01-01T00:00:00.000Z" }));

vi.mock("@/lib/financeiro/crud-storage", async () => {
  const actual = await vi.importActual("@/lib/financeiro/crud-storage");
  return {
    ...actual,
    useTecnicos: () => ({ items: [mockTecnico], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ nome: "", especialidade: "", telefone: "", email: "", ativo: true }) }),
    useServicos: () => ({ items: [mockServico], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ cliente: "", tecnico: "", descricao: "", data: "2024-06-19", valor: 0, status: "agendado" }) }),
    useColaboradores: () => ({ items: [mockColaborador], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ nome: "", cargo: "", departamento: "", telefone: "", email: "", ativo: true }) }),
    useServicosCadastro: () => ({ items: [mockServicoCadastro], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ nome: "", descricao: "", valor: 0, categoria: "", ativo: true }) }),
    useMetas: () => ({ items: [mockMeta], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ descricao: "", valorMeta: 0, valorAtual: 0, periodo: "2024-06", tipo: "mensal" }) }),
    useUsuarios: () => ({ items: [mockUsuario], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ nome: "", username: "", role: "user", ativo: true }) }),
    usePermissoes: () => ({ items: [mockPermissao], adicionar: vi.fn(), atualizar: vi.fn(), remover: vi.fn(), getById: vi.fn(), emptyForm: () => ({ role: "user", recurso: "", leitura: true, escrita: false }) }),
    SERVICO_STATUS_LABEL: actual.SERVICO_STATUS_LABEL,
  };
});

function renderPage(Component: React.ComponentType) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={qc}><Component /></QueryClientProvider>);
}

describe("CRUD Páginas - Renderização com dados", () => {
  it("Técnicos: renderiza tabela com dados", () => {
    renderPage(TecnicosRoute.options.component!);
    expect(screen.getByText("Técnicos")).toBeTruthy();
    expect(screen.getByText("João Silva")).toBeTruthy();
    expect(screen.getByText("Elétrica")).toBeTruthy();
  });

  it("Serviços: renderiza tabela com dados", () => {
    renderPage(ServicosRoute.options.component!);
    expect(screen.getByText("Serviços")).toBeTruthy();
    expect(screen.getByText("Empresa ABC")).toBeTruthy();
    expect(screen.getByText("Concluído")).toBeTruthy();
  });

  it("Colaboradores: renderiza tabela com dados", () => {
    renderPage(ColaboradoresRoute.options.component!);
    expect(screen.getByText("Colaboradores")).toBeTruthy();
    expect(screen.getByText("Maria Souza")).toBeTruthy();
    expect(screen.getByText("Financeiro")).toBeTruthy();
  });

  it("Catálogo de Serviços: renderiza tabela com dados", () => {
    renderPage(ServicosCadastroRoute.options.component!);
    expect(screen.getByText("Catálogo de Serviços")).toBeTruthy();
    expect(screen.getByText("Instalação Elétrica")).toBeTruthy();
  });

  it("Metas: renderiza tabela com dados", () => {
    renderPage(MetasRoute.options.component!);
    expect(screen.getByText("Metas")).toBeTruthy();
    expect(screen.getByText("Faturamento mensal")).toBeTruthy();
  });

  it("Usuários: renderiza tabela com dados", () => {
    renderPage(UsuariosRoute.options.component!);
    expect(screen.getByText("Usuários")).toBeTruthy();
    expect(screen.getByText("@admin")).toBeTruthy();
  });

  it("Permissões: renderiza tabela com dados", () => {
    renderPage(PermissoesRoute.options.component!);
    expect(screen.getByText("Permissões")).toBeTruthy();
    expect(screen.getByText("lancamentos")).toBeTruthy();
  });
});

describe("CRUD Páginas - Modal de cadastro", () => {
  it("Técnicos: botão Novo Técnico abre modal", () => {
    renderPage(TecnicosRoute.options.component!);
    fireEvent.click(screen.getByText("Novo Técnico"));
    expect(screen.getByText("Novo técnico")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
    expect(screen.getByText("Salvar")).toBeTruthy();
  });

  it("Técnicos: fechar modal com Cancelar", () => {
    renderPage(TecnicosRoute.options.component!);
    fireEvent.click(screen.getByText("Novo Técnico"));
    expect(screen.getByText("Novo técnico")).toBeTruthy();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Novo técnico")).toBeNull();
  });

  it("Serviços: botão Novo Serviço abre modal", () => {
    renderPage(ServicosRoute.options.component!);
    fireEvent.click(screen.getByText("Novo Serviço"));
    expect(screen.getByText("Novo serviço")).toBeTruthy();
  });

  it("Colaboradores: botão Novo Colaborador abre modal", () => {
    renderPage(ColaboradoresRoute.options.component!);
    fireEvent.click(screen.getByText("Novo Colaborador"));
    expect(screen.getByText("Novo colaborador")).toBeTruthy();
  });

  it("Metas: botão Nova Meta abre modal", () => {
    renderPage(MetasRoute.options.component!);
    fireEvent.click(screen.getByText("Nova Meta"));
    expect(screen.getByText("Nova meta")).toBeTruthy();
  });

  it("Usuários: botão Novo Usuário abre modal", () => {
    renderPage(UsuariosRoute.options.component!);
    fireEvent.click(screen.getByText("Novo Usuário"));
    expect(screen.getByText("Novo usuário")).toBeTruthy();
  });

  it("Permissões: botão Nova Permissão abre modal", () => {
    renderPage(PermissoesRoute.options.component!);
    fireEvent.click(screen.getByText("Nova Permissão"));
    expect(screen.getByText("Nova permissão")).toBeTruthy();
  });
});

describe("CRUD Páginas - KPI cards", () => {
  it("Técnicos: exibe indicadores", () => {
    renderPage(TecnicosRoute.options.component!);
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Ativos")).toBeTruthy();
    expect(screen.getByText("Inativos")).toBeTruthy();
  });
});

describe("CRUD Páginas - Pesquisa", () => {
  it("Técnicos: campo de pesquisa renderiza", () => {
    renderPage(TecnicosRoute.options.component!);
    const searchInput = document.querySelector("input[placeholder*='Pesquisar']");
    expect(searchInput).toBeTruthy();
  });
});
