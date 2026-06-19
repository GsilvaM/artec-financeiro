import { describe, it, expect } from "vitest";
import { TIPO_LABEL, STATUS_LABEL } from "@/lib/financeiro/types";

describe("TIPO_LABEL", () => {
  it("contém todos os tipos de lançamento", () => {
    expect(TIPO_LABEL).toHaveProperty("receita");
    expect(TIPO_LABEL).toHaveProperty("custo_direto");
    expect(TIPO_LABEL).toHaveProperty("despesa_operacional");
    expect(TIPO_LABEL).toHaveProperty("deducao");
    expect(TIPO_LABEL).toHaveProperty("receita_financeira");
    expect(TIPO_LABEL).toHaveProperty("despesa_financeira");
  });

  it("retorna labels em português corretos", () => {
    expect(TIPO_LABEL.receita).toBe("Receita");
    expect(TIPO_LABEL.custo_direto).toBe("Custo Direto");
    expect(TIPO_LABEL.despesa_operacional).toBe("Despesa Operacional");
    expect(TIPO_LABEL.deducao).toBe("Deduções");
    expect(TIPO_LABEL.receita_financeira).toBe("Receita Financeira");
    expect(TIPO_LABEL.despesa_financeira).toBe("Despesa Financeira");
  });

  it("tem 6 entradas", () => {
    expect(Object.keys(TIPO_LABEL)).toHaveLength(6);
  });
});

describe("STATUS_LABEL", () => {
  it("contém todos os status", () => {
    expect(STATUS_LABEL).toHaveProperty("pago");
    expect(STATUS_LABEL).toHaveProperty("recebido");
    expect(STATUS_LABEL).toHaveProperty("pendente");
  });

  it("retorna labels em português corretos", () => {
    expect(STATUS_LABEL.pago).toBe("Pago");
    expect(STATUS_LABEL.recebido).toBe("Recebido");
    expect(STATUS_LABEL.pendente).toBe("Pendente");
  });

  it("tem 3 entradas", () => {
    expect(Object.keys(STATUS_LABEL)).toHaveLength(3);
  });
});
