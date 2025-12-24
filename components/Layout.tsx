
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'members' | 'dashboard' | 'management' | 'reports' | 'settings';
  setActiveTab: (tab: 'members' | 'dashboard' | 'management' | 'reports' | 'settings') => void;
  merchantName: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, merchantName, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'members', label: 'Membros', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'dashboard', label: 'Gerar Carnê', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'management', label: 'Gerenciamento', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'reports', label: 'Relatórios', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Backdrop Mobile */}
      {isSidebarOpen && (
        <div
          className="no-print fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`no-print fixed md:static inset-y-0 left-0 w-72 bg-slate-950 text-white p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header Sidebar */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">C</div>
            <h1 className="text-xl font-black tracking-tight italic">CarnêPIB<span className="text-indigo-500">.RA</span></h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-4">Menu Principal</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Seção de Perfil e Ações Finais */}
        <div className="mt-auto pt-6 border-t border-slate-900 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Minha Conta</p>

          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <span className={`${activeTab === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              Configurar Perfil
            </button>

            <button
              onClick={() => {
                onLogout();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair do Sistema
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center font-black text-xs uppercase">
              {merchantName.charAt(0) || 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none mb-1">Empresa Logada</p>
              <p className="text-xs font-bold text-slate-200 truncate">{merchantName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Principal */}
        <header className="no-print bg-white/80 backdrop-blur-md sticky top-0 z-30 min-h-[80px] border-b border-slate-200/60 flex items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="md:hidden flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white italic">C</div>
              <span className="font-extrabold text-slate-900 italic hidden xs:block">CarnêPIB.RA</span>
            </div>
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Painel Administrativo</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Acesso Seguro</p>
            </div>

            {/* Atalho de Configurações no Avatar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('settings')}
                className="relative group transition-transform active:scale-90"
                title="Configurar Perfil"
              >
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${merchantName}`} alt="Avatar" className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-slate-50 shadow-sm transition-all group-hover:border-indigo-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </button>

              {/* Botão Sair Rápido (Mobile/Tablet) */}
              <button
                onClick={onLogout}
                className="p-3 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all sm:hidden"
                title="Sair"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-4 md:p-10 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
