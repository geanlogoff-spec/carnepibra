
import React, { useState } from 'react';
import { Carne, Installment } from '../types';

interface CarneManagementProps {
  carnes: Carne[];
  onToggleStatus: (carneId: string, installmentId: string) => void;
  onDelete: (id: string) => void;
  onView: (carne: Carne) => void;
}

export const CarneManagement: React.FC<CarneManagementProps> = ({ carnes, onToggleStatus, onDelete, onView }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calculateStats = () => {
    let total = 0;
    let paid = 0;
    let pending = 0;

    carnes.forEach(c => {
      c.installments.forEach(inst => {
        total += inst.amount;
        if (inst.status === 'paid') paid += inst.amount;
        else pending += inst.amount;
      });
    });

    return { total, paid, pending };
  };

  const stats = calculateStats();

  if (carnes.length === 0) {
    return (
      <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-800">Nenhum carnê emitido ainda</h3>
        <p className="text-slate-500 mt-2">Comece criando um novo carnê na aba inicial.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Mini Dashboard de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Emitido</p>
          <p className="text-2xl font-black text-slate-900">R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[28px] border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Recebido</p>
          <p className="text-2xl font-black text-emerald-700">R$ {stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-[28px] border border-amber-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">A Receber</p>
          <p className="text-2xl font-black text-amber-700">R$ {stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Lista de Carnês */}
      <div className="space-y-4">
        {carnes.map(carne => (
          <div key={carne.id} className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {carne.customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">{carne.customer.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase">{carne.title} • {carne.installments.length} parcelas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onView(carne)}
                  className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Ver Carnê
                </button>
                <button 
                  onClick={() => setExpandedId(expandedId === carne.id ? null : carne.id)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  {expandedId === carne.id ? 'Fechar Detalhes' : 'Gerenciar Parcelas'}
                </button>
                <button 
                  onClick={() => onDelete(carne.id)}
                  className="p-2 text-rose-300 hover:text-rose-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub-lista de Parcelas (Expandida) */}
            {expandedId === carne.id && (
              <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  {carne.installments.map(inst => (
                    <div 
                      key={inst.id}
                      onClick={() => onToggleStatus(carne.id, inst.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-36 ${inst.status === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P. {inst.number}</span>
                        <div className={`w-3 h-3 rounded-full ${inst.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Vencimento: {new Date(inst.dueDate).toLocaleDateString('pt-BR')}</p>
                        <p className={`font-black text-lg ${inst.status === 'paid' ? 'text-emerald-700' : 'text-slate-800'}`}>
                          R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {inst.status === 'paid' && inst.paymentDate && (
                          <p className="text-[9px] font-black text-emerald-600 uppercase italic">
                            Pago em: {new Date(inst.paymentDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${inst.status === 'paid' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {inst.status === 'paid' ? 'PAGO' : 'EM ABERTO'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
