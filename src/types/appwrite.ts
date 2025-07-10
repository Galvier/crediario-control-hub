
export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
  $createdAt: string;
  prefs: {
    role: 'admin' | 'empresa';
    empresaId?: string;
  };
}

export interface Company {
  $id: string;
  cnpj: string;
  name: string;
  address: string;
  ownerPhone: string;
  ownerEmail: string;
  financialPhone: string;
  financialEmail: string;
  agreedPercentage: number;
  userId: string;
  $createdAt: string;
}

export interface CreditClient {
  $id: string;
  companyId: string;
  name: string;
  address: string;
  email: string;
  cpf: string;
  phone: string;
  income: number;
  initialLimit: number;
  approvedLimit: number;
  status: 'pending' | 'approved';
  $createdAt: string;
}

export interface Purchase {
  $id: string;
  creditClientId: string;
  value: number;
  purchaseDate: string;
  dueDate: string;
  status: 'active' | 'overdue' | 'paid';
  $createdAt: string;
}
