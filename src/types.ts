export interface Pasta {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  data_criacao: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Material {
  id: number;
  nome: string;
  preco: number;
  unidade: string;
}

export interface Servico {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
}

export interface Estimativa {
  id: number;
  cliente_id: number;
  data: string;
  valor_total: number;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'execucao' | 'concluido';
  descricao: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  items?: ItemEstimativa[];
}

export interface ItemEstimativa {
  id: number;
  estimativa_id: number;
  tipo: 'servico' | 'material';
  item_id: number;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

export interface DashboardStats {
  totalFaturado: number;
  totalServicos: number;
  topServicos: { name: string; count: number }[];
}
