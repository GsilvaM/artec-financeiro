import { describe, it, expect } from "vitest";
import { routeTree } from "@/routeTree.gen";

describe("Route Tree", () => {
  it("possui a rota raiz configurada", () => {
    expect(routeTree).toBeDefined();
  });

  it("possui 22 rotas filhas (sem 404s - verificado em AllPages)", () => {
    const children = (routeTree as any).children;
    expect(children).toBeDefined();
    const count = typeof children === "object" && !Array.isArray(children)
      ? Object.keys(children).length
      : (children.length || children.size || 0);
    expect(count).toBe(22);
  });
});
