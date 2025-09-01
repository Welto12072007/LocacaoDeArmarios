// src/components/rentals/RentalManagement.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Package, Users, DollarSign, Clock, X } from 'lucide-react';
import Layout from '../common/Layout';
import Button from '../common/Button';
import Table from '../common/Table';
import { Rental, Student, Locker } from '../../types';
import { apiService } from '../../services/api';

/** Tipos locais para o formulário */
type RentalStatus = 'active' | 'overdue' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'pending' | 'overdue';

interface RentalFormData {
  id?: string;
  lockerId: string;
  studentId: string;
  startDate: string;   // yyyy-mm-dd
  endDate: string;     // yyyy-mm-dd
  monthlyPrice: number;
  totalAmount: number;
  status: RentalStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

/** helpers **/
const formatDate = (dateString: string | Date) =>
  new Date(dateString).toLocaleDateString('pt-BR');

const monthsBetween = (startISO: string, endISO: string): number => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  // Se quisermos considerar “mês fechado” quando passar do dia
  if (end.getDate() >= start.getDate()) months += 1;

  return Math.max(0, months);
};

const initialForm: RentalFormData = {
  lockerId: '',
  studentId: '',
  startDate: '',
  endDate: '',
  monthlyPrice: 0,
  totalAmount: 0,
  status: 'active',
  paymentStatus: 'pending',
  notes: ''
};

