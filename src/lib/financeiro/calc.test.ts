import { describe, it, expect } from "vitest";
import {
  fmtBRL,
  fmtPct,
  filtrarPorPeriodo,
  somaPor,
  calcularDRE,
  anosDisponiveis,
  MESES,
} from "./calc";
import type { Lancamento } from "./types";

function makeLanc(overrides: Partial<Lancamento> = {}): Lancamento {
  return {
    id: "1",
    data: "2026-06-15",
    tipo: "receita",
    categoria: "Vendas",
    descricao: "Teste",
    contraparte: "Cliente",
    valor: 1000,
    status: "recebido",
    ...overrides,
  };
}

describe("fmtBRL", () => {
  it("formata valor positivo em reais", () => {
    expect(fmtBRL(1234.56)).toBe("R$\u00a01.234,56");
  });

  it("formata zero", () => {
    expect(fmtBRL(0)).toBe("R$\u00a00,00");
  });

  it("formata valor negativo", () => {
    expect(fmtBRL(-500)).toBe("-R$\u00a0500,00");
  });

  it("formata valor grande com milhares", () => {
    expect(fmtBRL(1234567.89)).toBe("R$\u00a01.234.567,89");
  });

  it("formata centavos corretamente", () => {
    expect(fmtBRL(0.1)).toBe("R$\u00a00,10");
    expect(fmtBRL(0.01)).toBe("R$\u00a00,01");
  });
});

describe("fmtPct", () => {
  it("formata porcentagem padrão", () => {
    expect(fmtPct(25.5)).toBe("25,5%");
  });

  it("formata zero", () => {
    expect(fmtPct(0)).toBe("0,0%");
  });

  it("formata 100%", () => {
    expect(fmtPct(100)).toBe("100,0%");
  });

  it("lida com Infinity retornando 0%", () => {
    expect(fmtPct(Infinity)).toBe("0,0%");
  });

  it("lida com NaN retornando 0%", () => {
    expect(fmtPct(NaN)).toBe("0,0%");
  });
});

describe("filtrarPorPeriodo", () => {
  const lancs = [
    makeLanc({ id: "1", data: "2026-01-15" }),
    makeLanc({ id: "2", data: "2026-06-15" }),
    makeLanc({ id: "3", data: "2025-12-01" }),
    makeLanc({ id: "4", data: "2027-03-10" }),
  ];

  it("retorna todos quando ano e mes são 'todos'", () => {
    expect(filtrarPorPeriodo(lancs, "todos", "todos")).toHaveLength(4);
  });

  it("filtra por ano específico", () => {
    expect(filtrarPorPeriodo(lancs, 2026, "todos")).toHaveLength(2);
    expect(filtrarPorPeriodo(lancs, 2025, "todos")).toHaveLength(1);
  });

  it("filtra por mês específico", () => {
    expect(filtrarPorPeriodo(lancs, "todos", 1)).toHaveLength(1);
    expect(filtrarPorPeriodo(lancs, "todos", 6)).toHaveLength(1);
  });

  it("filtra por ano e mês combinados", () => {
    expect(filtrarPorPeriodo(lancs, 2026, 6)).toHaveLength(1);
    expect(filtrarPorPeriodo(lancs, 2026, 1)).toHaveLength(1);
  });

  it("retorna vazio quando não há correspondência", () => {
    expect(filtrarPorPeriodo(lancs, 2030, "todos")).toHaveLength(0);
  });

  it("retorna array vazio para entrada vazia", () => {
    expect(filtrarPorPeriodo([], "todos", "todos")).toHaveLength(0);
  });
});

describe("somaPor", () => {
  const lancs = [
    makeLanc({ id: "1", tipo: "receita", categoria: "Vendas", valor: 5000 }),
    makeLanc({ id: "2", tipo: "receita", categoria: "Serviços", valor: 3000 }),
    makeLanc({ id: "3", tipo: "receita", categoria: "Vendas", valor: 2000 }),
    makeLanc({ id: "4", tipo: "custo_direto", categoria: "Insumos", valor: 1500 }),
    makeLanc({ id: "5", tipo: "custo_direto", categoria: "Mão de obra", valor: 2500 }),
  ];

  it("soma por tipo sem categoria", () => {
    expect(somaPor(lancs, "receita")).toBe(10000);
    expect(somaPor(lancs, "custo_direto")).toBe(4000);
  });

  it("soma por tipo e categoria", () => {
    expect(somaPor(lancs, "receita", "Vendas")).toBe(7000);
    expect(somaPor(lancs, "custo_direto", "Insumos")).toBe(1500);
  });

  it("retorna 0 para tipo sem correspondência", () => {
    expect(somaPor(lancs, "despesa_operacional")).toBe(0);
  });

  it("retorna 0 para lista vazia", () => {
    expect(somaPor([], "receita")).toBe(0);
  });
});

