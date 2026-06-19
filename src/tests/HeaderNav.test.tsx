import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { HeaderNav } from "@/components/financeiro/HeaderNav";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className}>{children}</a>
  ),
  useRouterState: (opts?: { select?: (s: any) => any }) => {
    const state = { location: { pathname: "/" } };
    return opts?.select ? opts.select(state) : state;
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  useAuth: () => ({
    user: { username: "admin", name: "Fred", role: "admin" },
    logout: vi.fn(),
  }),
}));

describe("HeaderNav", () => {
  it("renderiza o logo da Artec", () => {
    render(<HeaderNav />);
    const imagens = document.querySelectorAll("img");
    const logo = Array.from(imagens).find((img) => img.alt === "Artec");
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute("src")).toBe("/logo_artec.png");
  });

  it("renderiza o nome 'Artec'", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Artec")).toBeTruthy();
  });

  it("renderiza 'Financeiro' como subtítulo", () => {
    render(<HeaderNav />);
    expect(screen.getAllByText("Financeiro").length).toBeGreaterThan(0);
  });

  it("renderiza o nome do usuário 'Fred'", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Fred")).toBeTruthy();
  });

  it("renderiza o botão de notificações", () => {
    render(<HeaderNav />);
    const botoes = document.querySelectorAll("button");
    const notifBtn = Array.from(botoes).find(
      (btn) => btn.querySelector(".lucide-bell, .lucide-bell-ring")
    );
    expect(notifBtn).toBeTruthy();
  });

  it("renderiza o botão de logout", () => {
    render(<HeaderNav />);
    const botoes = document.querySelectorAll("button");
    const logoutBtn = Array.from(botoes).find(
      (btn) => btn.querySelector(".lucide-log-out")
    );
    expect(logoutBtn).toBeTruthy();
  });

  it("renderiza o botão de menu mobile", () => {
    render(<HeaderNav />);
    const botoes = document.querySelectorAll("button");
    const menuBtn = Array.from(botoes).find(
      (btn) => btn.querySelector(".lucide-menu")
    );
    expect(menuBtn).toBeTruthy();
  });

  it("renderiza o link do Dashboard", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renderiza o link Financeiro", () => {
    render(<HeaderNav />);
    expect(screen.getAllByText("Financeiro").length).toBeGreaterThan(0);
  });

  it("renderiza o link Operacional", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Operacional")).toBeTruthy();
  });

  it("renderiza o link Cadastros", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Cadastros")).toBeTruthy();
  });

  it("renderiza o link Relatórios", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Relatórios")).toBeTruthy();
  });

  it("renderiza o link Configurações", () => {
    render(<HeaderNav />);
    expect(screen.getByText("Configurações")).toBeTruthy();
  });
});
