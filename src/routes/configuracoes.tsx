import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Download, Upload, Tags } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportarBackup, importarBackup, useCategorias } from "@/lib/financeiro/storage";
import type { Categorias } from "@/lib/financeiro/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Artec Financeiro" }] }),
  component: ConfigPage,
});

const GRUPOS: { key: keyof Categorias; label: string; color: string }[] = [
  { key: "receitas", label: "Receitas", color: "text-[#215797]" },
  { key: "custos", label: "Custos Diretos", color: "text-[#EB4134]" },
  { key: "despesas", label: "Despesas Operacionais", color: "text-[#EB4134]" },
  { key: "deducoes", label: "Deduções", color: "text-[#2C3A5C]" },
  { key: "receitas_financeiras", label: "Receitas Financeiras", color: "text-[#2783C3]" },
  { key: "despesas_financeiras", label: "Despesas Financeiras", color: "text-[#EB4134]" },
];

function ListaCategorias({
  titulo,
  itens,
  onChange,
}: {
  titulo: string;
  itens: string[];
  onChange: (v: string[]) => void;
}) {
  const [novo, setNovo] = useState("");

  const adicionar = () => {
    const v = novo.trim();
    if (!v) return;
    if (itens.includes(v)) {
      toast.error("Categoria já existe");
      return;
    }
    onChange([...itens, v]);
    setNovo("");
  };
  const remover = (c: string) => {
    onChange(itens.filter((x) => x !== c));
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nova categoria"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
          />
          <Button onClick={adicionar}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {itens.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada.
            </li>
          )}
          {itens.map((c) => (
            <li
              key={c}
              className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Tags className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{c}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remover(c)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ConfigPage() {
  const [categorias, setCategorias] = useCategorias();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof Categorias, list: string[]) => {
    setCategorias({ ...categorias, [key]: list });
  };

  const onImport = async (f: File) => {
    try {
      await importarBackup(f);
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
      toast.success("Backup importado com sucesso");
    } catch (e) {
      console.error(e);
      toast.error("Arquivo inválido");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie categorias e faça backup dos dados em JSON.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportarBackup()}>
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Importar JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="receitas">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {GRUPOS.map((g) => (
            <TabsTrigger
              key={g.key}
              value={g.key}
              className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {GRUPOS.map((g) => (
          <TabsContent key={g.key} value={g.key} className="mt-4 animate-fade-in">
            <ListaCategorias
              titulo={g.label}
              itens={categorias[g.key]}
              onChange={(v) => update(g.key, v)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
