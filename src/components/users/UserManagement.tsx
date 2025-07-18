import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Shield, User, Mail, Calendar } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import UserModal from './UserModal';
import { User as UserType } from '../../types';
import { apiService } from '../../services/api';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers(currentPage, 10);
      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: UserType['role']) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrador', icon: Shield },
      user: { color: 'bg-blue-100 text-blue-800', label: 'Usuário', icon: User },
    };

    const config = roleConfig[role];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const columns = [
    {
      key: 'email',
      label: 'Usuário',
      sortable: true,
      render: (value: string, row: UserType) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {row.email.split('@')[0].slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Perfil',
      render: (value: UserType['role']) => getRoleBadge(value),
    },
    {
      key: 'failedLoginAttempts',
      label: 'Tentativas Falhas',
      render: (value: number) => (
        <span className={`text-sm ${value > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (value: any, row: UserType) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => handleEdit(row)}
            title="Editar usuário"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(row.id)}
            title="Excluir usuário"
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await apiService.deleteUser(id);
        loadUsers();
      } catch (error: any) {
        alert(error.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingUser(null);
    loadUsers();
  };

  return (
    <Layout currentPage="users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Novo Usuário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Administradores</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.role === 'admin').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Usuários</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.role === 'user').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Usuários</dt>
                    <dd className="text-lg font-medium text-gray-900">{total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Contas Bloqueadas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(u => u.failedLoginAttempts >= 5).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          data={users}
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            total,
            onPageChange: setCurrentPage,
          }}
        />

        {/* User Modal */}
        {showModal && (
          <UserModal
            user={editingUser}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;