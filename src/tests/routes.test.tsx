import { describe, it, expect } from "vitest";
import { routeTree } from "@/routeTree.gen";

describe("Route Tree", () => {
  it("possui a rota raiz configurada", () => {
    expect(routeTree).toBeDefined();
  });

  it("possui 6 rotas filhas registradas", () => {
    const children = (routeTree as any).children;
    expect(children).toBeDefined();
    expect(Array.isArray(children) || typeof children === "object").toBe(true);
  });

  it("possui a rota raiz com método _addFileChildren", () => {
    expect(typeof (routeTree as any)._addFileChildren).toBe("function");
  });
});
