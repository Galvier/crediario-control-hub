
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const EmpresasManager: React.FC = () => {
  const { empresas, addEmpresa, updateEmpresa, deleteEmpresa } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cnpj: '',
    nomeEmpresa: '',
    endereco: '',
    telefone: '',
    emailProprietarios: '',
    telefoneFinanceiro: '',
    emailFinanceiro: '',
    percentualAcordado: 0
  });

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      cnpj: '',
      nomeEmpresa: '',
      endereco: '',
      telefone: '',
      emailProprietarios: '',
      telefoneFinanceiro: '',
      emailFinanceiro: '',
      percentualAcordado: 0
    });
    setEditingEmpresa(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmpresa) {
      updateEmpresa(editingEmpresa, formData);
      toast.success('Empresa atualizada com sucesso!');
    } else {
      addEmpresa(formData);
      toast.success('Empresa cadastrada com sucesso!');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (empresa: any) => {
    setFormData({
      cnpj: empresa.cnpj,
      nomeEmpresa: empresa.nomeEmpresa,
      endereco: empresa.endereco,
      telefone: empresa.telefone,
      emailProprietarios: empresa.emailProprietarios,
      telefoneFinanceiro: empresa.telefoneFinanceiro,
      emailFinanceiro: empresa.emailFinanceiro,
      percentualAcordado: empresa.percentualAcordado
    });
    setEditingEmpresa(empresa.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      deleteEmpresa(id);
      toast.success('Empresa excluída com sucesso!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Empresas</h1>
          <p className="text-gray-600 mt-2">Cadastre e gerencie empresas clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da empresa cliente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                  <Input
                    id="nomeEmpresa"
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                    placeholder="Razão Social"
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
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailProprietarios">Email Proprietários *</Label>
                  <Input
                    id="emailProprietarios"
                    type="email"
                    value={formData.emailProprietarios}
                    onChange={(e) => setFormData({...formData, emailProprietarios: e.target.value})}
                    placeholder="proprietario@empresa.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefoneFinanceiro">Telefone Financeiro</Label>
                  <Input
                    id="telefoneFinanceiro"
                    value={formData.telefoneFinanceiro}
                    onChange={(e) => setFormData({...formData, telefoneFinanceiro: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailFinanceiro">Email Financeiro</Label>
                  <Input
                    id="emailFinanceiro"
                    type="email"
                    value={formData.emailFinanceiro}
                    onChange={(e) => setFormData({...formData, emailFinanceiro: e.target.value})}
                    placeholder="financeiro@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualAcordado">Percentual Acordado (%)</Label>
                <Input
                  id="percentualAcordado"
                  type="number"
                  step="0.1"
                  value={formData.percentualAcordado}
                  onChange={(e) => setFormData({...formData, percentualAcordado: parseFloat(e.target.value)})}
                  placeholder="3.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-bg">
                  {editingEmpresa ? 'Atualizar' : 'Cadastrar'}
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
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>
                {empresas.length} empresa(s) cadastrada(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmpresas.map((empresa) => (
              <Card key={empresa.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {empresa.nomeEmpresa}
                        </h3>
                        <p className="text-sm text-gray-600">CNPJ: {empresa.cnpj}</p>
                        <p className="text-sm text-gray-600">{empresa.endereco}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {empresa.percentualAcordado}%
                        </p>
                        <p className="text-xs text-gray-500">Taxa acordada</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(empresa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(empresa.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

export default EmpresasManager;
