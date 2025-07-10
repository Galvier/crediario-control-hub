
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, Search, DollarSign, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

const OperacoesManager: React.FC = () => {
  const { user } = useAuth();
  const { clientes, compras, addCompra, updateCompra } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);

  const clientesEmpresa = clientes.filter(c => c.empresaId === user?.empresaId && c.aprovado);
  const comprasEmpresa = compras.filter(c => c.empresaId === user?.empresaId);

  const filteredCompras = comprasEmpresa.filter(compra => {
    const cliente = clientesEmpresa.find(c => c.id === compra.clienteId);
    return cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cliente?.cpf.includes(searchTerm);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cliente = clientesEmpresa.find(c => c.id === selectedClienteId);
    const valorNumerico = parseFloat(valor);
    
    if (!cliente) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    if (valorNumerico > cliente.limiteDisponivel) {
      toast.error('Valor excede o limite disponível do cliente');
      return;
    }
    
    addCompra({
      clienteId: selectedClienteId,
      empresaId: user?.empresaId!,
      valor: valorNumerico,
      dataCompra: new Date(),
      status: 'ativa'
    });
    
    toast.success('Compra registrada com sucesso!');
    setIsDialogOpen(false);
    setSelectedClienteId('');
    setValor('');
  };

  const handleStatusChange = (compraId: string, newStatus: 'ativa' | 'vencida' | 'paga') => {
    updateCompra(compraId, { status: newStatus });
    toast.success('Status atualizado com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'paga': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clienteParaExtrato = selectedCliente ? clientesEmpresa.find(c => c.id === selectedCliente) : null;
  const comprasCliente = selectedCliente ? comprasEmpresa.filter(c => c.clienteId === selectedCliente) : [];

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
                    {clientesEmpresa.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} - Limite: R$ {cliente.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
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
                  {comprasEmpresa.length} operação(ões) registrada(s)
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
                const cliente = clientesEmpresa.find(c => c.id === compra.clienteId);
                return (
                  <Card key={compra.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cliente?.nome}</p>
                            <p className="text-sm text-gray-600">
                              {compra.dataCompra.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              R$ {compra.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Venc: {compra.dataVencimento.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <Select
                            value={compra.status}
                            onValueChange={(value) => handleStatusChange(compra.id, value as any)}
                          >
                            <SelectTrigger className="w-24">
                              <Badge className={getStatusColor(compra.status)}>
                                {compra.status.charAt(0).toUpperCase() + compra.status.slice(1)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativa">Ativa</SelectItem>
                              <SelectItem value="vencida">Vencida</SelectItem>
                              <SelectItem value="paga">Paga</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCliente(compra.clienteId)}
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
              {clienteParaExtrato ? `Extrato de ${clienteParaExtrato.nome}` : 'Selecione uma operação para ver o extrato'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clienteParaExtrato ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Limite Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      R$ {clienteParaExtrato.limiteAjustado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Limite Disponível</p>
                    <p className="text-lg font-semibold text-primary">
                      R$ {clienteParaExtrato.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Histórico de Compras</h4>
                  {comprasCliente.map((compra) => (
                    <div key={compra.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {compra.dataCompra.toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Venc: {compra.dataVencimento.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            R$ {compra.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(compra.status)}>
                          {compra.status.charAt(0).toUpperCase() + compra.status.slice(1)}
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
