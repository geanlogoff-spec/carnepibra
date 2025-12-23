# 🗄️ Backend Supabase - Documentação Completa

## 📊 Visão Geral

O backend do CarnêPIB.RA foi implementado usando **Supabase**, uma plataforma completa de Backend-as-a-Service (BaaS) que oferece:

- 🔐 **Autenticação** - Sistema completo de auth com JWT
- 🗃️ **PostgreSQL** - Banco de dados relacional robusto
- 🔒 **Row Level Security** - Segurança em nível de linha
- ⚡ **Realtime** - Atualizações em tempo real
- 📊 **APIs REST** - Geradas automaticamente
- 🔧 **Edge Functions** - Serverless functions (opcional)

---

## 🏗️ Arquitetura do Banco de Dados

### Diagrama ER (Entity Relationship)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   auth      │       │   profiles   │       │   customers │
│   .users    │──────▶│              │──────▶│             │
│   (Supabase)│  1:1  │  - username  │  1:N  │  - name     │
│             │       │  - email     │       │  - document │
└─────────────┘       │  - pix_key   │       │  - email    │
                      └──────────────┘       └─────────────┘
                             │                      │
                             │ 1:N                  │
                             ▼                      │
                      ┌──────────────┐              │
                      │    carnes    │◀─────────────┘
                      │              │
                      │  - title     │
                      │  - total     │
                      │  - status    │
                      └──────────────┘
                             │
                             │ 1:N
                             ▼
                      ┌──────────────┐
                      │ installments │
                      │              │
                      │  - number    │
                      │  - due_date  │
                      │  - amount    │
                      │  - status    │
                      │  - pix_code  │
                      └──────────────┘
