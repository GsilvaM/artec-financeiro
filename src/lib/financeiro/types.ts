export type TipoLancamento =
  | "receita"
  | "custo_direto"
  | "despesa_operacional"
  | "receita_financeira"
  | "despesa_financeira";

export type StatusLancamento = "pago" | "recebido" | "pendente";

export interface Lancamento {
  id: string;
  data: string; // ISO yyyy-mm-dd
  tipo: TipoLancamento;
  categoria: string;
  descricao: string;
  contraparte: string; // cliente ou fornecedor
  valor: number;
  status: StatusLancamento;
}

export interface Categorias {
  receitas: string[];
  custos: string[];
  despesas: string[];
  deducoes: string[];
  receitas_financeiras: string[];
  despesas_financeiras: string[];
}

export const TIPO_LABEL: Record<TipoLancamento, string> = {
  receita: "Receita",
  custo_direto: "Custo Direto",
  despesa_operacional: "Despesa Operacional",
  receita_financeira: "Receita Financeira",
  despesa_financeira: "Despesa Financeira",
};

export const STATUS_LABEL: Record<StatusLancamento, string> = {
  pago: "Pago",
  recebido: "Recebido",
  pendente: "Pendente",
};
