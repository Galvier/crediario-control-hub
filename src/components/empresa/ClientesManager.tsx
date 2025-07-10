
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ClientesManager: React.FC = () => {
  const { user } = useAuth();
  const { clientes, addCliente, updateCliente } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    email: '',
    cpf: '',
    telefone: '',
    renda: 0,
    limiteInicial: 1000,
    limiteAjustado: 1000
  });

  const clientesEmpresa = clientes.filter(c => c.empresaId === user?.empresaId);
  const filteredClientes = clientesEmpresa.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      nome: '',
      endereco: '',
      email: '',
      cpf: '',
      telefone: '',
      renda: 0,
      limiteInicial: 1000,
      limiteAjustado: 1000
    });
    setEditingCliente(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCliente) {
      updateCliente(editingCliente, {
        ...formData,
        limiteDisponivel: formData.limiteAjustado
      });
      toast.success('Cliente atualizado com sucesso!');
    } else {
      addCliente({
        ...formData,
        empresaId: user?.empresaId!,
        limiteDisponivel: formData.limiteAjustado,
        aprovado: false
      });
      toast.success('Cliente cadastrado com sucesso!');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (cliente: any) => {
    setFormData({
      nome: cliente.nome,
      endereco: cliente.endereco,
      email: cliente.email,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      renda: cliente.renda,
      limiteInicial: cliente.limiteInicial,
      limiteAjustado: cliente.limiteAjustado
    });
    setEditingCliente(cliente.id);
    setIsDialogOpen(true);
  };

  const handleApprove = (clienteId: string) => {
    updateCliente(clienteId, { aprovado: true });
    toast.success('Crédito aprovado com sucesso!');
  };

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
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
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
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
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
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="renda">Renda (R$)</Label>
                  <Input
                    id="renda"
                    type="number"
                    value={formData.renda}
                    onChange={(e) => setFormData({...formData, renda: parseFloat(e.target.value)})}
                    placeholder="3000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limiteInicial">Limite Inicial (R$)</Label>
                  <Input
                    id="limiteInicial"
                    type="number"
                    value={formData.limiteInicial}
                    onChange={(e) => setFormData({...formData, limiteInicial: parseFloat(e.target.value)})}
                    placeholder="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limiteAjustado">Limite Ajustado (R$)</Label>
                  <Input
                    id="limiteAjustado"
                    type="number"
                    value={formData.limiteAjustado}
                    onChange={(e) => setFormData({...formData, limiteAjustado: parseFloat(e.target.value)})}
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
                {clientesEmpresa.length} cliente(s) cadastrado(s)
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
            {filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cliente.nome}
                          </h3>
                          <Badge variant={cliente.aprovado ? "default" : "secondary"}>
                            {cliente.aprovado ? (
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
                        <p className="text-sm text-gray-600">{cliente.telefone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          R$ {cliente.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">Limite disponível</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          R$ {cliente.limiteAjustado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">Limite total</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!cliente.aprovado && (
                          <Button
                            size="sm"
                            className="gradient-bg"
                            onClick={() => handleApprove(cliente.id)}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesManager;
