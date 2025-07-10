
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppwriteUser } from '@/types/appwrite';
import { authService } from '@/services/authService';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/appwrite';

interface AuthContextType {
  user: AppwriteUser | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser && currentUser.prefs.role === 'empresa') {
        const userCompany = await companyService.getCompanyByUserId(currentUser.$id);
        setCompany(userCompany);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
      
      if (user.prefs.role === 'empresa') {
        const userCompany = await companyService.getCompanyByUserId(user.$id);
        setCompany(userCompany);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCompany(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, company, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
