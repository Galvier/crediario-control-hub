
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const DashboardEmpresa: React.FC = () => {
  const { user } = useAuth();
  const { clientes, compras } = useData();

  const clientesEmpresa = clientes.filter(c => c.empresaId === user?.empresaId);
  const comprasEmpresa = compras.filter(c => c.empresaId === user?.empresaId);

  const totalClientes = clientesEmpresa.length;
  const clientesAprovados = clientesEmpresa.filter(c => c.aprovado).length;
  
  const totalValorReceber = comprasEmpresa
    .filter(c => c.status === 'ativa' || c.status === 'vencida')
    .reduce((acc, c) => acc + c.valor, 0);
  
  const totalLimiteConcedido = clientesEmpresa.reduce((acc, c) => acc + c.limiteAjustado, 0);

  const comprasVencidas = comprasEmpresa.filter(c => c.status === 'vencida').length;

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
              {clientesEmpresa.slice(-5).map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cliente.nome}</p>
                    <p className="text-sm text-gray-600">{cliente.cpf}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      R$ {cliente.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">Limite disponível</p>
                  </div>
                </div>
              ))}
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
              {comprasEmpresa.slice(-5).map((compra) => {
                const cliente = clientesEmpresa.find(c => c.id === compra.clienteId);
                return (
                  <div key={compra.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cliente?.nome}</p>
                      <p className="text-sm text-gray-600">
                        {compra.dataCompra.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        R$ {compra.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs ${
                        compra.status === 'ativa' ? 'text-green-600' :
                        compra.status === 'vencida' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {compra.status.charAt(0).toUpperCase() + compra.status.slice(1)}
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
