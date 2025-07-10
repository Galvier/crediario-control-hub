
export interface Empresa {
  id: string;
  cnpj: string;
  nomeEmpresa: string;
  endereco: string;
  telefone: string;
  emailProprietarios: string;
  telefoneFinanceiro: string;
  emailFinanceiro: string;
  percentualAcordado: number;
  createdAt: Date;
  userId?: string;
}