```

---

## 📁 Estrutura das Tabelas

### 1. **profiles** (Perfis de Usuário)
Estende a tabela `auth.users` do Supabase

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, referencia auth.users |
| `username` | VARCHAR(50) | Nome de usuário único |
| `email` | VARCHAR(255) | Email único |
| `full_name` | VARCHAR(255) | Nome completo |
| `company_name` | VARCHAR(255) | Nome da empresa |
| `pix_key` | VARCHAR(255) | Chave PIX padrão |
| `city` | VARCHAR(100) | Cidade |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Políticas RLS:**
- ✅ Usuários podem ver e editar apenas seu próprio perfil

---

### 2. **customers** (Clientes)
Armazena informações dos clientes

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, gerado automaticamente |
| `user_id` | UUID | FK para profiles |
| `name` | VARCHAR(255) | Nome do cliente |
| `document` | VARCHAR(20) | CPF/CNPJ |
| `email` | VARCHAR(255) | Email do cliente |
| `phone` | VARCHAR(20) | Telefone |
| `address` | TEXT | Endereço completo |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Políticas RLS:**
- ✅ Usuários veem apenas seus próprios clientes
- ✅ CRUD completo apenas nos próprios dados

**Índices:**
- `idx_customers_user_id` - Busca por usuário
- `idx_customers_document` - Busca por documento
- `idx_customers_email` - Busca por email

---

### 3. **carnes** (Carnês)
Armazena os carnês criados

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, gerado automaticamente |
| `user_id` | UUID | FK para profiles |
| `customer_id` | UUID | FK para customers |
| `title` | VARCHAR(255) | Título do carnê |
| `description` | TEXT | Descrição adicional |
| `total_amount` | DECIMAL(10,2) | Valor total |
| `installments_count` | INTEGER | Número de parcelas |
| `status` | VARCHAR(20) | active/completed/cancelled |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Políticas RLS:**
- ✅ Usuários veem apenas seus próprios carnês
- ✅ CRUD completo apenas nos próprios dados

**Índices:**
- `idx_carnes_user_id` - Busca por usuário
- `idx_carnes_customer_id` - Busca por cliente
- `idx_carnes_status` - Filtragem por status
- `idx_carnes_created_at` - Ordenação por data

---

### 4. **installments** (Parcelas)
Armazena as parcelas dos carnês

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, gerado automaticamente |
| `carne_id` | UUID | FK para carnes |
| `number` | INTEGER | Número da parcela |
| `due_date` | DATE | Data de vencimento |
| `amount` | DECIMAL(10,2) | Valor da parcela |
| `status` | VARCHAR(20) | pending/paid/overdue/cancelled |
| `pix_payload` | TEXT | Código PIX (BRCode) |
| `pix_txid` | VARCHAR(50) | Transaction ID PIX |
| `payment_date` | TIMESTAMP | Data do pagamento |
| `payment_method` | VARCHAR(50) | Método de pagamento |
| `notes` | TEXT | Observações |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Políticas RLS:**
- ✅ Usuários veem apenas parcelas de seus carnês
- ✅ Atualização apenas dos próprios dados

**Índices:**
- `idx_installments_carne_id` - Busca por carnê
- `idx_installments_status` - Filtragem por status
- `idx_installments_due_date` - Ordenação por vencimento
- `idx_installments_payment_date` - Busca por pagamentos

**Constraints:**
- UNIQUE(carne_id, number) - Evita números duplicados no mesmo carnê

---

### 5. **payment_history** (Histórico de Pagamentos)
Auditoria de mudanças de status

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, gerado automaticamente |
| `installment_id` | UUID | FK para installments |
| `previous_status` | VARCHAR(20) | Status anterior |
| `new_status` | VARCHAR(20) | Novo status |
| `changed_by` | UUID | Quem alterou (FK profiles) |
| `change_reason` | TEXT | Motivo da mudança |
| `created_at` | TIMESTAMP | Quando ocorreu |

**Políticas RLS:**
- ✅ Read-only para usuários

**Triggers:**
- Criado automaticamente quando status de installment muda

---

### 6. **user_settings** (Configurações do Usuário)
Armazena preferências personalizadas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK, gerado automaticamente |
| `user_id` | UUID | FK para profiles (UNIQUE) |
| `settings` | JSONB | Configurações em JSON |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Exemplos de Settings:**
```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false
  },
  "defaultPixKey": "00.000.000/0001-00",
  "defaultCity": "SAO PAULO"
}
```

---

## 🔧 Funções do Banco de Dados

### 1. `get_carne_stats(carne_uuid)`
Retorna estatísticas de um carnê específico

**Parâmetros:**
- `carne_uuid` (UUID) - ID do carnê

**Retorno:**
```typescript
{
  total_paid: number,      // Total pago
  total_pending: number,   // Total pendente
  paid_count: number,      // Qtd paga
  pending_count: number,   // Qtd pendente
  overdue_count: number    // Qtd vencida
}
```

**Uso:**
```sql
SELECT * FROM get_carne_stats('uuid-do-carne');
```

---

### 2. `get_user_dashboard_stats(user_uuid)`
Retorna estatísticas gerais do usuário

**Parâmetros:**
- `user_uuid` (UUID) - ID do usuário

**Retorno:**
```typescript
{
  total_carnes: number,           // Total de carnês
  active_carnes: number,          // Carnês ativos
  total_receivable: number,       // Total a receber
  total_received: number,         // Total recebido
  pending_installments: number,   // Parcelas pendentes
  overdue_installments: number    // Parcelas vencidas
}
```

**Uso:**
```typescript
const stats = await db.getDashboardStats(userId);
```

---

### 3. `mark_overdue_installments()`
Marca parcelas vencidas automaticamente

**Uso:**
```sql
-- Executar via Cron diariamente
SELECT mark_overdue_installments();
```

**Configuração Cron:**
```sql
SELECT cron.schedule(
  'mark-overdue-installments',
  '0 1 * * *',  -- 01:00 AM diariamente
  'SELECT mark_overdue_installments()'
);
```

---

## 🔒 Row Level Security (RLS)

Todas as tabelas implementam RLS para garantir isolamento de dados:

### Exemplo - Tabela Carnes

```sql
-- Ver apenas próprios carnes
CREATE POLICY "Users can view own carnes"
    ON public.carnes FOR SELECT
    USING (auth.uid() = user_id);

-- Inserir apenas com próprio user_id
CREATE POLICY "Users can insert own carnes"
    ON public.carnes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Atualizar apenas próprios carnes
CREATE POLICY "Users can update own carnes"
    ON public.carnes FOR UPDATE
    USING (auth.uid() = user_id);

-- Deletar apenas próprios carnes
CREATE POLICY "Users can delete own carnes"
    ON public.carnes FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 📊 Views (Visualizações)

### 1. `carnes_with_customers`
Junta carnes com informações do cliente

```sql
SELECT * FROM carnes_with_customers
WHERE user_id = 'uuid-do-usuario';
```

### 2. `installments_full`
Parcelas com detalhes completos (carnê + cliente)

