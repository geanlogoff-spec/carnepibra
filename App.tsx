
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CarneForm } from './components/CarneForm';
import { CarneTicket } from './components/CarneTicket';
import { SettingsForm } from './components/SettingsForm';
import { CarneManagement } from './components/CarneManagement';
import { FinancialReports } from './components/FinancialReports';
import { LoginPage } from './components/LoginPage';
import { Carne, CarneFormData, Installment, MerchantSettings } from './types';
import { generatePixPayload } from './services/geminiService';
import { SecureStorage, validateAmount, validateDocument, sanitizeHTML } from './utils/security';

// Instância de armazenamento seguro
const secureStorage = new SecureStorage();

const DEFAULT_SETTINGS: MerchantSettings = {
  name: "MINHA EMPRESA LTDA",
  pixKey: "000.000.000-00",
  city: "SAO PAULO"
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return secureStorage.getItem('carnepix_auth') === 'true';
  });

  const [carnes, setCarnes] = useState<Carne[]>(() => {
    const saved = secureStorage.getItem('carnepix_data');
    return saved || [];
  });
  const [activeCarne, setActiveCarne] = useState<Carne | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'reports' | 'settings'>('dashboard');

  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings>(() => {
    const saved = secureStorage.getItem('carnepix_settings');
    return saved || DEFAULT_SETTINGS;
  });

  useEffect(() => {
    secureStorage.setItem('carnepix_data', carnes);
  }, [carnes]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    secureStorage.setItem('carnepix_auth', 'true');
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente encerrar sua sessão?")) {
      setIsAuthenticated(false);
      secureStorage.removeItem('carnepix_auth');
      // Opcional: Limpa o estado ativo ao sair
      setActiveCarne(null);
      setActiveTab('dashboard');
    }
  };

  const saveSettings = (newSettings: MerchantSettings) => {
    setMerchantSettings(newSettings);
    secureStorage.setItem('carnepix_settings', newSettings);
  };

  const handleCreateCarne = async (data: CarneFormData) => {
    // Validação de entrada
    if (!data.customerName.trim() || data.customerName.length < 3) {
      alert('Nome do cliente deve ter pelo menos 3 caracteres.');
      return;
    }

    if (data.customerDocument && !validateDocument(data.customerDocument)) {
      alert('CPF/CNPJ inválido. Verifique o documento informado.');
      return;
    }

    if (!data.title.trim() || data.title.length < 3) {
      alert('Título deve ter pelo menos 3 caracteres.');
      return;
    }

    if (!validateAmount(data.totalAmount)) {
      alert('Valor total inválido. Deve ser maior que R$ 0,00 e menor que R$ 999.999,99.');
      return;
    }

    if (data.installmentsCount < 1 || data.installmentsCount > 60) {
      alert('Número de parcelas deve estar entre 1 e 60.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const installments: Installment[] = [];
      const installmentAmount = data.totalAmount / data.installmentsCount;
      const firstDate = new Date(data.firstDueDate);

      for (let i = 1; i <= data.installmentsCount; i++) {
        const dueDate = new Date(firstDate);
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        const id = Math.random().toString(36).substring(7).toUpperCase();

        const payload = generatePixPayload({
          key: merchantSettings.pixKey,
          name: merchantSettings.name,
          city: merchantSettings.city,
          amount: installmentAmount,
          txid: `CARNE${i}ID${id.substring(0, 4)}`
        });

        installments.push({
          id,
          number: i,
          dueDate: dueDate.toISOString(),
          amount: installmentAmount,
          status: 'pending',
          pixPayload: payload,
        });
      }

      const newCarne: Carne = {
        id: Math.random().toString(36).substring(7),
        customer: {
          name: sanitizeHTML(data.customerName.trim()),
          document: data.customerDocument,
        },
        title: sanitizeHTML(data.title.trim()),
        totalAmount: data.totalAmount,
        installments,
        createdAt: new Date().toISOString(),
      };

      setCarnes([newCarne, ...carnes]);
      setActiveCarne(newCarne);
      setIsLoading(false);
    }, 1200);
  };

  const toggleInstallmentStatus = (carneId: string, installmentId: string) => {
    setCarnes(prevCarnes => prevCarnes.map(carne => {
      if (carne.id !== carneId) return carne;
      return {
        ...carne,
        installments: carne.installments.map(inst => {
          if (inst.id !== installmentId) return inst;
          const isMarkingAsPaid = inst.status !== 'paid';
          return {
            ...inst,
            status: isMarkingAsPaid ? 'paid' : 'pending',
            paymentDate: isMarkingAsPaid ? new Date().toISOString() : undefined
          };
        })
      };
    }));
  };

  const deleteCarne = (id: string) => {
    if (confirm("Deseja realmente excluir este carnê?")) {
      setCarnes(prev => prev.filter(c => c.id !== id));
      if (activeCarne?.id === id) setActiveCarne(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Usar a funcionalidade nativa de impressão que já está configurada
    // O usuário pode escolher "Salvar como PDF" na caixa de diálogo
    window.print();
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => setActiveTab(tab)}
      merchantName={merchantSettings.name}
      onLogout={handleLogout}
    >
      <div className="max-w-6xl mx-auto">
        {isLoading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full text-center border border-white/20">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-[6px] border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Gerando Carnê</h3>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Configurações de Perfil</h2>
              <p className="text-slate-500 mt-2 text-lg">Atualize os dados da sua empresa e chave de recebimento.</p>
            </header>
            <SettingsForm initialSettings={merchantSettings} onSave={saveSettings} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Relatórios Financeiros</h2>
              <p className="text-slate-500 mt-2 text-lg">Visão detalhada de faturamento e fluxo de caixa.</p>
            </header>
            <FinancialReports carnes={carnes} />
          </div>
        )}

        {activeTab === 'management' && (
          <div className="space-y-10">
            <header>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gerenciamento de Cobranças</h2>
              <p className="text-slate-500 mt-2 text-lg">Controle o status de cada parcela e gerencie seus clientes.</p>
            </header>
            <CarneManagement
              carnes={carnes}
              onToggleStatus={toggleInstallmentStatus}
              onDelete={deleteCarne}
              onView={(carne) => {
                setActiveCarne(carne);
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {activeTab === 'dashboard' && !activeCarne && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Novo Carnê<span className="text-indigo-600">.</span></h2>
              <p className="text-slate-500 mt-3 text-lg font-medium">Emita cobranças profissionais com QR Code PIX automático.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-12">
                <CarneForm onSubmit={handleCreateCarne} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && activeCarne && (
          <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 bg-slate-900 p-10 rounded-[40px] text-white shadow-3xl">
              <div>
                <button
                  onClick={() => setActiveCarne(null)}
                  className="text-indigo-400 font-black flex items-center gap-2 mb-4 hover:text-white transition-all uppercase tracking-widest text-[10px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para formulário
                </button>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">{activeCarne.customer.name}</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[22px] font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Salvar PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-white text-slate-900 hover:bg-slate-50 px-8 py-4 rounded-[22px] font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
              </div>
            </div>

            <div id="printable-carne" className="flex flex-col items-center">
              <div id="tickets-container" className="carne-container w-full max-w-[900px] print:max-w-none">
                {activeCarne.installments.map((inst) => (
                  <CarneTicket
                    key={inst.id}
                    installment={inst}
                    customer={activeCarne.customer}
                    title={activeCarne.title}
                    totalInstallments={activeCarne.installments.length}
                    merchant={merchantSettings}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
