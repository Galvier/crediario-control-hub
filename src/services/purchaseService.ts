
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { Purchase } from '@/types/appwrite';

export const purchaseService = {
  async createPurchase(data: Omit<Purchase, '$id' | '$createdAt' | 'dueDate'>): Promise<Purchase> {
    // Calculate due date (30 days from purchase date)
    const purchaseDate = new Date(data.purchaseDate);
    const dueDate = new Date(purchaseDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const purchaseData = {
      ...data,
      dueDate: dueDate.toISOString()
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      ID.unique(),
      purchaseData
    );
    return response as Purchase;
  },

  async getPurchasesByClient(creditClientId: string): Promise<Purchase[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      [Query.equal('creditClientId', creditClientId), Query.orderDesc('$createdAt')]
    );
    return response.documents as Purchase[];
  },

  async updatePurchaseStatus(id: string, status: 'active' | 'overdue' | 'paid'): Promise<Purchase> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      id,
      { status }
    );
    return response as Purchase;
  },

  async getPurchasesByCompany(companyId: string): Promise<Purchase[]> {
    // First get all credit clients for the company
    const creditClientsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      [Query.equal('companyId', companyId)]
    );

    if (creditClientsResponse.documents.length === 0) {
      return [];
    }

    const creditClientIds = creditClientsResponse.documents.map(client => client.$id);
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      [Query.equal('creditClientId', creditClientIds), Query.orderDesc('$createdAt')]
    );
    
    return response.documents as Purchase[];
  }
};
