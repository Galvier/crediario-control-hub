
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";
import Layout from "@/components/Layout";
import DashboardAdmin from "@/components/admin/DashboardAdmin";
import EmpresasManager from "@/components/admin/EmpresasManager";
import DashboardEmpresa from "@/components/empresa/DashboardEmpresa";
import ClientesManager from "@/components/empresa/ClientesManager";
import OperacoesManager from "@/components/empresa/OperacoesManager";
import ClienteExtrato from "@/components/empresa/ClienteExtrato";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <Layout>{children}</Layout>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.prefs.role === 'admin') {
    return <DashboardAdmin />;
  } else {
    return <DashboardEmpresa />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            <Route path="/empresas" element={
              <ProtectedRoute>
                <EmpresasManager />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <ClientesManager />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clientId/extrato" element={
              <ProtectedRoute>
                <ClienteExtrato />
              </ProtectedRoute>
            } />
            <Route path="/operacoes" element={
              <ProtectedRoute>
                <OperacoesManager />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
