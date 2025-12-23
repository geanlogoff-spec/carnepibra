# 🚀 Deploy Completo - GitHub + Vercel + Supabase

Guia passo a passo para colocar o CarnêPIB.RA em produção.

---

## 📋 Checklist Geral

- [ ] Código no GitHub
- [ ] Banco de dados Supabase configurado
- [ ] Frontend na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Testes de produção realizados

**Tempo estimado:** 20-30 minutos

---

## 🔧 PARTE 1: GitHub (Código)

### Passo 1.1: Verificar Git

```bash
# Verificar se git está instalado
git --version

# Se não estiver instalado:
# Windows: https://git-scm.com/download/win
```

### Passo 1.2: Configurar Git (Se necessário)

```bash
# Configurar nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Passo 1.3: Inicializar Repositório Local

```bash
# No diretório do projeto
cd carnepibra

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - CarnePIBRA v1.0"
```

### Passo 1.4: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no **+** (canto superior direito) → **New repository**
3. Preencha:
   - **Repository name:** `carnepibra`
   - **Description:** `Sistema de Cobrança Inteligente com PIX`
   - **Privacy:** Public ou Private (sua escolha)
   - ⚠️ **NÃO** marque "Initialize with README"
4. Clique em **Create repository**

### Passo 1.5: Push para GitHub

```bash
# Adicionar remote (copie do GitHub)
git remote add origin https://github.com/SEU-USUARIO/carnepibra.git

# Ou via SSH (se configurado):
# git remote add origin git@github.com:SEU-USUARIO/carnepibra.git

# Push inicial
git branch -M main
git push -u origin main
```

**✅ Código agora está no GitHub!**

---

## 🗄️ PARTE 2: Supabase (Backend)

### Passo 2.1: Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Se necessário, faça login/signup
4. Clique em **New project**
5. Preencha:
   - **Name:** carnepibra
   - **Database Password:** CRIE UMA SENHA FORTE (anote!)
   - **Region:** South America (São Paulo) - mais próximo
   - **Pricing Plan:** Free (para começar)
6. Clique em **Create new project**
7. ⏳ Aguarde 2-3 minutos (criando infraestrutura)

### Passo 2.2: Executar SQL Schema

1. No painel Supabase, vá para **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Abra o arquivo `supabase/schema.sql` do seu projeto
4. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. **Cole** no editor SQL do Supabase
6. Clique em **Run** (ou F5)
7. ✅ Aguarde aparecer "Success. No rows returned."

### Passo 2.3: Verificar Tabelas Criadas

1. Vá para **Table Editor** (menu lateral)
2. Você deve ver 6 tabelas:
   - ✅ profiles
   - ✅ customers
   - ✅ carnes
   - ✅ installments
   - ✅ payment_history
   - ✅ user_settings

### Passo 2.4: Obter Credenciais

1. Vá para **Settings** → **API** (menu lateral)
2. **Copie e anote:**

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NUNCA compartilhe a `service_role` key!**

### Passo 2.5: Configurar Autenticação

1. Vá para **Authentication** → **Providers**
2. Certifique-se que **Email** está **Enabled** ✅
3. Vá para **Authentication** → **URL Configuration**
4. Configure:
   - **Site URL:** `https://seu-site.vercel.app` (vamos pegar depois)
   - **Redirect URLs:** `https://seu-site.vercel.app/auth/callback`

⚠️ Vamos atualizar isso depois do deploy na Vercel

**✅ Backend Supabase está pronto!**

---

## 🌐 PARTE 3: Vercel (Frontend)

### Passo 3.1: Criar Conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign Up**
3. **Escolha:** Continue with GitHub
4. Autorize a Vercel a acessar seus repositórios

### Passo 3.2: Importar Projeto

1. No Dashboard da Vercel, clique em **Add New...** → **Project**
2. Procure por `carnepibra` na lista
3. Clique em **Import**
4. Configure o projeto:

**Build Settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (já detectado)
- **Output Directory:** `dist` (já detectado)
- **Install Command:** `npm install` (já detectado)

### Passo 3.3: Adicionar Variáveis de Ambiente

**⚠️ IMPORTANTE: Configure ANTES de fazer deploy!**

1. Expanda **Environment Variables**
2. Adicione as seguintes variáveis:

