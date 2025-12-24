
import React from 'react';
import { Carne } from '../types';

interface FinancialReportsProps {
  carnes: Carne[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ carnes }) => {
  const allInstallments = carnes.flatMap(c => c.installments);

  // Normalizar data atual para comparação apenas por dia (zerar horas)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Função auxiliar para criar data segura a partir de string YYYY-MM-DD
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    // Lida com formatos ISO que podem vir com ou sem T
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    // Cria data local meio-dia para evitar problemas de timezone
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  // Métricas Principais
  const totalAmount = allInstallments.reduce((acc, curr) => acc + curr.amount, 0);
  const paidAmount = allInstallments.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  // Pending inclui tudo que não está pago (inclusive atrasados)
  const pendingAmount = totalAmount - paidAmount;

  // Cálculo de Atrasados (Overdue)
  // Considera atrasado se não pago E data de vencimento < hoje
  const overdueInstallments = allInstallments.filter(i => {
    if (i.status === 'paid') return false;
    const dueDate = parseDate(i.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const overdueAmount = overdueInstallments.reduce((acc, curr) => acc + curr.amount, 0);

  const performanceRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  // Agrupamento por Status para Infográfico
  const statusCounts = {
    paid: allInstallments.filter(i => i.status === 'paid').length,
    // Pendente futuro (não vencido)
    future: allInstallments.filter(i => {
      if (i.status === 'paid') return false;
      const dueDate = parseDate(i.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    }).length,
    overdue: overdueInstallments.length,
  };

  // Agrupamento Mensal (Fluxo de Caixa)
  const monthlyFlow = allInstallments.reduce((acc: any, inst) => {
    const date = parseDate(inst.dueDate);
    // Capitalizar o mês corretamente
    const monthName = date.toLocaleString('pt-BR', { month: 'long' });
    const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const monthYear = `${formattedMonth}/${date.getFullYear()}`;

    // Sort key baseada em ano e mês para ordenação correta (YYYYMM)
    const sortKey = date.getFullYear() * 100 + date.getMonth();

    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        total: 0,
        paid: 0,
        overdue: 0,
        sortKey: sortKey
      };
    }

    acc[monthYear].total += inst.amount;

    if (inst.status === 'paid') {
      acc[monthYear].paid += inst.amount;
    } else {
      const dueDate = parseDate(inst.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        acc[monthYear].overdue += inst.amount;
      }
    }

    return acc;
  }, {});

  const sortedMonthlyFlow = Object.values(monthlyFlow).sort((a: any, b: any) => a.sortKey - b.sortKey);

  // Ranking de Membros/Contribuintes
  const customerStats = carnes.reduce((acc: any, carne) => {
    const memberName = carne.customer.name;

    if (!acc[memberName]) {
      acc[memberName] = {
        name: memberName,
        total: 0,
        paid: 0,
        installments: 0,
        paidCount: 0
      };
    }
    acc[memberName].total += carne.totalAmount;
    acc[memberName].installments += carne.installments.length;
    acc[memberName].paid += carne.installments.filter(i => i.status === 'paid').reduce((sum, inst) => sum + inst.amount, 0);
    acc[memberName].paidCount += carne.installments.filter(i => i.status === 'paid').length;
    return acc;
  }, {});

  const sortedCustomers = Object.values(customerStats).sort((a: any, b: any) => b.total - a.total);

  const handlePrintReport = () => {
    window.print();
  };

  if (carnes.length === 0) {
    return (
      <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-slate-200">
        <h3 className="text-xl font-black text-slate-800">Sem dados financeiros</h3>
        <p className="text-slate-500 mt-2">Comece a emitir carnês para os membros visualizarem os relatórios aqui.</p>
      </div>
    );
  }

  return (
    <div id="financial-report" className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Barra de Ações do Relatório */}
      <div className="no-print flex justify-end gap-4">
        <button
          onClick={handlePrintReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Relatório
        </button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Previsão Total (Arrecadação)</p>
          <p className="text-3xl font-black">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{allInstallments.length} Contribuições Emitidas</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Recebido (Ofertas)</p>
          <p className="text-3xl font-black text-slate-900">R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${performanceRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Pendência Vencida</p>
          <p className="text-3xl font-black text-slate-900">R$ {overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-rose-400 mt-2 font-bold uppercase">{overdueInstallments.length} Contribuições em Atraso</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Contribuição Média</p>
          <p className="text-3xl font-black text-slate-900">R$ {(totalAmount / (allInstallments.length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Valor por Parcela</p>
        </div>
      </div>

      {/* Infográficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Distribuição de Status */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm lg:col-span-1">
          <h3 className="font-black text-slate-900 text-xl mb-8">Status das Contribuições</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                  <span className="text-emerald-600">Recebidos ({statusCounts.paid})</span>
                  <span>{((statusCounts.paid / (allInstallments.length || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(statusCounts.paid / (allInstallments.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                  <span className="text-amber-500">A Receber ({statusCounts.future})</span>
                  <span>{((statusCounts.future / (allInstallments.length || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(statusCounts.future / (allInstallments.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                  <span className="text-rose-600">Em Atraso ({statusCounts.overdue})</span>
                  <span>{((statusCounts.overdue / (allInstallments.length || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(statusCounts.overdue / (allInstallments.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <div className="bg-indigo-50 p-6 rounded-[24px]">
              <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Visão Geral</p>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                O acompanhamento regular ajuda a manter a saúde financeira da comunidade.
              </p>
            </div>
          </div>
        </div>

        {/* Projeção Financeira Detalhada */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="font-black text-slate-900 text-xl mb-8 flex items-center justify-between">
            Fluxo Mensal
            <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-500">Próximos Meses</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4">Mês/Ano</th>
                  <th className="pb-4 text-right">Previsto</th>
                  <th className="pb-4 text-right">Recebido</th>
                  <th className="pb-4 text-right">Pendente</th>
                  <th className="pb-4 text-right">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedMonthlyFlow.map((data: any, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-black text-slate-700 capitalize text-sm">{data.month}</td>
                    <td className="py-4 text-right font-bold text-slate-900 text-sm">R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right font-bold text-emerald-600 text-sm">R$ {data.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right font-bold text-rose-500 text-sm">R$ {data.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right">
                      <div className="w-20 ml-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(data.total > 0 ? (data.paid / data.total) * 100 : 0)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Prestação de Contas por Membro (Tabela Detalhada) */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="font-black text-slate-900 text-xl mb-8">Contribuição por Membro</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="p-4 text-left rounded-l-2xl">Membro</th>
                <th className="p-4 text-center">Parcelas</th>
                <th className="p-4 text-right">Total Carnê</th>
                <th className="p-4 text-right">Total Ofertado</th>
                <th className="p-4 text-right">Saldo Restante</th>
                <th className="p-4 text-center rounded-r-2xl">% Realizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCustomers.map((c: any, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-xs text-slate-500">{c.name.charAt(0)}</div>
                      <span className="font-bold text-slate-800 uppercase text-xs">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-600 text-xs">{c.paidCount}/{c.installments}</td>
                  <td className="p-4 text-right font-black text-slate-900 text-xs">R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-black text-emerald-600 text-xs">R$ {c.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-black text-rose-500 text-xs">R$ {(c.total - c.paid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${c.total > 0 && (c.paid / c.total) >= 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.total > 0 ? ((c.paid / c.total) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé do Relatório (Apenas Impressão) */}
      <div className="hidden print:block border-t border-slate-200 mt-20 pt-10 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
        <p className="text-[8px] text-slate-300 mt-1 uppercase">CarnêPIB.RA - Gestão de Contribuições</p>
      </div>
    </div>
  );
};
