
import React, { useState } from 'react';
import { CarneFormData } from '../types';

interface CarneFormProps {
  onSubmit: (data: CarneFormData) => void;
}

export const CarneForm: React.FC<CarneFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CarneFormData>({
    customerName: '',
    customerDocument: '',
    title: 'Venda de Serviços',
    totalAmount: 0,
    installmentsCount: 1,
    firstDueDate: new Date().toISOString().split('T')[0],
  });

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

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          Configuração do Novo Carnê
        </h2>
        <p className="text-slate-400 text-sm mt-1 ml-12">Preencha os dados abaixo para gerar as parcelas com PIX.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Seção: Dados do Cliente */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Informações do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nome Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nome do pagador"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">CPF ou CNPJ (Opcional)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0" />
                  </svg>
                </div>
                <input
                  name="customerDocument"
                  value={formData.customerDocument}
                  onChange={handleChange}
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Detalhes do Pagamento */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Detalhes da Cobrança</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">Título do Carnê</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                type="text"
                placeholder="Ex: Assinatura Mensal, Venda de Equipamento..."
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
                  max="48"
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
            <span className="text-lg">Gerar Carnê Profissional</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-center text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-bold">
            Pagamentos via PIX Integrado & Impressão em PDF
          </p>
        </div>
      </form>
    </div>
  );
};
