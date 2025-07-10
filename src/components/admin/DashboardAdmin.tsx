
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

const DashboardAdmin: React.FC = () => {
  const { empresas, clientes, compras } = useData();

  const totalEmpresas = empresas.length;
  const totalClientes = clientes.length;
  const totalValorReceber = compras
    .filter(c => c.status === 'ativa' || c.status === 'vencida')
    .reduce((acc, c) => acc + c.valor, 0);
  
  const totalLimiteConcedido = clientes.reduce((acc, c) => acc + c.limiteAjustado, 0);

  const stats = [
    {
      title: 'Total de Empresas',
      value: totalEmpresas,
      description: 'Empresas cadastradas no sistema',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total de Clientes',
      value: totalClientes,
      description: 'Clientes de crédito cadastrados',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Valores a Receber',
      value: `R$ ${totalValorReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: 'Total em operações ativas',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Limite Concedido',
      value: `R$ ${totalLimiteConcedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: 'Total de crédito aprovado',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema de crédito</p>
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
            <CardTitle>Empresas Recentes</CardTitle>
            <CardDescription>Últimas empresas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {empresas.slice(-5).map((empresa) => (
                <div key={empresa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{empresa.nomeEmpresa}</p>
                    <p className="text-sm text-gray-600">{empresa.cnpj}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {empresa.percentualAcordado}%
                    </p>
                    <p className="text-xs text-gray-500">Taxa acordada</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo por Empresa</CardTitle>
            <CardDescription>Performance das empresas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {empresas.map((empresa) => {
                const clientesEmpresa = clientes.filter(c => c.empresaId === empresa.id);
                const comprasEmpresa = compras.filter(c => c.empresaId === empresa.id);
                const valorReceber = comprasEmpresa
                  .filter(c => c.status === 'ativa' || c.status === 'vencida')
                  .reduce((acc, c) => acc + c.valor, 0);

                return (
                  <div key={empresa.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{empresa.nomeEmpresa}</h4>
                      <span className="text-sm text-gray-500">{clientesEmpresa.length} clientes</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Valor a Receber: R$ {valorReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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

export default DashboardAdmin;
