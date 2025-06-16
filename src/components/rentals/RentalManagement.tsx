import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Package, Users, DollarSign, Clock } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import { Rental } from '../../types';
import { apiService } from '../../services/api';

const RentalManagement: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadRentals();
  }, [currentPage]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRentals(currentPage, 10);
      setRentals(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Rental['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Em Atraso' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Concluída' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelada' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Rental['paymentStatus']) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Pago' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Em Atraso' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const columns = [
    {
      key: 'locker',
      label: 'Armário',
      render: (value: any, row: Rental) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.locker?.number || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {row.locker?.location || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Aluno',
      render: (value: any, row: Rental) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {row.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'N/A'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.student?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {row.student?.studentId || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Período',
      render: (value: any, row: Rental) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">
              {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Valor Total',
      render: (value: number) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-900">
            R$ {value.toLocaleString('pt-BR')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Rental['status']) => getStatusBadge(value),
    },
    {
      key: 'paymentStatus',
      label: 'Pagamento',
      render: (value: Rental['paymentStatus']) => getPaymentStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (value: any, row: Rental) => (
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
    console.log('Add new rental');
    // In a real app, open modal or navigate to form
  };

  const handleEdit = (id: string) => {
    console.log('Edit rental:', id);
    // In a real app, open modal or navigate to form
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta locação?')) {
      try {
        await apiService.deleteRental(id);
        loadRentals();
      } catch (error) {
        console.error('Error deleting rental:', error);
      }
    }
  };

  return (
    <Layout currentPage="rentals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Locações</h1>
            <p className="text-gray-600">Gerencie todas as locações de armários</p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Nova Locação
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Locações Ativas</dt>
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
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Em Atraso</dt>
                    <dd className="text-lg font-medium text-gray-900">12</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Receita Mensal</dt>
                    <dd className="text-lg font-medium text-gray-900">R$ 29.400</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Concluídas</dt>
                    <dd className="text-lg font-medium text-gray-900">247</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rentals Table */}
        <Table
          columns={columns}
          data={rentals}
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

export default RentalManagement;