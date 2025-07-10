
export type UserRole = 'admin' | 'empresa';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  empresaId?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
