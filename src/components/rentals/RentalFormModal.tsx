import React, { useEffect, useState } from 'react';
import Button from '../common/Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  rental?: any | null;
  students: any[];
  lockers: any[];
  onSubmit: (payload: any, id?: string) => Promise<void>;
};

const RentalFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  rental,
  students,
  lockers,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    studentId: '',
    lockerId: '',
    startDate: '',
    endDate: '',
    monthlyPrice: '',
    totalAmount: '',
    status: 'active',
    paymentStatus: 'pending',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (rental) {
      setForm({
        studentId:
          rental?.studentId ||
          rental?.student_id ||
          rental?.student?.id ||
          '',
        lockerId:
          rental?.lockerId ||
          rental?.locker_id ||
          rental?.locker?.id ||
          '',
        startDate: rental?.startDate || rental?.start_date || '',
        endDate: rental?.endDate || rental?.end_date || '',
        monthlyPrice: String(rental?.monthlyPrice ?? rental?.monthly_price ?? ''),
        totalAmount: String(rental?.totalAmount ?? rental?.total_amount ?? ''),
        status: rental?.status || 'active',
        paymentStatus: rental?.paymentStatus ?? rental?.payment_status ?? 'pending',
        notes: rental?.notes || '',
      });
    } else {
      setForm({
        studentId: '',
        lockerId: '',
        startDate: '',
        endDate: '',
        monthlyPrice: '',
        totalAmount: '',
        status: 'active',
        paymentStatus: 'pending',
        notes: '',
      });
    }
  }, [isOpen, rental]);

  if (!isOpen) return null;

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async () => {
    if (!form.studentId || !form.lockerId || !form.startDate || !form.endDate || !form.monthlyPrice || !form.totalAmount) {
      alert('Preencha aluno, armário, datas, preço mensal e valor total.');
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
      notes: form.notes || null,
    };
    // ========= FIM DA CORREÇÃO =========

    try {
      setSaving(true);
      await onSubmit(payload, rental?.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar locação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">{rental ? 'Editar locação' : 'Nova locação'}</h2>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm mb-1">Aluno</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={change}
              className="w-full border rounded-md p-2"
            >
              <option value="">Selecione...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.student_id ? `(${s.student_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Armário</label>
            <select
              name="lockerId"
              value={form.lockerId}
              onChange={change}
              className="w-full border rounded-md p-2"
            >
              <option value="">Selecione...</option>
              {lockers.map((l) => (
                <option key={l.id} value={l.id}>
                  Nº {l.number} {l.location ? `- ${l.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Início</label>
              <input type="date" name="startDate" value={form.startDate} onChange={change} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Fim</label>
              <input type="date" name="endDate" value={form.endDate} onChange={change} className="w-full border rounded-md p-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Preço mensal</label>
              <input type="number" name="monthlyPrice" value={form.monthlyPrice} onChange={change} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Valor total</label>
              <input type="number" name="totalAmount" value={form.totalAmount} onChange={change} className="w-full border rounded-md p-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select name="status" value={form.status} onChange={change} className="w-full border rounded-md p-2">
                <option value="active">Ativa</option>
                <option value="overdue">Em atraso</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Pagamento</label>
              <select name="paymentStatus" value={form.paymentStatus} onChange={change} className="w-full border rounded-md p-2">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Em atraso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Observações</label>
            <textarea name="notes" value={form.notes} onChange={change} className="w-full border rounded-md p-2" rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </div>
  );
};

export default RentalFormModal;