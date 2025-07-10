
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { Purchase } from '@/types/appwrite';

export const purchaseService = {
  async createPurchase(data: Omit<Purchase, '$id' | '$createdAt' | 'dueDate'>): Promise<Purchase> {
    // Calculate due date (30 days from purchase date)
    const purchaseDate = new Date(data.purchaseDate);
    const dueDate = new Date(purchaseDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      ID.unique(),
      {
        ...data,
        dueDate: dueDate.toISOString().split('T')[0]
      }
    );
    return response as unknown as Purchase;
  },

  async getPurchasesByClient(creditClientId: string): Promise<Purchase[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      [Query.equal('creditClientId', creditClientId)]
    );
    return response.documents as unknown as Purchase[];
  },

  async getPurchasesByCompany(companyId: string): Promise<Purchase[]> {
    // First get all credit clients for this company
    const clientsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CREDIT_CLIENTS,
      [Query.equal('companyId', companyId)]
    );
    
    if (clientsResponse.documents.length === 0) {
      return [];
    }
    
    const clientIds = clientsResponse.documents.map(doc => doc.$id);
    
    // Get all purchases for these clients
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      [Query.equal('creditClientId', clientIds)]
    );
    
    return response.documents as unknown as Purchase[];
  },

  async updatePurchaseStatus(id: string, status: 'active' | 'overdue' | 'paid'): Promise<Purchase> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      id,
      { status }
    );
    return response as unknown as Purchase;
  }
};
