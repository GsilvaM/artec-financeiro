import { CalendarDays } from "lucide-react";
import { MESES } from "@/lib/financeiro/calc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  ano: number | "todos";
  mes: number | "todos";
  anos: number[];
  onAno: (v: number | "todos") => void;
  onMes: (v: number | "todos") => void;
  incluirTodos?: boolean;
}

export function PeriodoFiltro({ ano, mes, anos, onAno, onMes, incluirTodos = true }: Props) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CalendarDays className="h-4 w-4" />
      </div>
      <Select value={String(mes)} onValueChange={(v) => onMes(v === "todos" ? "todos" : Number(v))}>
        <SelectTrigger className="w-32 border-primary/20 bg-white text-xs transition-all duration-200 focus:ring-2 focus:ring-primary/20 sm:w-36 sm:text-sm">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {incluirTodos && <SelectItem value="todos">Todos os meses</SelectItem>}
          {MESES.map((m, i) => (
            <SelectItem key={i} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(ano)} onValueChange={(v) => onAno(v === "todos" ? "todos" : Number(v))}>
        <SelectTrigger className="w-24 border-primary/20 bg-white text-xs transition-all duration-200 focus:ring-2 focus:ring-primary/20 sm:w-28 sm:text-sm">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {incluirTodos && <SelectItem value="todos">Todos</SelectItem>}
          {anos.map((a) => (
            <SelectItem key={a} value={String(a)}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
