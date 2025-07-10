
import { account } from '@/lib/appwrite';
import { AppwriteUser } from '@/types/appwrite';

export const authService = {
  async login(email: string, password: string): Promise<AppwriteUser> {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return user as AppwriteUser;
  },

  async logout(): Promise<void> {
    await account.deleteSession('current');
  },

  async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      const user = await account.get();
      return user as AppwriteUser;
    } catch {
      return null;
    }
  },

  async createUser(email: string, password: string, name: string, role: 'admin' | 'empresa'): Promise<AppwriteUser> {
    const user = await account.create('unique()', email, password, name);
    await account.createEmailPasswordSession(email, password);
    
    // Set user preferences
    await account.updatePrefs({ role });
    
    const updatedUser = await account.get();
    return updatedUser as AppwriteUser;
  }
};
