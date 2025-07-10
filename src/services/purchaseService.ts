
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { Purchase } from '@/types/appwrite';

// Mock data for testing
const mockPurchases: Purchase[] = [
  {
    $id: 'purchase-1',
    $createdAt: new Date().toISOString(),
    creditClientId: 'client-1',
    value: 1500,
    purchaseDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'active'
  },
  {
    $id: 'purchase-2',
    $createdAt: new Date().toISOString(),
    creditClientId: 'client-2',
    value: 2200,
    purchaseDate: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'active'
  },
  {
    $id: 'purchase-3',
    $createdAt: new Date().toISOString(),
    creditClientId: 'client-1',
    value: 800,
    purchaseDate: '2023-12-20',
    dueDate: '2024-01-20',
    status: 'paid'
  }
];

export const purchaseService = {
  async createPurchase(data: Omit<Purchase, '$id' | '$createdAt' | 'dueDate'>): Promise<Purchase> {
    try {
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
    } catch (error) {
      console.log('Appwrite failed, using mock data for createPurchase');
      const purchaseDate = new Date(data.purchaseDate);
      const dueDate = new Date(purchaseDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      const newPurchase: Purchase = {
        $id: `purchase-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        ...data,
        dueDate: dueDate.toISOString().split('T')[0]
      };
      mockPurchases.push(newPurchase);
      return newPurchase;
    }
  },

  async getPurchasesByClient(creditClientId: string): Promise<Purchase[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PURCHASES,
        [Query.equal('creditClientId', creditClientId)]
      );
      return response.documents as unknown as Purchase[];
    } catch (error) {
      console.log('Appwrite failed, using mock data for getPurchasesByClient');
      return mockPurchases.filter(purchase => purchase.creditClientId === creditClientId);
    }
  },

  async getPurchasesByCompany(companyId: string): Promise<Purchase[]> {
    try {
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
    } catch (error) {
      console.log('Appwrite failed, using mock data for getPurchasesByCompany');
      return mockPurchases;
    }
  },

  async updatePurchaseStatus(id: string, status: 'active' | 'overdue' | 'paid'): Promise<Purchase> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PURCHASES,
        id,
        { status }
      );
      return response as unknown as Purchase;
    } catch (error) {
      console.log('Appwrite failed, using mock data for updatePurchaseStatus');
      const purchaseIndex = mockPurchases.findIndex(purchase => purchase.$id === id);
      if (purchaseIndex !== -1) {
        mockPurchases[purchaseIndex].status = status;
        return mockPurchases[purchaseIndex];
      }
      throw new Error('Purchase not found');
    }
  }
};
