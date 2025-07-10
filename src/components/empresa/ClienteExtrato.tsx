
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { creditClientService } from '@/services/creditClientService';
import { purchaseService } from '@/services/purchaseService';
import { CreditClient, Purchase } from '@/types/appwrite';

const ClienteExtrato: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<CreditClient | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    value: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (clientId) {
      loadClientData();
      loadPurchases();
    }
  }, [clientId]);

  useEffect(() => {
    filterPurchases();
  }, [purchases, statusFilter]);

  const loadClientData = async () => {
    try {
      if (!clientId) return;
      const clientData = await creditClientService.getCreditClient(clientId);
      setClient(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      toast.error('Erro ao carregar dados do cliente');
      navigate('/clientes');
    }
  };

  const loadPurchases = async () => {
    try {
      if (!clientId) return;
      const clientPurchases = await purchaseService.getPurchasesByClient(clientId);
      setPurchases(clientPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Erro ao carregar compras');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;
    if (statusFilter !== 'all') {
      filtered = purchases.filter(purchase => purchase.status === statusFilter);
    }
    setFilteredPurchases(filtered);
  };

  const calculateAvailableLimit = () => {
    if (!client) return 0;
    const usedLimit = purchases
      .filter(p => p.status === 'active' || p.status === 'overdue')
      .reduce((sum, purchase) => sum + purchase.value, 0);
    return client.approvedLimit - usedLimit;
  };

  const validatePurchase = () => {
    const value = parseFloat(formData.value);
    if (!value || value <= 0) {
      toast.error('Valor da compra deve ser maior que zero');
      return false;
    }
    
    const availableLimit = calculateAvailableLimit();
    if (value > availableLimit) {
      toast.error('Valor excede o limite disponível do cliente');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client || !validatePurchase()) return;

    try {
      await purchaseService.createPurchase({
        creditClientId: client.$id,
        value: parseFloat(formData.value),
        purchaseDate: formData.purchaseDate,
        status: 'active'
      });
      
      toast.success('Compra registrada com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        value: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      loadPurchases();
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Erro ao registrar compra');
    }
  };

  const handleStatusChange = async (purchaseId: string, newStatus: 'active' | 'overdue' | 'paid') => {
    try {
      await purchaseService.updatePurchaseStatus(purchaseId, newStatus);
      toast.success('Status atualizado com sucesso!');
      loadPurchases();
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

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const availableLimit = calculateAvailableLimit();
  const totalPurchases = purchases.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Extrato do Cliente</h1>
            <p className="text-gray-600 mt-2">{client.name} - CPF: {client.cpf}</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg" disabled={client.status !== 'approved'}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Compra</DialogTitle>
              <DialogDescription>
                Registre uma nova compra no crediário do cliente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor da Compra (R$) *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-500">
                  Limite disponível: R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Data da Compra *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Limite Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              R$ {client.approvedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span>Limite Disponível</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Total Compras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              R$ {totalPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Compras</CardTitle>
              <CardDescription>
                {purchases.length} compra(s) registrada(s)
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.$id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Compra de R$ {purchase.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Vencimento</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(purchase.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <Select
                        value={purchase.status}
                        onValueChange={(value) => handleStatusChange(purchase.$id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStatusColor(purchase.status)}>
                            {getStatusLabel(purchase.status)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="overdue">Vencida</SelectItem>
                          <SelectItem value="paid">Paga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma compra encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteExtrato;
