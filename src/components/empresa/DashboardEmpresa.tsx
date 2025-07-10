
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { creditClientService } from '@/services/creditClientService';
import { purchaseService } from '@/services/purchaseService';
import { CreditClient, Purchase } from '@/types/appwrite';

const DashboardEmpresa: React.FC = () => {
  const { company } = useAuth();
  const [creditClients, setCreditClients] = useState<CreditClient[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (company) {
      loadData();
    }
  }, [company]);

  const loadData = async () => {
    try {
      if (!company) return;
      
      const [clients, companyPurchases] = await Promise.all([
        creditClientService.getCreditClientsByCompany(company.$id),
        purchaseService.getPurchasesByCompany(company.$id)
      ]);
      
      setCreditClients(clients);
      setPurchases(companyPurchases);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalClientes = creditClients.length;
  const clientesAprovados = creditClients.filter(c => c.status === 'approved').length;
  
  const totalValorReceber = purchases
    .filter(c => c.status === 'active' || c.status === 'overdue')
    .reduce((acc, c) => acc + c.value, 0);
  
  const totalLimiteConcedido = creditClients
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => acc + c.approvedLimit, 0);

  const comprasVencidas = purchases.filter(c => c.status === 'overdue').length;

  const stats = [
    {
      title: 'Total de Clientes',
      value: totalClientes,
      description: `${clientesAprovados} aprovados`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Valores a Receber',
      value: `R$ ${totalValorReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: 'Total em operações ativas',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Limite Concedido',
      value: `R$ ${totalLimiteConcedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: 'Total de crédito aprovado',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Operações Vencidas',
      value: comprasVencidas,
      description: 'Requer atenção',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard da Empresa</h1>
        <p className="text-gray-600 mt-2">Visão geral das suas operações de crédito</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Recentes</CardTitle>
            <CardDescription>Últimos clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditClients.slice(-5).map((cliente) => {
                const clientPurchases = purchases.filter(p => 
                  p.creditClientId === cliente.$id && (p.status === 'active' || p.status === 'overdue')
                );
                const usedLimit = clientPurchases.reduce((sum, p) => sum + p.value, 0);
                const availableLimit = cliente.approvedLimit - usedLimit;
                
                return (
                  <div key={cliente.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cliente.name}</p>
                      <p className="text-sm text-gray-600">{cliente.cpf}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">Limite disponível</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operações Recentes</CardTitle>
            <CardDescription>Últimas compras registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchases.slice(-5).map((purchase) => {
                const cliente = creditClients.find(c => c.$id === purchase.creditClientId);
                return (
                  <div key={purchase.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cliente?.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        R$ {purchase.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs ${
                        purchase.status === 'active' ? 'text-green-600' :
                        purchase.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {purchase.status === 'active' ? 'Ativa' :
                         purchase.status === 'overdue' ? 'Vencida' : 'Paga'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardEmpresa;
