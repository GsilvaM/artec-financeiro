import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./test-utils";
import { PeriodoFiltro } from "@/components/financeiro/PeriodoFiltro";

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children, className }: any) => <button className={className} role="combobox">{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

describe("PeriodoFiltro", () => {
  const defaultProps = {
    ano: 2026 as const,
    mes: "todos" as const,
    anos: [2026, 2025],
    onAno: vi.fn(),
    onMes: vi.fn(),
  };

  it("renderiza o ícone de calendário", () => {
    render(<PeriodoFiltro {...defaultProps} />);
    const icone = document.querySelector(".lucide-calendar-days");
    expect(icone).toBeTruthy();
  });

  it("renderiza selects de mês e ano", () => {
    render(<PeriodoFiltro {...defaultProps} />);
    const selects = document.querySelectorAll('[role="combobox"]');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza a opção 'Todos os meses' quando incluirTodos é true", () => {
    render(<PeriodoFiltro {...defaultProps} />);
    expect(screen.getByText("Todos os meses")).toBeTruthy();
  });

  it("não renderiza 'Todos os meses' quando incluirTodos é false", () => {
    render(<PeriodoFiltro {...defaultProps} incluirTodos={false} />);
    expect(screen.queryByText("Todos os meses")).toBeNull();
  });

  it("exibe os anos disponíveis", () => {
    render(<PeriodoFiltro {...defaultProps} />);
    expect(screen.getByText("2026")).toBeTruthy();
    expect(screen.getByText("2025")).toBeTruthy();
  });

  it("renderiza sem anos quando lista é vazia", () => {
    render(<PeriodoFiltro {...defaultProps} anos={[]} />);
    const selects = document.querySelectorAll('[role="combobox"]');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza todos os 12 meses", () => {
    render(<PeriodoFiltro {...defaultProps} />);
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril",
      "Maio", "Junho", "Julho", "Agosto",
      "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    meses.forEach((mes) => {
      expect(screen.getByText(mes)).toBeTruthy();
    });
  });
});
