
import React from 'react';
import { Installment, Customer, MerchantSettings } from '../types';

interface CarneTicketProps {
  installment: Installment;
  customer: Customer;
  title: string;
  totalInstallments: number;
  merchant: MerchantSettings;
}

export const CarneTicket: React.FC<CarneTicketProps> = ({ installment, customer, title, totalInstallments, merchant }) => {
  // Gerador de QR Code - Tamanho otimizado para o layout
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(installment.pixPayload)}`;

  return (
    <div className="w-full flex justify-center print:block">
      <div className="ticket-card bg-white border-2 border-slate-300 rounded-2xl flex overflow-hidden mb-4 print:mb-0 print:rounded-none border-slate-300 print:border-b-2 print:border-dashed print:shadow-none h-[300px] print:h-[70mm] max-w-[900px] print:max-w-none w-full transition-transform hover:scale-[1.005] print:hover:scale-100 print:break-inside-avoid">
        {/* Canhoto (Stub) */}
        <div className="ticket-stub w-[150px] border-r-2 border-dashed border-slate-300 p-4 flex flex-col justify-between bg-slate-50/80 text-[10px] print:bg-white print:w-[48mm] print:p-2">
          <div>
            <div className="mb-2">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Recibo Sacado</p>
              <h3 className="font-black text-indigo-600 text-xs italic">CarnêPIB.RA</h3>
            </div>

            <div className="space-y-1.5">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[6px]">Parcela</p>
                <p className="font-black text-[11px] text-slate-700 leading-none">{installment.number} / {totalInstallments}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase text-[6px]">Vencimento</p>
                <p className="font-black text-[9px] text-slate-700 leading-none">{new Date(installment.dueDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase text-[6px]">Valor</p>
                <p className="font-black text-[9px] text-slate-700 leading-none">R$ {installment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="mt-1 pt-1 border-t border-slate-200">
            <p className="font-black uppercase text-[6px] text-slate-400 mb-0.5">Pagador</p>
            <p className="font-bold text-slate-600 truncate text-[7.5px] uppercase">{customer.name.split(' ')[0]}</p>
          </div>
        </div>

        {/* Corpo Principal (Ticket) */}
        <div className="ticket-body flex-1 p-4 print:p-2 relative flex flex-col justify-between bg-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-[12mm] h-auto object-contain" />
              <div>
                <p className="text-[9px] font-black text-slate-900 leading-tight uppercase tracking-tight">{merchant.name}</p>
                <p className="text-[7px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">CHAVE PIX: {merchant.pixKey}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">PARCELA</p>
              <p className="text-xl font-black text-indigo-700 leading-none">{installment.number.toString().padStart(2, '0')}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-1">
            <div className="col-span-3 border-b border-slate-200 pb-0.5">
              <p className="text-[6px] uppercase font-black text-slate-400 tracking-wider">Pagador / CPF ou CNPJ</p>
              <p className="text-[9px] font-black text-slate-800 uppercase truncate leading-none">{customer.name} {customer.document ? `— ${customer.document}` : ''}</p>
            </div>
            <div className="border-b border-slate-200 pb-0.5 bg-indigo-50/30 px-1 rounded-t-lg print:bg-white">
              <p className="text-[6px] uppercase font-black text-indigo-400 tracking-wider">Vencimento</p>
              <p className="text-[9px] font-black text-indigo-900 leading-none">{new Date(installment.dueDate).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="col-span-2 border-b border-slate-200 pb-0.5">
              <p className="text-[6px] uppercase font-black text-slate-400 tracking-wider">Descrição</p>
              <p className="text-[8px] font-bold text-slate-600 truncate leading-none">{title}</p>
            </div>
            <div className="border-b border-slate-200 pb-0.5">
              <p className="text-[6px] uppercase font-black text-slate-400 tracking-wider">Valor Nominal</p>
              <p className="text-[9px] font-black text-slate-800 leading-none">R$ {installment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="border-b border-slate-200 pb-0.5">
              <p className="text-[6px] uppercase font-black text-slate-400 tracking-wider">Multa / Juros</p>
              <p className="text-[9px] font-bold text-slate-300 leading-none">R$ 0,00</p>
            </div>
          </div>

          <div className="flex gap-3 items-center mt-1">
            <div className="flex-1 bg-slate-50 border border-slate-100 p-2 rounded-lg print:bg-white print:border-slate-300">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3 h-3 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[7px] text-slate-900 font-black uppercase tracking-widest leading-none">Pagamento via PIX</p>
              </div>
              <p className="text-[6.5px] text-slate-500 leading-tight font-medium">
                Abra o app do seu banco e escaneie o QR Code. Confirmação instantânea.
              </p>
            </div>
            {/* QR Code Aumentado Significativamente */}
            <div className="flex flex-col items-center gap-1 bg-white p-1 border border-slate-100 rounded-lg shadow-sm print:border-slate-300">
              <img src={qrCodeUrl} alt="PIX QR Code" className="w-24 h-24 print:w-[24mm] print:h-[24mm]" />
              <div className="text-[6px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                PIX AUTOMÁTICO
              </div>
            </div>
          </div>

          <div className="mt-1 pt-1 border-t border-slate-100 flex justify-between items-center opacity-40 grayscale print:opacity-100 print:grayscale-0 print:border-slate-300">
            <div className="font-mono text-[7px] tracking-widest text-slate-500 font-bold uppercase">
              BRCODE v1.0
            </div>
            <div className="h-2 w-28 flex gap-[1px]">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="bg-black" style={{ width: `${Math.random() > 0.5 ? 2 : 1}px` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