```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Gemini AI (opcional - se tiver)
GEMINI_API_KEY=AIzaSy...

# App Config
VITE_APP_URL=https://seu-site.vercel.app
NODE_ENV=production

# Merchant Defaults (ajuste conforme necessário)
VITE_DEFAULT_MERCHANT_NAME=SUA EMPRESA LTDA
VITE_DEFAULT_PIX_KEY=00.000.000/0001-00
VITE_DEFAULT_CITY=SAO PAULO
```

**Para cada variável:**
1. Cole o **Name** (ex: `VITE_SUPABASE_URL`)
2. Cole o **Value** (o valor real)
3. Marque **Production**, **Preview**, **Development**
4. Clique em **Add**

### Passo 3.4: Deploy!

1. Após adicionar todas as variáveis, clique em **Deploy**
2. ⏳ Aguarde 2-5 minutos (build + deploy)
3. ✅ Quando aparecer "Congratulations!", clique em **Visit**

### Passo 3.5: Copiar URL do Site

Sua URL será algo como:
```
https://carnepibra-xxxxx.vercel.app
```

**Anote essa URL!**

**✅ Frontend está no ar!**

---

## 🔗 PARTE 4: Conectar Tudo

### Passo 4.1: Atualizar URLs no Supabase

1. Volte para o **Supabase Dashboard**
2. Vá para **Authentication** → **URL Configuration**
3. Atualize com a URL da Vercel:

```
Site URL:
https://carnepibra-xxxxx.vercel.app

Redirect URLs (uma por linha):
https://carnepibra-xxxxx.vercel.app
https://carnepibra-xxxxx.vercel.app/auth/callback
https://carnepibra-xxxxx.vercel.app/*
```

4. Clique em **Save**

### Passo 4.2: Atualizar VITE_APP_URL na Vercel

1. Volte para **Vercel Dashboard**
2. Vá para seu projeto → **Settings** → **Environment Variables**
3. Encontre `VITE_APP_URL`
4. Clique em **Edit**
5. Atualize com a URL real da Vercel
6. Clique em **Save**
7. Vá para **Deployments**
8. Clique nos **3 pontinhos** do último deploy → **Redeploy**

---

## ✅ PARTE 5: Testes de Produção

### Teste 1: Acessar Site

1. Abra a URL: `https://carnepibra-xxxxx.vercel.app`
2. Deve carregar a tela de login
3. ✅ Se carregar, está funcionando!

### Teste 2: Criar Conta

1. Na tela de login, tente fazer signup
2. OU vá para Supabase → **Authentication** → **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - Email: seu@email.com
   - Password: senha-segura-123
   - ✅ Auto Confirm User
5. Clique em **Create user**

### Teste 3: Fazer Login

1. No site, faça login com as credenciais
2. Credenciais padrão (se não mudou):
   - User: admin
   - Password: admin123

⚠️ **ALTERE estas credenciais em produção!**

### Teste 4: Criar Carnê

1. Preencha o formulário de carnê
2. Crie um carnê de teste
3. Verifique se:
   - ✅ Carnê aparece
   - ✅ QR Codes são gerados
   - ✅ Pode imprimir

### Teste 5: Verificar Dados no Supabase

1. Vá para Supabase → **Table Editor**
2. Verifique se dados aparecem em:
   - `customers`
   - `carnes`
   - `installments`

**✅ Tudo funcionando!**

---

## 🎨 PARTE 6: Customização (Opcional)

### Domínio Customizado

1. Na Vercel → **Settings** → **Domains**
2. Clique em **Add**
3. Digite seu domínio (ex: `carnepibra.com.br`)
4. Siga instruções para configurar DNS
5. Aguarde propagação (pode levar até 48h)

### Logo e Branding

Edite o arquivo `index.html`:
```html
<title>Seu Nome - Sistema PIX</title>
```

---

## 🔒 PARTE 7: Segurança Pós-Deploy

### Checklist de Segurança:

- [ ] Alterar credenciais de login padrão
- [ ] Habilitar confirmação de email no Supabase
- [ ] Configurar rate limiting
- [ ] Adicionar domínio customizado com HTTPS
- [ ] Revisar Row Level Security policies
- [ ] Configurar backup automático
- [ ] Adicionar monitoramento (Sentry, LogRocket)
- [ ] Testar em diferentes navegadores
- [ ] Testar em dispositivos móveis

