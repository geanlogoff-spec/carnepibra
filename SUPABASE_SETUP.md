# 🚀 Guia de Configuração do Supabase

Este guia irá ajudá-lo a configurar o backend Supabase para o CarnêPIB.RA.

---

## 📋 Pré-requisitos

- Conta no Supabase ([criar aqui](https://supabase.com))
- Node.js 16+ instalado
- Projeto CarnêPIB.RA clonado

---

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** CarnePIBRA
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** Escolha a mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o projeto é criado

---

## 🗄️ Passo 2: Configurar Banco de Dados

### Opção A: Via Interface Web (Recomendado)

1. No painel do Supabase, vá para **"SQL Editor"**
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"**
6. Aguarde a execução (deve mostrar "Success")

### Opção B: Via CLI do Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto (copie o Project ID do dashboard)
supabase link --project-ref seu-project-id

# Aplicar migrations
supabase db push
```

---

## 🔑 Passo 3: Obter Credenciais

1. No painel do Supabase, vá para **"Settings"** → **"API"**
2. Copie as seguintes informações:

### Project URL
```
https://seu-projeto.supabase.co
```

### anon/public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NUNCA compartilhe a `service_role` key publicamente!**

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. Edite `.env.local` e adicione suas credenciais:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Passo 5: Configurar Autenticação

### Habilitar Autenticação por Email

1. Vá para **"Authentication"** → **"Providers"**
2. Em **"Email"**, certifique-se que está **enabled**
3. Configure:
   - ✅ **Enable email confirmations** (se quiser confirmar emails)
   - ✅ **Enable email change confirmations**
   - ⚠️ Para desenvolvimento, você pode desabilitar confirmações

### Configurar URL de Redirecionamento

1. Em **"Authentication"** → **"URL Configuration"**
2. Adicione:
   - **Site URL:** `http://localhost:3000` (desenvolvimento)
   - **Redirect URLs:** `http://localhost:3000/auth/callback`

### Para Produção:
```
Site URL: https://seu-dominio.com
Redirect URLs: https://seu-dominio.com/auth/callback
```

---

## 🛡️ Passo 6: Verificar Row Level Security (RLS)

1. Vá para **"Database"** → **"Tables"**
2. Verifique cada tabela:
   - `profiles`
   - `customers`
   - `carnes`
   - `installments`
   - `payment_history`
   - `user_settings`

3. Para cada uma, confirme que **RLS is enabled** ✅

4. Clique em **"View policies"** para ver as políticas de segurança

Se não estiver habilitado, execute novamente o `schema.sql`.

---

## 📦 Passo 7: Instalar Dependências

No terminal do projeto:

```bash
npm install @supabase/supabase-js
```

---

## ✅ Passo 8: Testar Conexão

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:3000`

3. Abra o console do navegador (F12)

4. Você deve ver:
```
✅ Supabase connected
```

Se ver erro, verifique se as variáveis de ambiente estão corretas.

---

## 🧪 Passo 9: Criar Primeiro Usuário

### Via Interface Web

1. Vá para **"Authentication"** → **"Users"**
2. Clique em **"Add user"**
3. Preencha:
   - **Email:** seu@email.com
   - **Password:** senha-segura-123
   - **Auto Confirm User:** ✅ (para desenvolvimento)
4. Clique em **"Create user"**

### Via Aplicação

1. Na tela de login, clique em **"Cadastrar"** (se implementado)
2. OU use o código:

```typescript
import { auth } from './services/supabaseClient';

// Criar usuário
await auth.signUp('seu@email.com', 'senha-segura-123', {
  username: 'admin',
  full_name: 'Administrador'
});
```

---

## 📊 Passo 10: Verificar Dados

### Ver Tabelas

1. Vá para **"Table Editor"**
2. Selecione cada tabela para ver os dados
3. Após criar um carnê, você deve ver dados em:
   - `customers`
   - `carnes`
   - `installments`

### Via SQL Editor

```sql
-- Ver todos os carnes
SELECT * FROM carnes;

-- Ver parcelas de um carnê
SELECT * FROM installments WHERE carne_id = 'uuid-do-carne';

-- Ver estatísticas de um usuário
SELECT * FROM get_user_dashboard_stats('uuid-do-usuario');
```

---

## 🔄 Passo 11: Configurar Realtime (Opcional)

Para atualizações em tempo real:

1. Vá para **"Database"** → **"Replication"**
2. Habilite replicação para:
   - `installments`
   - `carnes`

3. No código, use:
```typescript
import { realtime } from './services/supabaseClient';

// Assinar mudanças
realtime.subscribeToInstallments(userId, (payload) => {
  console.log('Mudança detectada:', payload);
});
```

---

## ⏰ Passo 12: Configurar Cron Job (Opcional)

Para marcar parcelas vencidas automaticamente:

1. Vá para **"Database"** → **"Cron"**
2. Clique em **"Create a new cron job"**
3. Configure:
   - **Name:** mark-overdue-installments
   - **Schedule:** `0 1 * * *` (01:00 AM diariamente)
   - **Query:**
   ```sql
   SELECT mark_overdue_installments();
   ```
4. Clique em **"Create cron job"**

---

## 🚀 Passo 13: Migração de Dados Locais (Se Aplicável)

Se você já tem dados no localStorage:

```typescript
import { supabase, db } from './services/supabaseClient';

// Migrar clientes
const localCustomers = JSON.parse(localStorage.getItem('carnepix_data') || '[]');
for (const customer of localCustomers) {
  await db.createCustomer({
    user_id: userId,
    name: customer.name,
    document: customer.document
  });
}
```

---

## 🔍 Troubleshooting

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave correta
- ✅ Certifique-se de usar `anon` key, não `service_role`
- ✅ Reinicie o servidor (`npm run dev`)

### Erro: "Row Level Security policy violation"
- ✅ Verifique se RLS está habilitado
- ✅ Execute novamente o `schema.sql`
- ✅ Verifique se está autenticado (logged in)

### Erro: "relation does not exist"
- ✅ Execute o `schema.sql` completamente
- ✅ Verifique se todas as tabelas foram criadas

### Dados não aparecem
- ✅ Verifique se está logado com o usuário correto
- ✅ Use SQL Editor para ver dados diretamente
- ✅ Verifique policies de RLS

---

## 📈 Monitoramento e Logs

### Ver Logs de Autenticação

1. **"Authentication"** → **"Logs"**
2. Veja tentativas de login, signups, etc.

### Ver Logs de Database

1. **"Database"** → **"Logs"**
2. Veja queries SQL executadas

### Uso de Storage

1. **"Settings"** → **"Billing"**
2. Monitore uso de:
   - Database size
   - API requests
   - Bandwidth

---

## 🆓 Limites do Plano Gratuito

| Recurso | Limite Free |
|---------|-------------|
| Database | 500 MB |
| API Requests | 50,000/mês |
| Auth Users | Unlimited |
| Storage | 1 GB |
| Edge Functions | 25/mês |

⚠️ Para produção, considere upgrade para **Pro** ($25/mês)

---

## 🔐 Segurança em Produção

### Checklist:

- [ ] Habilitar confirmação de email
- [ ] Configurar rate limiting
- [ ] Adicionar 2FA para admin
- [ ] Revisar policies de RLS
- [ ] Configurar backups automáticos
- [ ] Monitorar logs regularmente
- [ ] Usar HTTPS apenas
- [ ] Implementar CAPTCHA no login

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Client Libraries](https://supabase.com/docs/reference/javascript/introduction)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 💡 Próximos Passos

Após configurar o Supabase:

1. ✅ Teste criar um carnê
2. ✅ Teste marcar parcela como paga
3. ✅ Verifique relatórios financeiros
4. ✅ Configure backup automático
5. ✅ Implemente testes E2E
6. ✅ Prepare para deploy em produção

---

## 🆘 Suporte

Problemas? Entre em contato:
- [Discord Supabase](https://discord.supabase.com)
- [GitHub Issues](seu-repositorio/issues)
- [Documentação do Projeto](./README.md)

---

**Última atualização:** 23/12/2024  
**Versão:** 1.0.0

✅ **Configuração completa! Seu backend está pronto!**
