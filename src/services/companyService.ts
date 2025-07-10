
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { Company } from '@/types/appwrite';

export const companyService = {
  async createCompany(data: Omit<Company, '$id' | '$createdAt'>): Promise<Company> {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.COMPANIES,
      ID.unique(),
      data
    );
    return response as unknown as Company;
  },

  async getCompanies(): Promise<Company[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMPANIES
    );
    return response.documents as unknown as Company[];
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.COMPANIES,
      id,
      data
    );
    return response as unknown as Company;
  },

  async deleteCompany(id: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.COMPANIES,
      id
    );
  },

  async getCompanyByUserId(userId: string): Promise<Company | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMPANIES,
        [Query.equal('userId', userId)]
      );
      return response.documents[0] as unknown as Company || null;
    } catch {
      return null;
    }
  }
};
