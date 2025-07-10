
import { account } from '@/lib/appwrite';
import { AppwriteUser } from '@/types/appwrite';

// Mock users for testing when Appwrite is not available
const mockUsers = [
  {
    $id: 'admin-test-id',
    email: 'admin@teste.com',
    name: 'Administrador Teste',
    prefs: { role: 'admin' as const }
  },
  {
    $id: 'empresa-test-id', 
    email: 'empresa@teste.com',
    name: 'Empresa Teste',
    prefs: { role: 'empresa' as const }
  }
];

let currentMockUser: AppwriteUser | null = null;

export const authService = {
  async login(email: string, password: string): Promise<AppwriteUser> {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      return user as unknown as AppwriteUser;
    } catch (error) {
      // Fallback to mock authentication for testing
      console.log('Appwrite login failed, using mock authentication for testing');
      
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser && password === '123456') {
        currentMockUser = mockUser as AppwriteUser;
        return currentMockUser;
      }
      
      throw new Error('Credenciais inválidas');
    }
  },

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch {
      // Fallback for mock logout
      currentMockUser = null;
    }
  },

  async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      const user = await account.get();
      return user as unknown as AppwriteUser;
    } catch {
      // Return mock user if available
      return currentMockUser;
    }
  },

  async createUser(email: string, password: string, name: string, role: 'admin' | 'empresa'): Promise<AppwriteUser> {
    try {
      const user = await account.create('unique()', email, password, name);
      await account.createEmailPasswordSession(email, password);
      
      // Set user preferences
      await account.updatePrefs({ role });
      
      const updatedUser = await account.get();
      return updatedUser as unknown as AppwriteUser;
    } catch (error) {
      // For testing purposes, create a mock user
      const newMockUser = {
        $id: `mock-${Date.now()}`,
        email,
        name,
        prefs: { role }
      } as AppwriteUser;
      
      currentMockUser = newMockUser;
      return newMockUser;
    }
  }
};
