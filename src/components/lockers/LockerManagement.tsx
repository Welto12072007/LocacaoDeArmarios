import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, MapPin, DollarSign } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import { Locker } from '../../types';
import { apiService } from '../../services/api';

const LockerManagement: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLockers();
  }, [currentPage]);

  const loadLockers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLockers(currentPage, 10);
      setLockers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading lockers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Locker['status']) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', label: 'Disponível' },
      rented: { color: 'bg-blue-100 text-blue-800', label: 'Locado' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Manutenção' },
      reserved: { color: 'bg-purple-100 text-purple-800', label: 'Reservado' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getSizeBadge = (size: Locker['size']) => {
    const sizeConfig = {
      small: { color: 'bg-gray-100 text-gray-800', label: 'Pequeno' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Médio' },
      large: { color: 'bg-indigo-100 text-indigo-800', label: 'Grande' },
    };

    const config = sizeConfig[size];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'number',
      label: 'Número',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Localização',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'size',
      label: 'Tamanho',
      render: (value: Locker['size']) => getSizeBadge(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Locker['status']) => getStatusBadge(value),
    },
    {
      key: 'monthlyPrice',
      label: 'Preço Mensal',
      render: (value: number) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span>R$ {value.toLocaleString('pt-BR')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (value: any, row: Locker) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => handleEdit(row.id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    console.log('Add new locker');
    // In a real app, open modal or navigate to form
  };

  const handleEdit = (id: string) => {
    console.log('Edit locker:', id);
    // In a real app, open modal or navigate to form
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este armário?')) {
      try {
        await apiService.deleteLocker(id);
        loadLockers();
      } catch (error) {
        console.error('Error deleting locker:', error);
      }
    }
  };

  return (
    <Layout currentPage="lockers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Armários</h1>
            <p className="text-gray-600">Gerencie todos os armários do sistema</p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Novo Armário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Disponíveis</dt>
                    <dd className="text-lg font-medium text-gray-900">45</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Locados</dt>
                    <dd className="text-lg font-medium text-gray-900">98</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Manutenção</dt>
                    <dd className="text-lg font-medium text-gray-900">7</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">150</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lockers Table */}
        <Table
          columns={columns}
          data={lockers}
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            total,
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    </Layout>
  );
};

export default LockerManagement;