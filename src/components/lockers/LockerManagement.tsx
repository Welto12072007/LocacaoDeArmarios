import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Package } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import { Locker } from '../../types';
import { apiService } from '../../services/api';
import LockerModal from './LockerModal'; // importe o modal criado

const LockerManagement: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [countAvailable, setCountAvailable] = useState(0);
  const [countRented, setCountRented] = useState(0);
  const [countMaintenance, setCountMaintenance] = useState(0);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);

  useEffect(() => {
    loadLockers();
  }, [currentPage]);

  useEffect(() => {
    loadLockerStats();
  }, []);

  const loadLockers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLockers(currentPage, 10);
      setLockers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar armários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLockerStats = async () => {
    try {
      const response = await apiService.getLockers(1, 1000);
      const lockersAll = response.data;

      setCountAvailable(lockersAll.filter(l => l.status === 'disponível').length);
      setCountRented(lockersAll.filter(l => l.status === 'alugado').length);
      setCountMaintenance(lockersAll.filter(l => l.status === 'manutenção').length);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de armários:', error);
    }
  };

  const getStatusBadge = (status: Locker['status']) => {
    const map = {
      'disponível': 'bg-green-100 text-green-800',
      'alugado': 'bg-blue-100 text-blue-800',
      'manutenção': 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${map[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'numero',
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
      key: 'localizacao',
      label: 'Localização',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Locker['status']) => getStatusBadge(value),
    },
    {
      key: 'observacoes',
      label: 'Observações',
      render: (value: string) => <span className="text-sm text-gray-700">{value || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Locker) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => {
              setEditingLocker(row);
              setModalOpen(true);
            }}
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
    setEditingLocker(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este armário?')) {
      try {
        await apiService.deleteLocker(id.toString());
        await loadLockers();
        await loadLockerStats();
      } catch (error) {
        console.error('Erro ao excluir armário:', error);
      }
    }
  };

  const handleSave = async (lockerData: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>, id?: number) => {
    try {
      if (id) {
        await apiService.updateLocker(id.toString(), lockerData);
      } else {
        await apiService.createLocker(lockerData);
      }
      await loadLockers();
      await loadLockerStats();
    } catch (error) {
      console.error('Erro ao salvar armário:', error);
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
                    <dd className="text-lg font-medium text-gray-900">{countAvailable}</dd>
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
                    <dd className="text-lg font-medium text-gray-900">{countRented}</dd>
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
                    <dd className="text-lg font-medium text-gray-900">{countMaintenance}</dd>
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
                    <dd className="text-lg font-medium text-gray-900">{total}</dd>
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

        {/* Modal para adicionar/editar */}
        <LockerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initialData={editingLocker}
        />
      </div>
    </Layout>
  );
};

export default LockerManagement;
