<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CarnêPIB.RA - Sistema de Cobrança Inteligente

Sistema profissional de geração de carnês com QR Code PIX automático. Emita cobranças parceladas com pagamento instantâneo via PIX.

## 🚀 Funcionalidades

- ✅ Geração automática de carnês com QR Code PIX
- ✅ Gestão de parcelas e status de pagamento
- ✅ Relatórios financeiros completos
- ✅ Sistema de autenticação seguro
- ✅ Armazenamento criptografado de dados
- ✅ Validação de CPF/CNPJ
- ✅ Design moderno e responsivo
- ✅ Impressão e exportação para PDF

## 🔒 Segurança

Este projeto implementa várias camadas de segurança:

- Armazenamento criptografado de dados sensíveis
- Validação completa de entradas (XSS, injeção)
- Rate limiting para prevenir ataques brute force
- Headers de segurança HTTP (CSP, X-Frame-Options, etc)
- Sanitização de dados do usuário

**⚠️ IMPORTANTE:** Para uso em produção, consulte o arquivo [SECURITY.md](./SECURITY.md) com recomendações detalhadas.

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Chave de API do Google Gemini ([obter aqui](https://ai.studio))

## 🛠️ Instalação e Execução Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd carnepibra
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite .env.local e adicione sua chave do Gemini
GEMINI_API_KEY=sua_chave_aqui
```

### 4. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em: `http://localhost:3000`

## 🔑 Credenciais de Acesso Padrão

**⚠️ ALTERE ESTAS CREDENCIAIS ANTES DE USAR EM PRODUÇÃO!**

- **Usuário:** `admin`
- **Senha:** `admin123`

Para alterar, edite o arquivo `components/LoginPage.tsx` (linhas 40-41).

## 📁 Estrutura do Projeto

```
carnepibra/
├── components/          # Componentes React
│   ├── LoginPage.tsx   # Página de login
│   ├── CarneForm.tsx   # Formulário de criação
│   ├── CarneTicket.tsx # Ticket individual
│   └── ...
├── services/           # Serviços e APIs
│   └── geminiService.ts # Integração Gemini
├── utils/              # Utilitários
│   └── security.ts     # Funções de segurança
├── types.ts            # Definições TypeScript
├── App.tsx             # Componente principal
└── SECURITY.md         # Documentação de segurança
```

## 🎨 Tecnologias Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Google Gemini AI** - Geração de instruções (opcional)
- **PIX BR Code** - Geração de QR Codes PIX

## 📊 Recursos Principais

### Gestão de Carnês
- Criação de carnês com múltiplas parcelas
- QR Code PIX automático por parcela
- Controle de vencimentos
- Marcação de parcelas pagas

### Relatórios
- Visão geral financeira
- Análise de recebimentos
- Parcelas pendentes e vencidas
- Gráficos e métricas

### Segurança
- Autenticação com rate limiting
- Dados criptografados no navegador
- Validação de CPF/CNPJ
- Proteção contra XSS e injeção

## 🚀 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

**Antes de fazer deploy:**
1. Leia o arquivo [SECURITY.md](./SECURITY.md)
2. Configure variáveis de ambiente no servidor
3. Altere as credenciais de acesso
4. Configure HTTPS obrigatório
5. Considere implementar backend robusto

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## ⚠️ Disclaimer

Este sistema foi desenvolvido para demonstração e uso local. Para uso em produção com dados financeiros reais, implemente as recomendações de segurança descritas em [SECURITY.md](./SECURITY.md) e consulte um especialista em segurança.

## 📞 Suporte

Para questões de segurança ou bugs, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para facilitar cobranças via PIX**
