import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Download, Upload, Tags, Settings } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportarBackup, importarBackup, useCategorias } from "@/lib/financeiro/storage";
import type { Categorias } from "@/lib/financeiro/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Artec Financeiro" }] }),
  component: ConfigPage,
});

const GRUPOS: { key: keyof Categorias; label: string; color: string }[] = [
  { key: "receitas", label: "Receitas", color: "#215797" },
  { key: "custos", label: "Custos Diretos", color: "#EF4444" },
  { key: "despesas", label: "Despesas Operacionais", color: "#EF4444" },
  { key: "deducoes", label: "Deduções", color: "#6B2FD6" },
  { key: "receitas_financeiras", label: "Receitas Financeiras", color: "#10B981" },
  { key: "despesas_financeiras", label: "Despesas Financeiras", color: "#EF4444" },
];

function ListaCategorias({
  itens,
  onChange,
}: {
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
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          placeholder="Nova categoria"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionar()}
          className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm text-[#4B5563] placeholder:text-gray-400 px-3 focus:outline-none focus:ring-2 focus:ring-[#215797]/20 focus:border-[#215797] transition-all"
        />
        <button onClick={adicionar} className="btn-primary !h-10">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {itens.length === 0 && (
          <div className="py-8 text-center text-sm text-[#9CA3AF]">
            Nenhuma categoria cadastrada.
          </div>
        )}
        {itens.map((c) => (
          <div
            key={c}
            className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Tags className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[#4B5563]">{c}</span>
            </div>
            <button
              className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              onClick={() => remover(c)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#215797]/10 text-[#215797]">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] tracking-tight">Configurações</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">Gerencie categorias e faça backup dos dados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportarBackup()} className="btn-secondary text-sm">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
            <Upload className="h-4 w-4" /> Importar
          </button>
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

      <div className="card-artec-static overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-[#1F2937]">Categorias</h3>
        </div>
        <div className="p-6">
          <Tabs defaultValue="receitas">
            <TabsList className="flex h-auto flex-wrap gap-1.5 bg-transparent p-0 mb-6">
              {GRUPOS.map((g) => (
                <TabsTrigger
                  key={g.key}
                  value={g.key}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium shadow-sm transition-all duration-200 data-[state=active]:border-[#215797] data-[state=active]:bg-[#215797] data-[state=active]:text-white"
                >
                  {g.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {GRUPOS.map((g) => (
              <TabsContent key={g.key} value={g.key} className="animate-fade-in">
                <ListaCategorias
                  itens={categorias[g.key]}
                  onChange={(v) => update(g.key, v)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
