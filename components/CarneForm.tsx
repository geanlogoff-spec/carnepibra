
import React, { useState } from 'react';
import { CarneFormData, Customer } from '../types';

interface CarneFormProps {
  onSubmit: (data: CarneFormData) => void;
  members: Customer[];
}

export const CarneForm: React.FC<CarneFormProps> = ({ onSubmit, members }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const [formData, setFormData] = useState<CarneFormData>({
    customerName: '',
    customerDocument: '',
    title: 'Dízimo / Oferta',
    totalAmount: 0,
    installmentsCount: 1,
    firstDueDate: new Date().toISOString().split('T')[0],
  });

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    setSelectedMemberId(memberId);

    const member = members.find(m => m.id === memberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        customerName: member.name,
        customerDocument: member.document || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, customerName: '', customerDocument: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalAmount' || name === 'installmentsCount' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Se não houver membro selecionado, mostra apenas a seleção
  if (!selectedMemberId) {
    return (
      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="p-3 bg-indigo-500 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Selecione o Membro
            </h2>
            <p className="text-slate-400 text-base mt-2 font-medium">Escolha o irmão que receberá o carnê para continuar.</p>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="space-y-4 max-w-xl mx-auto">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nome do Irmão(ã)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={selectedMemberId}
                onChange={handleMemberSelect}
                className="w-full pl-12 pr-10 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-bold text-lg appearance-none cursor-pointer hover:border-indigo-200"
              >
                <option value="">Clique para selecionar...</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {members.length === 0 && (
              <div className="text-center bg-amber-50 p-6 rounded-2xl border border-amber-100 mt-6">
                <p className="text-amber-800 font-bold">Nenhum membro cadastrado.</p>
                <p className="text-amber-600 text-sm mt-1">Por favor, cadastre os membros na aba "Membros" antes de gerar carnês.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Formulário completo após seleção
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Gerar Carnê para {formData.customerName}
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-12">Defina os valores e parcelas da contribuição.</p>
        </div>
        <button
          onClick={() => {
            setSelectedMemberId('');
            setFormData(prev => ({ ...prev, customerName: '', customerDocument: '' }));
          }}
          className="text-xs font-bold uppercase tracking-wider text-indigo-300 hover:text-white transition-colors"
        >
          Alterar Membro
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">

        {/* Seção: Detalhes do Pagamento */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Detalhes da Oferta/Dízimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">Título / Descrição</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="Ex: Dízimo Mensal, Oferta de Missões..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Valor Total</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold group-focus-within:text-indigo-600">
                  R$
                </div>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  name="totalAmount"
                  value={formData.totalAmount || ''}
                  onChange={handleChange}
                  type="number"
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-bold text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Parcelas</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <input
                  required
                  min="1"
                  max="60"
                  name="installmentsCount"
                  value={formData.installmentsCount}
                  onChange={handleChange}
                  type="number"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">Data do Primeiro Vencimento</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  required
                  name="firstDueDate"
                  value={formData.firstDueDate}
                  onChange={handleChange}
                  type="date"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
          >
            <span className="text-lg">Gerar Carnê</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-center text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-bold">
            Gera QR Code PIX para cada contribuição
          </p>
        </div>
      </form>
    </div>
  );
};