describe("calcularDRE", () => {
  it("calcula DRE para lançamentos vazios", () => {
    const dre = calcularDRE([]);
    expect(dre.receitaBruta).toBe(0);
    expect(dre.custosDir).toBe(0);
    expect(dre.despesasOp).toBe(0);
    expect(dre.lucroLiquido).toBe(0);
    expect(dre.margemLiquida).toBe(0);
  });

  it("calcula DRE completo corretamente", () => {
    const lancs = [
      makeLanc({ id: "1", tipo: "receita", categoria: "Vendas", valor: 50000 }),
      makeLanc({ id: "2", tipo: "receita", categoria: "Serviços", valor: 30000 }),
      makeLanc({ id: "3", tipo: "custo_direto", categoria: "Insumos", valor: 15000 }),
      makeLanc({ id: "4", tipo: "custo_direto", categoria: "Mão de obra", valor: 10000 }),
      makeLanc({ id: "5", tipo: "despesa_operacional", categoria: "Aluguel", valor: 5000 }),
      makeLanc({ id: "6", tipo: "despesa_operacional", categoria: "Marketing", valor: 3000 }),
      makeLanc({ id: "7", tipo: "receita_financeira", categoria: "Juros", valor: 1000 }),
      makeLanc({ id: "8", tipo: "despesa_financeira", categoria: "Taxas", valor: 500 }),
    ];

    const dre = calcularDRE(lancs);

    expect(dre.receitaBruta).toBe(80000);
    expect(dre.receitasPorCategoria).toEqual({ Vendas: 50000, Serviços: 30000 });
    expect(dre.deducoes).toBe(0);
    expect(dre.receitaLiquida).toBe(80000);
    expect(dre.custosDir).toBe(25000);
    expect(dre.custosPorCategoria).toEqual({ Insumos: 15000, "Mão de obra": 10000 });
    expect(dre.lucroBruto).toBe(55000);
    expect(dre.despesasOp).toBe(8000);
    expect(dre.despesasPorCategoria).toEqual({ Aluguel: 5000, Marketing: 3000 });
    expect(dre.resultadoOperacional).toBe(47000);
    expect(dre.receitasFin).toBe(1000);
    expect(dre.despesasFin).toBe(500);
    expect(dre.resultadoFinanceiro).toBe(500);
    expect(dre.lucroLiquido).toBe(47500);
    expect(dre.margemLiquida).toBeCloseTo(59.375, 2);
  });

  it("calcula margem líquida como 0 quando receita é 0", () => {
    const dre = calcularDRE([makeLanc({ tipo: "custo_direto", valor: 100 })]);
    expect(dre.margemLiquida).toBe(0);
  });

  it("calcula lucro líquido negativo corretamente", () => {
    const dre = calcularDRE([
      makeLanc({ tipo: "receita", valor: 10000 }),
      makeLanc({ tipo: "custo_direto", valor: 15000 }),
    ]);
    expect(dre.lucroLiquido).toBe(-5000);
    expect(dre.margemLiquida).toBeCloseTo(-50, 1);
  });

  it("agrupa corretamente receitas por categoria", () => {
    const dre = calcularDRE([
      makeLanc({ tipo: "receita", categoria: "Produto A", valor: 100 }),
      makeLanc({ tipo: "receita", categoria: "Produto A", valor: 200 }),
      makeLanc({ tipo: "receita", categoria: "Produto B", valor: 300 }),
    ]);
    expect(dre.receitasPorCategoria).toEqual({ "Produto A": 300, "Produto B": 300 });
    expect(dre.receitaBruta).toBe(600);
  });

  it("agrupa corretamente despesas por categoria", () => {
    const dre = calcularDRE([
      makeLanc({ tipo: "despesa_operacional", categoria: "Aluguel", valor: 3000 }),
      makeLanc({ tipo: "despesa_operacional", categoria: "Aluguel", valor: 3000 }),
      makeLanc({ tipo: "despesa_operacional", categoria: "Internet", valor: 500 }),
    ]);
    expect(dre.despesasPorCategoria).toEqual({ Aluguel: 6000, Internet: 500 });
    expect(dre.despesasOp).toBe(6500);
  });
});

describe("anosDisponiveis", () => {
  it("retorna ano corrente para lista vazia", () => {
    const anos = anosDisponiveis([]);
    expect(anos).toHaveLength(1);
    expect(anos[0]).toBe(new Date().getFullYear());
  });

  it("retorna anos únicos ordenados decrescente", () => {
    const lancs = [
      makeLanc({ data: "2024-01-01" }),
      makeLanc({ data: "2025-06-15" }),
      makeLanc({ data: "2025-03-10" }),
      makeLanc({ data: "2023-12-31" }),
    ];
    expect(anosDisponiveis(lancs)).toEqual([2025, 2024, 2023]);
  });

  it("retorna um único ano quando todos são do mesmo ano", () => {
    const lancs = [
      makeLanc({ data: "2026-01-01" }),
      makeLanc({ data: "2026-06-15" }),
    ];
    expect(anosDisponiveis(lancs)).toEqual([2026]);
  });
});

describe("MESES", () => {
  it("tem 12 meses", () => {
    expect(MESES).toHaveLength(12);
  });

  it("começa com Janeiro", () => {
    expect(MESES[0]).toBe("Janeiro");
  });

  it("termina com Dezembro", () => {
    expect(MESES[11]).toBe("Dezembro");
  });

  it("contém todos os meses em português", () => {
    expect(MESES).toEqual([
      "Janeiro", "Fevereiro", "Março", "Abril",
      "Maio", "Junho", "Julho", "Agosto",
      "Setembro", "Outubro", "Novembro", "Dezembro",
    ]);
  });
});
