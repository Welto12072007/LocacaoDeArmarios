import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { Locker } from '../../types';

type LockerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>, id?: number) => Promise<void>;
  initialData?: Locker | null;
};

const LockerModal: React.FC<LockerModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [numero, setNumero] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [status, setStatus] = useState<Locker['status']>('disponível');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (initialData) {
      setNumero(initialData.numero);
      setLocalizacao(initialData.localizacao);
      setStatus(initialData.status);
      setObservacoes(initialData.observacoes || '');
    } else {
      setNumero('');
      setLocalizacao('');
      setStatus('disponível');
      setObservacoes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(
      {
        numero,
        localizacao,
        status,
        observacoes,
      },
      initialData?.id,
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-semibold mb-4">{initialData ? 'Editar Armário' : 'Novo Armário'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="numero">Número</label>
            <input
              id="numero"
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="localizacao">Localização</label>
            <input
              id="localizacao"
              type="text"
              value={localizacao}
              onChange={e => setLocalizacao(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value as Locker['status'])}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="disponível">Disponível</option>
              <option value="alugado">Alugado</option>
              <option value="manutenção">Manutenção</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{initialData ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockerModal;
