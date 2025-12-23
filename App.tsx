
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
import { auth, db, isSupabaseConfigured } from './services/supabaseClient';

const DEFAULT_SETTINGS: MerchantSettings = {
  name: "MINHA EMPRESA LTDA",
  pixKey: "000.000.000-00",
  city: "SAO PAULO"
};

const App: React.FC = () => {
  // Verificação de segurança: Se o Supabase não estiver configurado, 
  // mostre uma mensagem clara em vez de tentar carregar e falhar.
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Configuração Ausente</h1>
          <p className="text-slate-400 mb-6">
            O sistema não conseguiu conectar ao banco de dados porque as variáveis de ambiente do Supabase não foram encontradas.
          </p>
          <div className="text-left bg-black/50 rounded-lg p-4 mb-6 text-sm font-mono text-slate-300 overflow-x-auto">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Configure na Vercel:</p>
            VITE_SUPABASE_URL=...<br />
            VITE_SUPABASE_ANON_KEY=...
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [carnes, setCarnes] = useState<Carne[]>([]);
  const [activeCarne, setActiveCarne] = useState<Carne | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management' | 'reports' | 'settings'>('dashboard');
  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings>(DEFAULT_SETTINGS);

  // Inicialização e verificação de sessão
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão', error);
      }
    };
    initSession();
  }, []);

  // Carregar dados usuário
  const loadUserData = async (uid: string) => {
    try {
      setIsLoading(true);
      const [fetchedCarnes, fetchedSettings] = await Promise.all([
        db.getCarnes(uid),
        db.getSettings(uid)
      ]);

      if (fetchedCarnes) setCarnes(fetchedCarnes as unknown as Carne[]); // Type assertion provisório

      if (fetchedSettings && Object.keys(fetchedSettings as object).length > 0) {
        setMerchantSettings(fetchedSettings as MerchantSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const user = await auth.getUser();
    if (user) {
      setIsAuthenticated(true);
      setUserId(user.id);
      loadUserData(user.id);
    }
  };

  const handleLogout = async () => {
    if (confirm("Deseja realmente encerrar sua sessão?")) {
      await auth.signOut();
      setIsAuthenticated(false);
      setUserId(null);
      setCarnes([]);
      setActiveCarne(null);
      setActiveTab('dashboard');
    }
  };

  const saveSettings = async (newSettings: MerchantSettings) => {
    setMerchantSettings(newSettings);
    if (userId) {
      await db.updateSettings(userId, newSettings);
    }
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


      // Adaptar para formato do banco de dados
      const carneForDb = {
        user_id: userId!,
        customer_id: '', // Será preenchido após criar/buscar cliente
        title: sanitizeHTML(data.title.trim()),
        description: '',
        total_amount: data.totalAmount,
        installments_count: data.installmentsCount,
        status: 'active' as const
      };

      try {
        // 1. Criar ou buscar cliente
        // Simplificação: criando novo cliente para cada carne por enquanto
        // Idealmente, buscaria cliente existente pelo documento
        const customerData = {
          user_id: userId!,
          name: sanitizeHTML(data.customerName.trim()),
          document: data.customerDocument,
          email: '',
          phone: '',
          address: ''
        };

        const newCustomer = await db.createCustomer(customerData) as any;
        if (!newCustomer) throw new Error("Falha ao criar cliente");
        carneForDb.customer_id = newCustomer.id;

        // 2. Preparar parcelas para DB
        const installmentsForDb = installments.map(inst => ({
          carne_id: '', // Será preenchido pelo createCarne
          number: inst.number,
          due_date: new Date(inst.dueDate).toISOString().split('T')[0], // Apenas data YYYY-MM-DD
          amount: inst.amount,
          status: 'pending' as const,
          pix_payload: inst.pixPayload,
          pix_txid: `CARNE${inst.number}ID${inst.id}`, // TXID simulado
          payment_method: 'PIX',
          notes: ''
        }));

        // 3. Salvar tudo no Supabase
        const result = await db.createCarne(carneForDb, installmentsForDb) as any;
        if (!result || !result.carne) throw new Error("Falha ao criar carnê");

        // 4. Converter de volta para o formato usado na UI (Carne type)
        const newCarne: Carne = {
          id: result.carne.id,
          customer: {
            name: newCustomer.name,
            document: newCustomer.document || undefined,
          },
          title: result.carne.title,
          totalAmount: result.carne.total_amount,
          installments: (result.installments || []).map((inst: any) => ({
            id: inst.id,
            number: inst.number,
            dueDate: inst.due_date, // Pode precisar ajustar fuso dependendo da implementação
            amount: inst.amount,
            status: inst.status,
            pixPayload: inst.pix_payload,
            paymentDate: inst.payment_date
          })),
          createdAt: result.carne.created_at,
        };

        setCarnes([newCarne, ...carnes]);
        setActiveCarne(newCarne);
      } catch (error) {
        console.error("Erro ao salvar no banco de dados:", error);
        alert("Erro ao salvar o carnê. Verifique sua conexão e tente novamente.");
      } finally {
        setIsLoading(false);
      }
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
