import React, { useState } from 'react';
import { RateLimiter, sanitizeHTML } from '../utils/security';
import { auth } from '../services/supabaseClient';

interface LoginPageProps {
  onLogin: () => void;
}

// Rate limiter para prevenir brute force
const loginLimiter = new RateLimiter(10, 60000); // Aumentado para 10 tentativas em dev/teste

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre login e cadastro
  const [activeInfoModal, setActiveInfoModal] = useState<'privacy' | 'terms' | 'support' | null>(null);

  const modalContent = {
    privacy: {
      title: "Política de Privacidade",
      content: (
        <div className="space-y-4">
          <p>Sua privacidade é nossa prioridade. Esta política descreve como tratamos seus dados:</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Coleta de Dados:</strong> Coletamos apenas as informações estritamente necessárias para a operação do sistema (email para autenticação e dados de configuração da empresa).</li>
            <li><strong>Uso das Informações:</strong> Seus dados são usados exclusivamente para fornecer o serviço de gestão de carnês e não são compartilhados com terceiros para fins publicitários.</li>
            <li><strong>Segurança:</strong> Utilizamos criptografia de ponta a ponta e práticas de segurança modernas para proteger seus dados.</li>
            <li><strong>Cookies:</strong> Utilizamos cookies apenas para manter sua sessão segura e ativa.</li>
          </ul>
        </div>
      )
    },
    terms: {
      title: "Termos de Uso",
      content: (
        <div className="space-y-4">
          <p>Ao utilizar o CarnêPIB.RA, você concorda com os seguintes termos:</p>
          <ol className="list-decimal pl-4 space-y-2">
            <li><strong>Finalidade:</strong> O sistema deve ser utilizado exclusivamente para fins lícitos de gestão financeira e emissão de cobranças.</li>
            <li><strong>Responsabilidade:</strong> O usuário é inteiramente responsável pela veracidade das informações inseridas (valores, dados de clientes, chave PIX).</li>
            <li><strong>Disponibilidade:</strong> Embora nos esforcemos para manter o sistema online 99.9% do tempo, interrupções para manutenção podem ocorrer.</li>
            <li><strong>Pagamentos:</strong> O sistema gera QR Codes PIX baseados nas chaves fornecidas. Não intermediamos pagamentos nem possuímos acesso aos valores transferidos.</li>
          </ol>
        </div>
      )
    },
    support: {
      title: "Central de Suporte",
      content: (
        <div className="space-y-4">
          <p>Precisa de ajuda ou encontrou algum problema? Estamos aqui para ajudar.</p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-indigo-400 font-bold mb-1">E-mail de Suporte</p>
            <p className="text-white select-all">suporte@carnepibra.com</p>
          </div>
          <p className="text-sm">Nosso tempo médio de resposta é de 24 horas úteis. Para questões urgentes sobre pagamentos, verifique diretamente com seu banco.</p>
        </div>
      )
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação básica
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Rate limiting
    if (!loginLimiter.check('login')) {
      setError('Muitas tentativas. Aguarde 1 minuto.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Cadastro
        await auth.signUp(email, password);
        alert('Cadastro realizado! Por favor, faça login.');
        setIsSignUp(false); // Voltar para login
      } else {
        // Login
        await auth.signIn(email, password);
        loginLimiter.reset('login');
        onLogin();
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      // Mensagens de erro amigáveis para o usuário
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu e-mail antes de entrar.');
      } else {
        setError(err.message || 'Ocorreu um erro ao tentar entrar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 font-['Inter']">
      {/* Elementos Visuais Inovadores (Background) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Grade de Pontos (Pattern) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-1000">
        {/* Logo Superior */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[28px] shadow-2xl shadow-indigo-500/40 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer border border-white/20">
            <span className="text-3xl font-black text-white italic">C</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            CarnêPIB<span className="text-indigo-500">.RA</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-tight">Gestão de Pagamentos Inteligente</p>
        </div>

        {/* Card de Login (Glassmorphism) */}
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[48px] border border-white/10 shadow-3xl shadow-black/50 relative group">
          {/* Efeito de brilho na borda */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 rounded-[48px] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <form onSubmit={handleSubmit} className="relative space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-[22px] py-4 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sua Senha</label>
                <button type="button" className="text-[9px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-wider transition-colors">Esqueci a senha</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-[22px] py-4 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500/50" />
              <label htmlFor="remember" className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter cursor-pointer">Lembrar acesso neste dispositivo</label>
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-sm uppercase tracking-[0.15em]">Entrar no Painel</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé do Login */}
        <div className="mt-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            <button onClick={() => setActiveInfoModal('privacy')} className="hover:text-indigo-400 transition-colors">Privacidade</button>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <button onClick={() => setActiveInfoModal('terms')} className="hover:text-indigo-400 transition-colors">Termos</button>
            <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
            <button onClick={() => setActiveInfoModal('support')} className="hover:text-indigo-400 transition-colors">Suporte</button>
          </div>
        </div>
      </div>

      {/* Modal de Informações */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="bg-slate-900 border border-white/10 p-8 rounded-[32px] max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-white italic tracking-tight mb-1">
                {modalContent[activeInfoModal].title}<span className="text-indigo-500">.</span>
              </h3>
              <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
            </div>

            <div className="text-slate-300 leading-relaxed text-sm font-medium">
              {modalContent[activeInfoModal].content}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalhe Flutuante (Blur Decorativo) */}
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl animate-bounce"></div>
    </div>
  );
};
