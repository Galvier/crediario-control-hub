
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { creditClientService } from '@/services/creditClientService';
import { purchaseService } from '@/services/purchaseService';
import { CreditClient, Purchase } from '@/types/appwrite';

const OperacoesManager: React.FC = () => {
  const { company } = useAuth();
  const [clientes, setClientes] = useState<CreditClient[]>([]);
  const [compras, setCompras] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (company) {
      loadData();
    }
  }, [company]);

  const loadData = async () => {
    try {
      if (!company) return;
      
      const [clientesData, comprasData] = await Promise.all([
        creditClientService.getCreditClientsByCompany(company.$id),
        purchaseService.getPurchasesByCompany(company.$id)
      ]);
      
      setClientes(clientesData.filter(c => c.status === 'approved'));
      setCompras(comprasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompras = compras.filter(compra => {
    const cliente = clientes.find(c => c.$id === compra.creditClientId);
    return cliente?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cliente?.cpf.includes(searchTerm);
  });

  const calculateAvailableLimit = (clientId: string) => {
    const cliente = clientes.find(c => c.$id === clientId);
    if (!cliente) return 0;
    
    const clientCompras = compras.filter(c => 
      c.creditClientId === clientId && (c.status === 'active' || c.status === 'overdue')
    );
    const usedLimit = clientCompras.reduce((sum, c) => sum + c.value, 0);
    return cliente.approvedLimit - usedLimit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cliente = clientes.find(c => c.$id === selectedClienteId);
    const valorNumerico = parseFloat(valor);
    
    if (!cliente) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    const availableLimit = calculateAvailableLimit(selectedClienteId);
    if (valorNumerico > availableLimit) {
      toast.error('Valor excede o limite disponível do cliente');
      return;
    }
    
    try {
      await purchaseService.createPurchase({
        creditClientId: selectedClienteId,
        value: valorNumerico,
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      
      toast.success('Compra registrada com sucesso!');
      setIsDialogOpen(false);
      setSelectedClienteId('');
      setValor('');
      loadData();
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Erro ao registrar compra');
    }
  };

  const handleStatusChange = async (compraId: string, newStatus: 'active' | 'overdue' | 'paid') => {
    try {
      await purchaseService.updatePurchaseStatus(compraId, newStatus);
      toast.success('Status atualizado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'overdue': return 'Vencida';
      case 'paid': return 'Paga';
      default: return status;
    }
  };

  const clienteParaExtrato = selectedCliente ? clientes.find(c => c.$id === selectedCliente) : null;
  const comprasCliente = selectedCliente ? compras.filter(c => c.creditClientId === selectedCliente) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Operações</h1>
          <p className="text-gray-600 mt-2">Registre compras e gerencie operações de crédito</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg">
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Compra</DialogTitle>
              <DialogDescription>
                Selecione o cliente e informe o valor da compra
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select value={selectedClienteId} onValueChange={setSelectedClienteId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => {
                      const availableLimit = calculateAvailableLimit(cliente.$id);
                      return (
                        <SelectItem key={cliente.$id} value={cliente.$id}>
                          {cliente.name} - Limite: R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">Valor da Compra (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-bg">
                  Registrar Compra
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Operações Recentes</CardTitle>
                <CardDescription>
                  {compras.length} operação(ões) registrada(s)
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCompras.map((compra) => {
                const cliente = clientes.find(c => c.$id === compra.creditClientId);
                return (
                  <Card key={compra.$id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cliente?.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(compra.purchaseDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              R$ {compra.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Venc: {new Date(compra.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <Select
                            value={compra.status}
                            onValueChange={(value) => handleStatusChange(compra.$id, value as any)}
                          >
                            <SelectTrigger className="w-24">
                              <Badge className={getStatusColor(compra.status)}>
                                {getStatusLabel(compra.status)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativa</SelectItem>
                              <SelectItem value="overdue">Vencida</SelectItem>
                              <SelectItem value="paid">Paga</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCliente(compra.creditClientId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extrato do Cliente</CardTitle>
            <CardDescription>
              {clienteParaExtrato ? `Extrato de ${clienteParaExtrato.name}` : 'Selecione uma operação para ver o extrato'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clienteParaExtrato ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Limite Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {clienteParaExtrato.approvedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Limite Disponível</p>
                    <p className="text-lg font-semibold text-primary">
                      R$ {calculateAvailableLimit(clienteParaExtrato.$id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Histórico de Compras</h4>
                  {comprasCliente.map((compra) => (
                    <div key={compra.$id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(compra.purchaseDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Venc: {new Date(compra.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            R$ {compra.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(compra.status)}>
                          {getStatusLabel(compra.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Clique no ícone de visualização de uma operação para ver o extrato do cliente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperacoesManager;
