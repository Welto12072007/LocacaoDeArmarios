import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import { apiService } from '../../services/api';
import { Local } from '../../types';

const LocalManagement: React.FC = () => {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadLocais();
  }, [currentPage]);

  const loadLocais = async () => {
    try {
      setLoading(true);
      const result = await apiService.getLocais(currentPage, 10);
      setLocais(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading locais:', error);
      alert('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setNome('');
    setDescricao('');
    setIsModalOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const local = await apiService.getLocal(id);
      setEditingId(id);
      setNome(local.nome || '');
      setDescricao(local.descricao || '');
      setIsModalOpen(true);
    } catch (error) {
      alert('Erro ao carregar local para edição');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      alert('O campo nome é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      if (editingId) {
        await apiService.updateLocal(editingId, { nome, descricao });
      } else {
        await apiService.createLocal({ nome, descricao });
      }

      setIsModalOpen(false);
      setEditingId(null);
      loadLocais();
    } catch (error: any) {
      alert('Erro ao salvar local: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este local?')) {
      try {
        await apiService.deleteLocal(id);
        loadLocais();
      } catch (error) {
        console.error('Error deleting local:', error);
        alert('Erro ao deletar local: ' + (error as Error).message);
      }
    }
  };

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, row: Local) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleEdit(row.id)} />
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

  return (
    <Layout currentPage="locais">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Locais</h1>
            <p className="text-gray-600">Gerencie todos os locais do sistema</p>
          </div>
          <Button icon={Plus} onClick={handleAdd}>
            Novo Local
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Editar Local' : 'Novo Local'}
              </h2>
              <input
                type="text"
                placeholder="Nome"
                className="border p-2 w-full mb-3"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={saving}
              />
              <textarea
                placeholder="Descrição"
                className="border p-2 w-full mb-3"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={saving}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-500 text-sm font-medium truncate">Total de Locais</h3>
            <p className="text-lg font-medium text-gray-900">{total}</p>
          </div>
        </div>

        <Table
          columns={columns}
          data={locais}
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

export default LocalManagement;
