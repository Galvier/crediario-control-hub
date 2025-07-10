
export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  endereco: string;
  email: string;
  cpf: string;
  telefone: string;
  renda: number;
  limiteInicial: number;
  limiteAjustado: number;
  limiteDisponivel: number;
  aprovado: boolean;
  createdAt: Date;
}

export interface Compra {
  id: string;
  clienteId: string;
  empresaId: string;
  valor: number;
  dataCompra: Date;
  dataVencimento: Date;
  status: 'ativa' | 'vencida' | 'paga';
  createdAt: Date;
}
