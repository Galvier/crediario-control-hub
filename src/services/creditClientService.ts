
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { CreditClient } from '@/types/appwrite';

export const creditClientService = {
  async createCreditClient(data: Omit<CreditClient, '$id' | '$createdAt'>): Promise<CreditClient> {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      ID.unique(),
      data
    );
    return response as CreditClient;
  },

  async getCreditClientsByCompany(companyId: string): Promise<CreditClient[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      [Query.equal('companyId', companyId)]
    );
    return response.documents as CreditClient[];
  },

  async updateCreditClient(id: string, data: Partial<CreditClient>): Promise<CreditClient> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      id,
      data
    );
    return response as CreditClient;
  },

  async approveCreditClient(id: string): Promise<CreditClient> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      id,
      { status: 'approved' }
    );
    return response as CreditClient;
  },

  async getCreditClient(id: string): Promise<CreditClient> {
    const response = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      id
    );
    return response as CreditClient;
  }
};
