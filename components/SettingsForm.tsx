
import React, { useState } from 'react';
import { MerchantSettings } from '../types';

interface SettingsFormProps {
  initialSettings: MerchantSettings;
  onSave: (settings: MerchantSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, onSave }) => {
  const [settings, setSettings] = useState<MerchantSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        {/* Header Elegante */}
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight italic">Dados do Recebedor</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Configure como sua marca aparece nos carnês.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Nome / Razão Social */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Estabelecimento</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                required
                type="text"
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                placeholder="Ex: Minha Empresa LTDA"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[22px] focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800 text-lg placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chave PIX */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chave PIX</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  required
                  type="text"
                  value={settings.pixKey}
                  onChange={e => setSettings({ ...settings, pixKey: e.target.value })}
                  placeholder="E-mail, CPF ou CNPJ"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[22px] focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Cidade */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cidade (Padrão PIX)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  required
                  type="text"
                  value={settings.city}
                  onChange={e => setSettings({ ...settings, city: e.target.value })}
                  placeholder="Ex: SAO PAULO"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[22px] focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Dica Informativa */}
          <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100 flex gap-4">
             <div className="text-indigo-500">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <p className="text-xs text-indigo-900 leading-relaxed font-medium">
               <strong>Importante:</strong> Utilize apenas letras e números nos campos. A cidade deve ser preenchida sem acentos (Ex: SAO PAULO em vez de São Paulo) para garantir a compatibilidade total com o padrão PIX do Banco Central.
             </p>
          </div>

          {/* Ações */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
            <button
              type="submit"
              className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[22px] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              Salvar Configurações
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {saved && (
              <div className="flex items-center gap-2 text-emerald-600 animate-bounce">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-black text-sm uppercase tracking-tighter">Atualizado com sucesso!</span>
              </div>
            )}
          </div>
        </form>
      </div>
      
      {/* Rodapé Decorativo */}
      <div className="mt-10 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Configuração de Perfil Profissional • CarnêPIB.RA</p>
      </div>
    </div>
  );
};
