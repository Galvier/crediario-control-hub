
import React, { createContext, useContext, useState } from 'react';
import { Empresa } from '@/types/empresa';
import { Cliente, Compra } from '@/types/cliente';

interface DataContextType {
  empresas: Empresa[];
  clientes: Cliente[];
  compras: Compra[];
  addEmpresa: (empresa: Omit<Empresa, 'id' | 'createdAt'>) => void;
  updateEmpresa: (id: string, empresa: Partial<Empresa>) => void;
  deleteEmpresa: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  addCompra: (compra: Omit<Compra, 'id' | 'createdAt' | 'dataVencimento'>) => void;
  updateCompra: (id: string, compra: Partial<Compra>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const mockEmpresas: Empresa[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    nomeEmpresa: 'Loja ABC Ltda',
    endereco: 'Rua das Flores, 123, Centro',
    telefone: '(11) 99999-9999',
    emailProprietarios: 'proprietario@lojaabc.com',
    telefoneFinanceiro: '(11) 88888-8888',
    emailFinanceiro: 'financeiro@lojaabc.com',
    percentualAcordado: 3.5,
    createdAt: new Date(),
    userId: '2'
  }
];

const mockClientes: Cliente[] = [
  {
    id: '1',
    empresaId: '1',
    nome: 'João da Silva',
    endereco: 'Rua A, 456',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    telefone: '(11) 77777-7777',
    renda: 3000,
    limiteInicial: 1000,
    limiteAjustado: 1200,
    limiteDisponivel: 800,
    aprovado: true,
    createdAt: new Date()
  }
];

const mockCompras: Compra[] = [
  {
    id: '1',
    clienteId: '1',
    empresaId: '1',
    valor: 400,
    dataCompra: new Date(),
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'ativa',
    createdAt: new Date()
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresas);
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [compras, setCompras] = useState<Compra[]>(mockCompras);

  const addEmpresa = (empresaData: Omit<Empresa, 'id' | 'createdAt'>) => {
    const newEmpresa: Empresa = {
      ...empresaData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setEmpresas(prev => [...prev, newEmpresa]);
  };

  const updateEmpresa = (id: string, empresaData: Partial<Empresa>) => {
    setEmpresas(prev => prev.map(empresa => 
      empresa.id === id ? { ...empresa, ...empresaData } : empresa
    ));
  };

  const deleteEmpresa = (id: string) => {
    setEmpresas(prev => prev.filter(empresa => empresa.id !== id));
  };

  const addCliente = (clienteData: Omit<Cliente, 'id' | 'createdAt'>) => {
    const newCliente: Cliente = {
      ...clienteData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClientes(prev => [...prev, newCliente]);
  };

  const updateCliente = (id: string, clienteData: Partial<Cliente>) => {
    setClientes(prev => prev.map(cliente => 
      cliente.id === id ? { ...cliente, ...clienteData } : cliente
    ));
  };

  const addCompra = (compraData: Omit<Compra, 'id' | 'createdAt' | 'dataVencimento'>) => {
    const dataVencimento = new Date(compraData.dataCompra);
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    const newCompra: Compra = {
      ...compraData,
      id: Date.now().toString(),
      dataVencimento,
      createdAt: new Date()
    };

    setCompras(prev => [...prev, newCompra]);

    // Update cliente's available limit
    updateCliente(compraData.clienteId, {
      limiteDisponivel: clientes.find(c => c.id === compraData.clienteId)?.limiteDisponivel! - compraData.valor
    });
  };

  const updateCompra = (id: string, compraData: Partial<Compra>) => {
    setCompras(prev => prev.map(compra => 
      compra.id === id ? { ...compra, ...compraData } : compra
    ));
  };

  return (
    <DataContext.Provider value={{
      empresas,
      clientes,
      compras,
      addEmpresa,
      updateEmpresa,
      deleteEmpresa,
      addCliente,
      updateCliente,
      addCompra,
      updateCompra
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
