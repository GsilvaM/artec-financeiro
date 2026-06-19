import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode, ComponentType } from "react";

// Mock auth for pages that use useAuth (admin, login)
vi.mock("@/lib/auth/auth", () => ({
  useAuth: () => ({
    user: { username: "admin", name: "Test", role: "admin" },
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    updateUser: vi.fn(),
    changePassword: vi.fn().mockResolvedValue(true),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Mock router hooks used by some pages (login uses useRouter)
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useRouter: () => ({ navigate: vi.fn() }),
    useLocation: () => ({ pathname: "/" }),
  };
});

import { Route as IndexRoute } from "@/routes/index";
import { Route as LancamentosRoute } from "@/routes/lancamentos";
import { Route as FluxoCaixaRoute } from "@/routes/fluxo-caixa";
import { Route as DreRoute } from "@/routes/dre";
import { Route as RelatoriosRoute } from "@/routes/relatorios";
import { Route as PontoEquilibrioRoute } from "@/routes/ponto-equilibrio";
import { Route as TecnicosRoute } from "@/routes/tecnicos";
import { Route as ProdutividadeRoute } from "@/routes/produtividade";
import { Route as RentabilidadeRoute } from "@/routes/rentabilidade";
import { Route as ServicosRoute } from "@/routes/servicos";
import { Route as ConfiguracoesRoute } from "@/routes/configuracoes";
import { Route as CentrosCustoRoute } from "@/routes/centros-custo";
import { Route as ColaboradoresRoute } from "@/routes/colaboradores";
import { Route as ServicosCadastroRoute } from "@/routes/servicos-cadastro";
import { Route as RelatoriosOperacionaisRoute } from "@/routes/relatorios-operacionais";
import { Route as RelatoriosCentrosCustoRoute } from "@/routes/relatorios-centros-custo";
import { Route as MetasRoute } from "@/routes/metas";
import { Route as UsuariosRoute } from "@/routes/usuarios";
import { Route as PermissoesRoute } from "@/routes/permissoes";
import { Route as DashboardProprietarioRoute } from "@/routes/dashboard-proprietario";
import { Route as AdminRoute } from "@/routes/admin";
import { Route as LoginRoute } from "@/routes/login";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: 0 } },
});

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function renderPage(Component: ComponentType) {
  return render(<Component />, { wrapper: Wrapper });
}

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

interface PageEntry {
  title: string;
  route: { options: { component: ComponentType } };
}

describe("Todas as páginas do navbar", () => {
  const pages: PageEntry[] = [
    { title: "Dashboard", route: IndexRoute },
    { title: "Lançamentos", route: LancamentosRoute },
    { title: "Fluxo de Caixa", route: FluxoCaixaRoute },
    { title: "DRE", route: DreRoute },
    { title: "Relatórios", route: RelatoriosRoute },
    { title: "Ponto de Equilíbrio", route: PontoEquilibrioRoute },
    { title: "Técnicos", route: TecnicosRoute },
    { title: "Produtividade", route: ProdutividadeRoute },
    { title: "Rentabilidade", route: RentabilidadeRoute },
    { title: "Serviços", route: ServicosRoute },
    { title: "Configurações", route: ConfiguracoesRoute },
    { title: "Centros de Custo", route: CentrosCustoRoute },
    { title: "Colaboradores", route: ColaboradoresRoute },
    { title: "Cadastro de Serviços", route: ServicosCadastroRoute },
    { title: "Relatórios Operacionais", route: RelatoriosOperacionaisRoute },
    { title: "Relatórios por Centro de Custo", route: RelatoriosCentrosCustoRoute },
    { title: "Metas", route: MetasRoute },
    { title: "Usuários", route: UsuariosRoute },
    { title: "Permissões", route: PermissoesRoute },
    { title: "Dashboard do Proprietário", route: DashboardProprietarioRoute },
    { title: "Administração", route: AdminRoute },
    { title: "Login", route: LoginRoute },
  ];

  for (const { title, route } of pages) {
    it(`renderiza a página "${title}" sem erro`, () => {
      const Component = route.options.component;
      expect(Component).toBeDefined();
      expect(() => renderPage(Component)).not.toThrow();
    });
  }
});