### Alterar Credenciais (URGENTE!)

Edite `components/LoginPage.tsx`:
```typescript
// linha 40-41
const validUsername = 'seu_novo_usuario';
const validPassword = 'senha_super_segura_123!';
```

Depois:
```bash
git add .
git commit -m "Update login credentials"
git push
```

Vercel fará redeploy automaticamente!

---

## 📊 PARTE 8: Monitoramento

### Vercel Analytics

1. Na Vercel → **Analytics**
2. Veja:
   - Visitors
   - Page views
   - Performance

### Supabase Monitoring

1. No Supabase → **Database** → **Usage**
2. Monitore:
   - Database size
   - API requests
   - Active connections

### Limits Free Tier:

**Vercel:**
- ✅ Bandwidth: 100 GB/mês
- ✅ Build minutes: 6,000/mês
- ✅ Unlimited deployments

**Supabase:**
- ✅ Database: 500 MB
- ✅ API requests: 50,000/mês
- ✅ Auth users: Unlimited

---

## 🔄 PARTE 9: Workflow de Desenvolvimento

### Fazer Mudanças no Código

```bash
# 1. Fazer mudanças localmente
# 2. Testar localmente
npm run dev

# 3. Commit
git add .
git commit -m "feat: nova funcionalidade"

# 4. Push para GitHub
git push

# 5. Vercel faz deploy automático! ✨
```

### Branches (Recomendado)

```bash
# Desenvolvimento
git checkout -b develop
# fazer mudanças
git push origin develop

# Produção
git checkout main
git merge develop
git push origin main
```

Configure na Vercel:
- **Production Branch:** main
- **Preview Branches:** develop, staging

---

## 🆘 PARTE 10: Troubleshooting

### Site não carrega

1. ✅ Verifique Vercel deployment logs
2. ✅ Verifique variáveis de ambiente
3. ✅ Verifique se build passou

### Erro de autenticação

1. ✅ Verifique Supabase URL Configuration
2. ✅ Verifique se VITE_SUPABASE_* estão corretas
3. ✅ Verifique Supabase Auth logs

### Dados não aparecem

1. ✅ Verifique se RLS está habilitado
2. ✅ Verifique se usuário está logado
3. ✅ Verifique Supabase Table Editor

### Build falhou

1. Veja logs na Vercel
2. Rode localmente: `npm run build`
3. Corrija erros
4. Push novamente

---

## 📞 PARTE 11: URLs Importantes

Anote aqui suas URLs:

```
GitHub Repo:
https://github.com/SEU-USUARIO/carnepibra

Vercel Dashboard:
https://vercel.com/SEU-USUARIO/carnepibra

Site em Produção:
https://carnepibra-xxxxx.vercel.app

Supabase Dashboard:
https://supabase.com/dashboard/project/xxxxx
```

---

## ✅ Checklist Final

- [ ] ✅ Código no GitHub
- [ ] ✅ Supabase configurado
- [ ] ✅ Vercel configurado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Site acessível publicamente
- [ ] ✅ Login funcionando
- [ ] ✅ Criação de carnê funcionando
- [ ] ✅ Dados salvos no Supabase
- [ ] ✅ URLs atualizadas
- [ ] ⚠️ Credenciais alteradas
- [ ] ⚠️ Email de confirmação configurado
- [ ] ⚠️ Domínio customizado (opcional)

---

## 🎉 Parabéns!

Seu sistema está em produção! 🚀

**Você agora tem:**
- ✅ Código versionado (GitHub)
- ✅ Backend robusto (Supabase)
- ✅ Frontend otimizado (Vercel)
- ✅ HTTPS automático
- ✅ Deploy automático
- ✅ Escalabilidade global

---

## 📈 Próximos Passos

1. Compartilhe o link com usuários teste
2. Colete feedback
3. Implemente melhorias
4. Configure domínio próprio
5. Adicione Google Analytics
6. Configure email transacional
7. Implemente notificações
8. Adicione mais features!

---

**Última atualização:** 23/12/2024  
**Status:** ✅ PRONTO PARA PRODUÇÃO

**Precisando de ajuda? Consulte:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Este README](./README.md)
