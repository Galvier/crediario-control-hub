import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Search, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { creditClientService } from '@/services/creditClientService';
import { purchaseService } from '@/services/purchaseService';
import { CreditClient, Purchase } from '@/types/appwrite';

const ClientesManager: React.FC = () => {
  const { company } = useAuth();
  const navigate = useNavigate();
  const [creditClients, setCreditClients] = useState<CreditClient[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    cpf: '',
    phone: '',
    income: 0,
    initialLimit: 1000,
    approvedLimit: 1000
  });

  useEffect(() => {
    if (company) {
      loadCreditClients();
      loadPurchases();
    }
  }, [company]);

  const loadCreditClients = async () => {
    try {
      if (!company) return;
      const clients = await creditClientService.getCreditClientsByCompany(company.$id);
      setCreditClients(clients);
    } catch (error) {
      console.error('Error loading credit clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchases = async () => {
    try {
      if (!company) return;
      const companyPurchases = await purchaseService.getPurchasesByCompany(company.$id);
      setPurchases(companyPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  const filteredClientes = creditClients.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm)
  );

  const calculateAvailableLimit = (clientId: string, approvedLimit: number) => {
    const clientPurchases = purchases.filter(p => 
      p.creditClientId === clientId && (p.status === 'active' || p.status === 'overdue')
    );
    const usedLimit = clientPurchases.reduce((sum, purchase) => sum + purchase.value, 0);
    return approvedLimit - usedLimit;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      cpf: '',
      phone: '',
      income: 0,
      initialLimit: 1000,
      approvedLimit: 1000
    });
    setEditingCliente(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Endereço é obrigatório');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company || !validateForm()) return;

    try {
      if (editingCliente) {
        await creditClientService.updateCreditClient(editingCliente, {
          ...formData,
        });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await creditClientService.createCreditClient({
          ...formData,
          companyId: company.$id,
          status: 'pending'
        });
        toast.success('Cliente cadastrado com sucesso!');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadCreditClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleEdit = (cliente: CreditClient) => {
    setFormData({
      name: cliente.name,
      address: cliente.address,
      email: cliente.email,
      cpf: cliente.cpf,
      phone: cliente.phone,
      income: cliente.income,
      initialLimit: cliente.initialLimit,
      approvedLimit: cliente.approvedLimit
    });
    setEditingCliente(cliente.$id);
    setIsDialogOpen(true);
  };

  const handleApprove = async (clienteId: string) => {
    try {
      await creditClientService.approveCreditClient(clienteId);
      toast.success('Crédito aprovado com sucesso!');
      loadCreditClients();
    } catch (error) {
      console.error('Error approving client:', error);
      toast.error('Erro ao aprovar cliente');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="text-gray-600 mt-2">Cadastre e gerencie seus clientes de crédito</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para análise de crédito
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="João da Silva"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Endereço completo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="joao@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Renda (R$)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({...formData, income: parseFloat(e.target.value) || 0})}
                    placeholder="3000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initialLimit">Limite Inicial (R$)</Label>
                  <Input
                    id="initialLimit"
                    type="number"
                    value={formData.initialLimit}
                    onChange={(e) => setFormData({...formData, initialLimit: parseFloat(e.target.value) || 0})}
                    placeholder="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="approvedLimit">Limite Ajustado (R$)</Label>
                  <Input
                    id="approvedLimit"
                    type="number"
                    value={formData.approvedLimit}
                    onChange={(e) => setFormData({...formData, approvedLimit: parseFloat(e.target.value) || 0})}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-bg">
                  {editingCliente ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes Cadastrados</CardTitle>
              <CardDescription>
                {creditClients.length} cliente(s) cadastrado(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClientes.map((cliente) => {
              const availableLimit = calculateAvailableLimit(cliente.$id, cliente.approvedLimit);
              return (
                <Card key={cliente.$id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {cliente.name}
                            </h3>
                            <Badge variant={cliente.status === 'approved' ? "default" : "secondary"}>
                              {cliente.status === 'approved' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprovado
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Pendente
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">CPF: {cliente.cpf}</p>
                          <p className="text-sm text-gray-600">{cliente.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">Limite disponível</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            R$ {cliente.approvedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500">Limite total</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {cliente.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/clientes/${cliente.$id}/extrato`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Extrato
                            </Button>
                          )}
                          {cliente.status !== 'approved' && (
                            <Button
                              size="sm"
                              className="gradient-bg"
                              onClick={() => handleApprove(cliente.$id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesManager;
