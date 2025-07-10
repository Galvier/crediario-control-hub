
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { CreditClient } from '@/types/appwrite';

// Mock data for testing
const mockClients: CreditClient[] = [
  {
    $id: 'client-1',
    $createdAt: new Date().toISOString(),
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    income: 5000,
    initialLimit: 5000,
    approvedLimit: 3000,
    status: 'approved',
    companyId: 'mock-company-id'
  },
  {
    $id: 'client-2',
    $createdAt: new Date().toISOString(),
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    address: 'Av. Principal, 456',
    income: 8000,
    initialLimit: 8000,
    approvedLimit: 5000,
    status: 'approved',
    companyId: 'mock-company-id'
  }
];

export const creditClientService = {
  async createCreditClient(data: Omit<CreditClient, '$id' | '$createdAt'>): Promise<CreditClient> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CREDIT_CLIENTS,
        ID.unique(),
        data
      );
      return response as unknown as CreditClient;
    } catch (error) {
      console.log('Appwrite failed, using mock data for createCreditClient');
      const newClient: CreditClient = {
        $id: `client-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        ...data
      };
      mockClients.push(newClient);
      return newClient;
    }
  },

  async getCreditClientsByCompany(companyId: string): Promise<CreditClient[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CREDIT_CLIENTS,
        [Query.equal('companyId', companyId)]
      );
      return response.documents as unknown as CreditClient[];
    } catch (error) {
      console.log('Appwrite failed, using mock data for getCreditClientsByCompany');
      return mockClients.filter(client => client.companyId === companyId);
    }
  },

  async updateCreditClient(id: string, data: Partial<CreditClient>): Promise<CreditClient> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CREDIT_CLIENTS,
        id,
        data
      );
      return response as unknown as CreditClient;
    } catch (error) {
      console.log('Appwrite failed, using mock data for updateCreditClient');
      const clientIndex = mockClients.findIndex(client => client.$id === id);
      if (clientIndex !== -1) {
        mockClients[clientIndex] = { ...mockClients[clientIndex], ...data };
        return mockClients[clientIndex];
      }
      throw new Error('Client not found');
    }
  },

  async approveCreditClient(id: string): Promise<CreditClient> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CREDIT_CLIENTS,
        id,
        { status: 'approved' }
      );
      return response as unknown as CreditClient;
    } catch (error) {
      console.log('Appwrite failed, using mock data for approveCreditClient');
      const clientIndex = mockClients.findIndex(client => client.$id === id);
      if (clientIndex !== -1) {
        mockClients[clientIndex].status = 'approved';
        return mockClients[clientIndex];
      }
      throw new Error('Client not found');
    }
  },

  async getCreditClient(id: string): Promise<CreditClient> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CREDIT_CLIENTS,
        id
      );
      return response as unknown as CreditClient;
    } catch (error) {
      console.log('Appwrite failed, using mock data for getCreditClient');
      const client = mockClients.find(client => client.$id === id);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    }
  }
};