```sql
SELECT * FROM installments_full
WHERE status = 'pending'
ORDER BY due_date;
```

---

## 🔄 Triggers Automáticos

### 1. **updated_at** (Todas as tabelas)
Atualiza automaticamente `updated_at` em qualquer UPDATE

```sql
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. **log_payment_status_change**
Registra mudanças de status em `payment_history`

```sql
CREATE TRIGGER log_installment_status_change
    AFTER UPDATE ON public.installments
    FOR EACH ROW
    EXECUTE FUNCTION log_payment_status_change();
```

### 3. **handle_new_user**
Cria perfil automaticamente ao registrar usuário

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

---

## 🚀 API Client (Frontend)

### Importar Cliente

```typescript
import { supabase, auth, db } from './services/supabaseClient';
```

### Autenticação

```typescript
// Login
const { user } = await auth.signIn('email@example.com', 'senha');

// Signup
await auth.signUp('email@example.com', 'senha', {
  username: 'usuario',
  full_name: 'Nome Completo'
});

// Logout
await auth.signOut();

// Get usuário atual
const user = await auth.getUser();
```

### Operações de Dados

```typescript
// Listar carnês
const carnes = await db.getCarnes(userId);

// Criar carnê
const result = await db.createCarne(carneData, installmentsData);

// Atualizar status de parcela
await db.updateInstallmentStatus(installmentId, 'paid', new Date());

// Deletar carnê
await db.deleteCarne(carneId);

// Estatísticas do dashboard
const stats = await db.getDashboardStats(userId);
```

### Realtime

```typescript
import { realtime } from './services/supabaseClient';

// Assinar mudanças em parcelas
const subscription = realtime.subscribeToInstallments(userId, (payload) => {
  console.log('Mudança:', payload);
  // Atualizar UI
});

// Cancelar assinatura
subscription.unsubscribe();
```

---

## 📈 Performance

### Índices Criados

- ✅ **12 índices** em colunas frequentemente consultadas
- ✅ Busca por usuário: O(log n)
- ✅ Busca por status: O(log n)
- ✅ Ordenação por data: Otimizada

### Query Performance Tips

```sql
-- BOM ✅ (usa índice)
SELECT * FROM installments WHERE status = 'pending';

-- BOM ✅ (usa índice)
SELECT * FROM carnes WHERE user_id = 'uuid' AND status = 'active';

-- EVITAR ❌ (full table scan)
SELECT * FROM installments WHERE LOWER(pix_txid) = 'valor';
```

---

## 🔐 Segurança

### Implementado ✅

- ✅ Row Level Security em todas as tabelas
- ✅ Policies para CRUD operations
- ✅ Autenticação via JWT
- ✅ Isolamento de dados por usuário
- ✅ Validação de constraints no DB
- ✅ Auditoria de mudanças (payment_history)

### Recomendações Adicionais

- 🔒 Habilitar confirmação de email
- 🔒 Implementar 2FA
- 🔒 Rate limiting no Supabase Edge Functions
- 🔒 Monitorar logs regularmente
- 🔒 Backup automático configurado

---

## 📦 Backup e Restore

### Backup Manual

```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Ou via pg_dump (se tiver acesso direto)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore

```bash
supabase db push --db-url postgresql://...
```

### Backup Automático (Supabase Pro)

- Configurado automaticamente
- Retenção de 7 dias (Free)
- Retenção de 30 dias (Pro)

---

## 📊 Monitoramento

### Métricas Importantes

1. **Database Size** - Limite free: 500 MB
2. **API Requests** - Limite free: 50k/mês
3. **Auth Users** - Ilimitado
4. **Realtime Connections** - Limite free: 200 simultâneas

### Dashboard Supabase

- **Database** → **Usage** - Ver métricas
- **Auth** → **Logs** - Ver tentativas de login
- **Database** → **Logs** - Ver queries executadas

---

## 🆘 Troubleshooting Comum

### Erro: "JWT expired"
```typescript
// Supabase renova automaticamente, mas force se necessário:
await supabase.auth.refreshSession();
```

### Erro: "RLS policy violation"
```typescript
// Verifique se está autenticado:
const { data: { session } } = await supabase.auth.getSession();
console.log('Sessão:', session);
```

### Performance lenta
```sql
-- Analise query plan:
EXPLAIN ANALYZE
SELECT * FROM your_query;
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

---

**✅ Backend totalmente configurado e pronto para produção!**
