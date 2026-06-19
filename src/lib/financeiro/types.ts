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

// ─── Novas entidades ───────────────────────────────────────

export interface Tecnico {
  id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Servico {
  id: string;
  cliente: string;
  tecnico: string;
  descricao: string;
  data: string;
  valor: number;
  status: "agendado" | "em_andamento" | "concluido" | "cancelado";
  criadoEm: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  telefone: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
}

export interface ServicoCadastro {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  categoria: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Meta {
  id: string;
  descricao: string;
  valorMeta: number;
  valorAtual: number;
  periodo: string;
  tipo: "mensal" | "trimestral" | "anual";
  criadoEm: string;
}

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  role: "admin" | "user";
  ativo: boolean;
  criadoEm: string;
}

export interface Permissao {
  id: string;
  role: string;
  recurso: string;
  leitura: boolean;
  escrita: boolean;
  criadoEm: string;
}

export const SERVICO_STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
