
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { Company } from '@/types/appwrite';

// Mock data for testing
const mockCompanies: Company[] = [
  {
    $id: 'mock-company-id',
    $createdAt: new Date().toISOString(),
    cnpj: '12.345.678/0001-90',
    name: 'Empresa Teste Ltda',
    address: 'Rua Comercial, 123 - Centro',
    ownerPhone: '(11) 99999-1111',
    ownerEmail: 'owner@empresa.com',
    financialPhone: '(11) 88888-2222',
    financialEmail: 'financeiro@empresa.com',
    agreedPercentage: 2.5,
    userId: 'empresa-test-id'
  }
];

export const companyService = {
  async createCompany(data: Omit<Company, '$id' | '$createdAt'>): Promise<Company> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.COMPANIES,
        ID.unique(),
        data
      );
      return response as unknown as Company;
    } catch (error) {
      console.log('Appwrite failed, using mock data for createCompany');
      const newCompany: Company = {
        $id: `company-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        ...data
      };
      mockCompanies.push(newCompany);
      return newCompany;
    }
  },

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMPANIES
      );
      return response.documents as unknown as Company[];
    } catch (error) {
      console.log('Appwrite failed, using mock data for getCompanies');
      return mockCompanies;
    }
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
      console.log('Appwrite failed, using mock data for getCompanyByUserId');
      return mockCompanies.find(company => company.userId === userId) || null;
    }
  }
};
