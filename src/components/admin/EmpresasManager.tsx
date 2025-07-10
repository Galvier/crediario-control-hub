import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services/companyService';
import { authService } from '@/services/authService';
import { Company } from '@/types/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const EmpresasManager: React.FC = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    cnpj: '',
    name: '',
    address: '',
    ownerPhone: '',
    ownerEmail: '',
    financialPhone: '',
    financialEmail: '',
    agreedPercentage: 0,
    userEmail: '',
    userPassword: '',
    userName: ''
  });

  useEffect(() => {
    if (user?.prefs.role === 'admin') {
      loadEmpresas();
    }
  }, [user]);

  const loadEmpresas = async () => {
    try {
      setIsLoading(true);
      const companies = await companyService.getCompanies();
      setEmpresas(companies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      cnpj: '',
      name: '',
      address: '',
      ownerPhone: '',
      ownerEmail: '',
      financialPhone: '',
      financialEmail: '',
      agreedPercentage: 0,
      userEmail: '',
      userPassword: '',
      userName: ''
    });
    setEditingEmpresa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmpresa) {
        await companyService.updateCompany(editingEmpresa, {
          cnpj: formData.cnpj,
          name: formData.name,
          address: formData.address,
          ownerPhone: formData.ownerPhone,
          ownerEmail: formData.ownerEmail,
          financialPhone: formData.financialPhone,
          financialEmail: formData.financialEmail,
          agreedPercentage: formData.agreedPercentage
        });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        // Create user first - fix: pass individual parameters instead of object
        const newUser = await authService.createUser(
          formData.userEmail,
          formData.userPassword,
          formData.userName,
          'empresa'
        );

        // Then create company
        await companyService.createCompany({
          cnpj: formData.cnpj,
          name: formData.name,
          address: formData.address,
          ownerPhone: formData.ownerPhone,
          ownerEmail: formData.ownerEmail,
          financialPhone: formData.financialPhone,
          financialEmail: formData.financialEmail,
          agreedPercentage: formData.agreedPercentage,
          userId: newUser.$id
        });
        toast.success('Empresa cadastrada com sucesso!');
      }
      
      await loadEmpresas();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleEdit = (empresa: Company) => {
    setFormData({
      cnpj: empresa.cnpj,
      name: empresa.name,
      address: empresa.address,
      ownerPhone: empresa.ownerPhone,
      ownerEmail: empresa.ownerEmail,
      financialPhone: empresa.financialPhone,
      financialEmail: empresa.financialEmail,
      agreedPercentage: empresa.agreedPercentage,
      userEmail: '',
      userPassword: '',
      userName: ''
    });
    setEditingEmpresa(empresa.$id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await companyService.deleteCompany(id);
        toast.success('Empresa excluída com sucesso!');
        await loadEmpresas();
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Erro ao excluir empresa');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Razão Social"
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
                  <Label htmlFor="ownerPhone">Telefone *</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email Proprietários *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                    placeholder="proprietario@empresa.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="financialPhone">Telefone Financeiro</Label>
                  <Input
                    id="financialPhone"
                    value={formData.financialPhone}
                    onChange={(e) => setFormData({...formData, financialPhone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="financialEmail">Email Financeiro</Label>
                  <Input
                    id="financialEmail"
                    type="email"
                    value={formData.financialEmail}
                    onChange={(e) => setFormData({...formData, financialEmail: e.target.value})}
                    placeholder="financeiro@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreedPercentage">Percentual Acordado (%)</Label>
                <Input
                  id="agreedPercentage"
                  type="number"
                  step="0.1"
                  value={formData.agreedPercentage}
                  onChange={(e) => setFormData({...formData, agreedPercentage: parseFloat(e.target.value)})}
                  placeholder="3.5"
                />
              </div>

              {!editingEmpresa && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium mb-4">Dados do Usuário da Empresa</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Nome do Usuário *</Label>
                        <Input
                          id="userName"
                          value={formData.userName}
                          onChange={(e) => setFormData({...formData, userName: e.target.value})}
                          placeholder="Nome completo"
                          required={!editingEmpresa}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email do Usuário *</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={formData.userEmail}
                          onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                          placeholder="usuario@empresa.com"
                          required={!editingEmpresa}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="userPassword">Senha do Usuário *</Label>
                        <Input
                          id="userPassword"
                          type="password"
                          value={formData.userPassword}
                          onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                          placeholder="Senha (mín. 8 caracteres)"
                          required={!editingEmpresa}
                          minLength={8}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

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
              <Card key={empresa.$id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {empresa.name}
                        </h3>
                        <p className="text-sm text-gray-600">CNPJ: {empresa.cnpj}</p>
                        <p className="text-sm text-gray-600">{empresa.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          {empresa.agreedPercentage}%
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
                          onClick={() => handleDelete(empresa.$id)}
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
