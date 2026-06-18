export interface LancamentoRow {
  id: string;
  created_at: string;
  data: string;
  tipo: string;
  categoria: string;
  descricao: string;
  contraparte: string;
  valor: number;
  status: string;
}

export interface CategoriaRow {
  id: string;
  created_at: string;
  tipo: string;
  nome: string;
}