const RentalManagement: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // modal
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RentalFormData>(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  // carregar dados
  useEffect(() => {
    void loadRentals();
  }, [currentPage]);

  useEffect(() => {
    // carregar alunos e armários só uma vez
    void (async () => {
      try {
        const [stud, lock] = await Promise.all([
          apiService.getStudents(1, 100),
          apiService.getLockers(1, 100)
        ]);
        setStudents(stud.data);
        setLockers(lock.data);
      } catch (err) {
        console.error('Erro ao carregar alunos/armários', err);
      }
    })();
  }, []);

  const loadRentals = async (): Promise<void> => {
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

  // recomputa totalAmount quando datas ou preço mudam
  useEffect(() => {
    if (form.startDate && form.endDate && form.monthlyPrice > 0) {
      const months = monthsBetween(form.startDate, form.endDate);
      setForm(prev => ({ ...prev, totalAmount: +(months * form.monthlyPrice).toFixed(2) }));
    }
  }, [form.startDate, form.endDate, form.monthlyPrice]);

  // helpers de exibição
  const labelLocker = (l: Locker): string => {
    // tenta diversos campos para evitar label “Nº ” vazio
    const number =
      // @ts-expect-error – lidando com possíveis variações vindas do backend
      (l as any).number ?? (l as any).numero ?? (l as any).num ?? l.id;
    const location =
      // @ts-expect-error – loc pode vir como string ou objeto
      (l as any).location ?? (l as any).local?.nome ?? (l as any).local ?? '';
    const price =
      // @ts-expect-error – idem para preço
      (l as any).monthlyPrice ?? (l as any).monthly_price ?? (l as any).precoMensal ?? '';
    const priceTxt = price ? ` • R$ ${Number(price).toLocaleString('pt-BR')}/mês` : '';
    return `Nº ${number}${location ? ` — ${location}` : ''}${priceTxt}`;
  };

  const getStatusBadge = (status: Rental['status']) => {
    const statusConfig: Record<RentalStatus, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Em Atraso' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Concluída' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelada' },
    };
    const config = statusConfig[status as RentalStatus] ?? statusConfig.active;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Rental['paymentStatus']) => {
    const statusConfig: Record<PaymentStatus, { color: string; label: string }> = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Pago' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Em Atraso' },
    };
    const config = statusConfig[status as PaymentStatus] ?? statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = useMemo(() => ([
    {
      key: 'locker',
      label: 'Armário',
      render: (_: unknown, row: Rental) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {
                // tenta exibir número/local vindos do backend no shape atual
                // @ts-expect-error variações possíveis
                (row as any).locker?.number ??
                // @ts-expect-error
                (row as any).locker?.numero ??
                // @ts-expect-error
                (row as any).locker?.id ?? 'N/A'
              }
            </div>
            <div className="text-xs text-gray-500">
              {
                // @ts-expect-error
                (row as any).locker?.location ??
                // @ts-expect-error
                (row as any).locker?.local?.nome ??
                'N/A'
              }
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Aluno',
      render: (_: unknown, row: Rental) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {
                  // @ts-expect-error nomes podem variar
                  ((row as any).student?.name as string | undefined)?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'N/A'
                }
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {
                // @ts-expect-error
                (row as any).student?.name ?? 'N/A'
              }
            </div>
            <div className="text-xs text-gray-500">
              {
                // @ts-expect-error studentId pode ser 'studentId' ou 'student_id'
                (row as any).student?.studentId ??
                // @ts-expect-error
                (row as any).student?.student_id ??
                'N/A'
              }
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Período',
      render: (_: unknown, row: Rental) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <div className="text-sm text-gray-900">
            {formatDate(
              // @ts-expect-error
              (row as any).startDate ?? (row as any).start_date
            )} - {formatDate(
              // @ts-expect-error
              (row as any).endDate ?? (row as any).end_date
            )}
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
            R$ {Number(value || 0).toLocaleString('pt-BR')}
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
      render: (_: unknown, row: Rental) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => handleEdit(
              // @ts-expect-error
              (row as any).id as string
            )}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(
              // @ts-expect-error
              (row as any).id as string
            )}
          />
        </div>
      ),
    },
  ]), [rentals]);

  /** Ações tabela **/
  const handleAdd = (): void => {
    setForm(initialForm);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEdit = (id: string): void => {
    const r = rentals.find(x => (x as any).id === id);
    if (!r) return;

    setForm({
      id,
      // @ts-expect-error
      lockerId: String((r as any).locker?.id ?? (r as any).lockerId ?? (r as any).locker_id ?? ''),
      // @ts-expect-error
      studentId: String((r as any).student?.id ?? (r as any).studentId ?? (r as any).student_id ?? ''),
      // @ts-expect-error
      startDate: ((r as any).startDate ?? (r as any).start_date ?? '').slice(0, 10),
      // @ts-expect-error
      endDate: ((r as any).endDate ?? (r as any).end_date ?? '').slice(0, 10),
      // @ts-expect-error
      monthlyPrice: Number((r as any).monthlyPrice ?? (r as any).monthly_price ?? 0),
      // @ts-expect-error
      totalAmount: Number((r as any).totalAmount ?? (r as any).total_amount ?? 0),
      // @ts-expect-error
      status: ((r as any).status as RentalStatus) ?? 'active',
      // @ts-expect-error
      paymentStatus: ((r as any).paymentStatus as PaymentStatus) ?? (r as any).payment_status ?? 'pending',
      // @ts-expect-error
      notes: (r as any).notes ?? ''
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir esta locação?')) {
      try {
        await apiService.deleteRental(id);
        await loadRentals();
      } catch (error) {
        console.error('Error deleting rental:', error);
        alert('Erro ao excluir locação');
      }
    }
  };

  /** submit do modal **/
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // valida mínimo
      if (!form.lockerId || !form.studentId || !form.startDate || !form.endDate) {
        alert('Preencha armário, aluno e as datas.');
        return;
      }
      if (form.monthlyPrice <= 0) {
        alert('Defina um preço mensal válido.');
        return;
      }

      // ========= INÍCIO DA CORREÇÃO =========
      const payload = {
        locker_id: form.lockerId,
        student_id: form.studentId,
        start_date: form.startDate,
        end_date: form.endDate,
        monthly_price: Number(form.monthlyPrice),
        total_amount: Number(form.totalAmount),
        status: form.status,
        payment_status: form.paymentStatus,
        notes: form.notes ?? ''
      };
      // ========= FIM DA CORREÇÃO =========

      if (isEditing && form.id) {
        await apiService.updateRental(form.id, payload);
      } else {
        await apiService.createRental(payload);
      }

      setIsOpen(false);
      setForm(initialForm);
      await loadRentals();
    } catch (error) {
      console.error('Erro ao salvar locação:', error);
      alert('Erro ao salvar locação');
    } finally {
      setSaving(false);
    }
  };

  /** preencher preço quando escolher armário (se o armário tiver preço) */
  const onChangeLocker: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const lockerId = e.target.value;
    const selected = lockers.find(l => String((l as any).id) === lockerId);
    // tenta achar um campo de preço dentro do armário
    const rawPrice =
      selected
        ? // @ts-expect-error – cobrimos vários shapes
          ((selected as any).monthlyPrice ?? (selected as any).monthly_price ?? (selected as any).precoMensal)
        : undefined;

    setForm(prev => ({
      ...prev,
      lockerId,
      monthlyPrice: rawPrice ? Number(rawPrice) : prev.monthlyPrice
    }));
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

        {/* Cards fake (pode ligar com /dashboard/stats depois) */}
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

        {/* Tabela */}
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

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Editar Locação' : 'Nova Locação'}
              </h2>
              <button
                className="p-2 rounded-xl hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* aluno e armário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aluno</label>
                  <select
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.studentId}
                    onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map((s) => (
                      <option key={(s as any).id} value={String((s as any).id)}>
                        {
                          // @ts-expect-error
                          (s as any).name ?? (s as any).nome ?? 'Aluno'
                        } – {
                          // @ts-expect-error
                          (s as any).studentId ?? (s as any).student_id ?? ''
                        }
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Armário</label>
                  <select
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.lockerId}
                    onChange={onChangeLocker}
                    required
                  >
                    <option value="">Selecione um armário</option>
                    {lockers.map((l) => (
                      <option key={(l as any).id} value={String((l as any).id)}>
                        {labelLocker(l)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Início</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fim</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* preços */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.monthlyPrice}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50"
                    value={form.totalAmount}
                    readOnly
                  />
                </div>
              </div>

              {/* status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as RentalStatus }))}
                  >
                    <option value="active">Ativa</option>
                    <option value="overdue">Em Atraso</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pagamento</label>
                  <select
                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                    value={form.paymentStatus}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentStatus: e.target.value as PaymentStatus }))}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Em Atraso</option>
                  </select>
                </div>
              </div>

              {/* notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>

              {/* ações */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RentalManagement;