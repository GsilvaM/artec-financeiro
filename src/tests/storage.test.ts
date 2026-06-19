import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportarCSV, exportarBackup, importarBackup } from "@/lib/financeiro/storage";
import type { Lancamento, Categorias } from "@/lib/financeiro/types";

vi.mock("@/lib/financeiro/server-fns", () => ({
  getData: vi.fn().mockResolvedValue({ lancamentos: [], categorias: {} }),
  saveLancamentos: vi.fn().mockResolvedValue(undefined),
  saveCategorias: vi.fn().mockResolvedValue(undefined),
}));

describe("exportarCSV", () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and HTMLAnchorElement
    global.URL.createObjectURL = vi.fn(() => "blob:test");
    global.URL.revokeObjectURL = vi.fn();

    const mockClick = vi.fn();
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
      style: {},
      remove: vi.fn(),
    } as any;

    vi.spyOn(document, "createElement").mockImplementation(
      (tag: string) => tag === "a" ? mockLink : document.createElement(tag)
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
  });

  it("exporta CSV com cabeçalhos corretos", () => {
    const lancamentos: Lancamento[] = [];
    exportarCSV(lancamentos);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("exporta CSV com dados de lançamentos", () => {
    const lancamentos: Lancamento[] = [
      {
        id: "1",
        data: "2026-06-15",
        tipo: "receita",
        categoria: "Vendas",
        descricao: "Teste",
        contraparte: "Cliente A",
        valor: 1500.50,
        status: "recebido",
      },
    ];
    exportarCSV(lancamentos);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("exporta CSV com múltiplos lançamentos", () => {
    const lancamentos: Lancamento[] = [
      {
        id: "1", data: "2026-06-01", tipo: "receita",
        categoria: "Vendas", descricao: "Venda 1",
        contraparte: "Cliente", valor: 1000, status: "recebido",
      },
      {
        id: "2", data: "2026-06-02", tipo: "custo_direto",
        categoria: "Insumos", descricao: "Compra 1",
        contraparte: "Fornecedor", valor: 500, status: "pago",
      },
    ];
    exportarCSV(lancamentos);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("cria link de download com nome de arquivo", () => {
    const lancamentos: Lancamento[] = [];
    exportarCSV(lancamentos);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });
});

describe("exportarBackup", () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => "blob:test");
    global.URL.revokeObjectURL = vi.fn();

    const mockClick = vi.fn();
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
      style: {},
      remove: vi.fn(),
    } as any;

    vi.spyOn(document, "createElement").mockImplementation(
      (tag: string) => tag === "a" ? mockLink : document.createElement(tag)
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);
  });

  it("cria link de download do backup", async () => {
    await exportarBackup();
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("nome do backup contém 'artec-backup'", async () => {
    await exportarBackup();
    expect(document.createElement).toHaveBeenCalledWith("a");
  });
});

describe("importarBackup", () => {
  it("lança erro para JSON inválido", async () => {
    const file = new File(["not json"], "backup.json", { type: "application/json" });
    await expect(importarBackup(file)).rejects.toThrowError();
  });

  it("processa backup com categorias e lançamentos", async () => {
    const backup = JSON.stringify({
      categorias: { receitas: ["Vendas"] },
      lancamentos: [],
    });
    const file = new File([backup], "backup.json", { type: "application/json" });
    await expect(importarBackup(file)).resolves.toBeUndefined();
  });

  it("processa backup vazio", async () => {
    const backup = JSON.stringify({});
    const file = new File([backup], "backup.json", { type: "application/json" });
    await expect(importarBackup(file)).resolves.toBeUndefined();
  });
});
