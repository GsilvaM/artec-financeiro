import { describe, it, expect } from "vitest";
import { CATEGORIAS_INICIAIS } from "@/lib/financeiro/seed";

describe("CATEGORIAS_INICIAIS", () => {
  it("possui todas as chaves necessárias", () => {
    expect(CATEGORIAS_INICIAIS).toHaveProperty("receitas");
    expect(CATEGORIAS_INICIAIS).toHaveProperty("custos");
    expect(CATEGORIAS_INICIAIS).toHaveProperty("despesas");
    expect(CATEGORIAS_INICIAIS).toHaveProperty("deducoes");
    expect(CATEGORIAS_INICIAIS).toHaveProperty("receitas_financeiras");
    expect(CATEGORIAS_INICIAIS).toHaveProperty("despesas_financeiras");
  });

  it("possui pelo menos uma categoria de receita", () => {
    expect(CATEGORIAS_INICIAIS.receitas.length).toBeGreaterThan(0);
  });

  it("possui pelo menos uma categoria de custo", () => {
    expect(CATEGORIAS_INICIAIS.custos.length).toBeGreaterThan(0);
  });

  it("possui pelo menos uma categoria de despesa", () => {
    expect(CATEGORIAS_INICIAIS.despesas.length).toBeGreaterThan(0);
  });

  it("todas as categorias são strings não vazias", () => {
    const todas = [
      ...CATEGORIAS_INICIAIS.receitas,
      ...CATEGORIAS_INICIAIS.custos,
      ...CATEGORIAS_INICIAIS.despesas,
      ...CATEGORIAS_INICIAIS.deducoes,
      ...CATEGORIAS_INICIAIS.receitas_financeiras,
      ...CATEGORIAS_INICIAIS.despesas_financeiras,
    ];
    todas.forEach((cat) => {
      expect(typeof cat).toBe("string");
      expect(cat.trim().length).toBeGreaterThan(0);
    });
  });

  it("não possui categorias duplicadas dentro de cada grupo", () => {
    const verificar = (arr: string[]) => {
      const unicos = new Set(arr);
      expect(unicos.size).toBe(arr.length);
    };
    verificar(CATEGORIAS_INICIAIS.receitas);
    verificar(CATEGORIAS_INICIAIS.custos);
    verificar(CATEGORIAS_INICIAIS.despesas);
    verificar(CATEGORIAS_INICIAIS.deducoes);
    verificar(CATEGORIAS_INICIAIS.receitas_financeiras);
    verificar(CATEGORIAS_INICIAIS.despesas_financeiras);
  });
});
