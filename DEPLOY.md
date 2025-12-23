# 🚀 Guia de Deploy para Produção

Este guia fornece instruções passo a passo para fazer deploy seguro do CarnêPIB.RA em produção.

## ⚠️ IMPORTANTE - Leia antes de prosseguir

**NUNCA** faça deploy do sistema em produção sem implementar TODAS as medidas de segurança listadas abaixo. O sistema atual foi desenvolvido para demonstração e uso local.

---

## 📋 Checklist Pré-Deploy

### 1. Segurança Básica

- [ ] Alterar credenciais de login padrão
- [ ] Implementar autenticação backend real (JWT/OAuth)
- [ ] Configurar HTTPS obrigatório
- [ ] Adicionar certificado SSL/TLS válido
- [ ] Revisar e apertar Content Security Policy
- [ ] Configurar rate limiting no servidor
- [ ] Implementar WAF (Web Application Firewall)

### 2. Infraestrutura

- [ ] Configurar banco de dados seguro (PostgreSQL/MongoDB)
- [ ] Implementar backend API (Node.js/Express)
- [ ] Configurar servidor de produção (Nginx/Apache)
- [ ] Implementar sistema de backup automático
- [ ] Configurar monitoramento de logs
- [ ] Preparar plano de disaster recovery

### 3. Variáveis de Ambiente

- [ ] Criar arquivo `.env.production`
- [ ] NUNCA commitar `.env` no repositório
- [ ] Usar secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rotacionar chaves API regularmente

### 4. Código

- [ ] Executar `npm run build` para otimização
- [ ] Minificar todos os assets
- [ ] Configurar cache de recursos
- [ ] Implementar lazy loading
- [ ] Otimizar imagens e fontes

---

## 🔧 Opções de Hospedagem

### Opção 1: Vercel (Recomendado para iniciantes)

**Prós:** Deploy simples, HTTPS automático, CDN global
**Contras:** Necessita backend separado para dados

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Configurações necessárias:**
- Adicionar `GEMINI_API_KEY` nas Environment Variables
- Configurar redirecionamento para HTTPS
- Adicionar domínio customizado

### Opção 2: Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist
```

### Opção 3: VPS (Digital Ocean, AWS, etc)

**Requisitos:**
- Servidor Ubuntu 20.04+
- Node.js 16+
- Nginx
- PostgreSQL

```bash
# 1. Configurar servidor
sudo apt update
sudo apt install nginx postgresql nodejs npm

# 2. Clonar repositório
git clone <seu-repo>
cd carnepibra

# 3. Instalar dependências
npm install

# 4. Build
npm run build

# 5. Configurar Nginx (ver seção abaixo)

# 6. Configurar PM2 para manter app rodando
npm install -g pm2
pm2 start npm --name "carnepibra" -- start
pm2 save
pm2 startup
```

---

## 🔐 Configuração de Segurança Avançada

### 1. Implementar Backend API

**Exemplo simples com Express:**

```javascript
// server.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Segurança
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requisições
});
app.use(limiter);

// Endpoint de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Buscar usuário no banco de dados
  // Comparar hash bcrypt
  // Gerar JWT
  
  res.json({ token: 'jwt-token-aqui' });
});

// Endpoint de carnês (protegido)
app.post('/api/carnes', authenticateToken, async (req, res) => {
  // Salvar carnê no banco de dados
  res.json({ success: true });
});

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  // Verificar JWT
  next();
}

app.listen(3001, () => console.log('API rodando na porta 3001'));
```

### 2. Configurar Nginx

**Arquivo `/etc/nginx/sites-available/carnepibra`:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;" always;

    root /var/www/carnepibra/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Obter Certificado SSL Grátis

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

---

## 🗄️ Banco de Dados

### PostgreSQL Schema Exemplo

```sql
-- Criar banco
CREATE DATABASE carnepibra;

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de carnês
CREATE TABLE carnes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_document VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de parcelas
CREATE TABLE installments (
    id SERIAL PRIMARY KEY,
    carne_id INTEGER REFERENCES carnes(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    pix_payload TEXT NOT NULL,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_carnes_user_id ON carnes(user_id);
CREATE INDEX idx_installments_carne_id ON installments(carne_id);
CREATE INDEX idx_installments_status ON installments(status);
```

---

## 📊 Monitoramento

### 1. Logs

```bash
# PM2 logs
pm2 logs carnepibra

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Ferramentas Recomendadas

- **Sentry** - Tracking de erros
- **LogRocket** - Session replay
- **Google Analytics** - Analytics
- **Uptime Robot** - Monitoramento de disponibilidade

### 3. Alertas

Configure alertas para:
- Servidor down
- Erros 500+
- Alto uso de CPU/memória
- Tentativas de login falhadas
- Ataques de força bruta

---

## 🧪 Testes Antes do Deploy

### 1. Testes de Segurança

```bash
# Scan de vulnerabilidades
npm audit

# Dependências desatualizadas
npm outdated

# OWASP ZAP (scan de segurança web)
# Baixar em: https://www.zaproxy.org/
```

### 2. Testes de Performance

```bash
# Lighthouse
npx lighthouse https://seu-site.com --view

# WebPageTest
# Acessar: https://www.webpagetest.org/
```

### 3. Testes de Penetração

- Testar SQL injection
- Testar XSS
- Testar CSRF
- Testar autenticação bypass
- Testar rate limiting

---

## 🔄 Processo de Deploy

### 1. Desenvolvimento

```bash
git checkout develop
# Fazer alterações
git commit -m "feat: nova funcionalidade"
git push origin develop
```

### 2. Staging

```bash
git checkout staging
git merge develop
npm run build
# Testar em ambiente staging
```

### 3. Produção

```bash
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags

# Deploy
npm run build
# Upload para servidor ou deploy via CI/CD
```

---

## 📝 Pós-Deploy

- [ ] Testar todos os fluxos principais
- [ ] Verificar certificado SSL
- [ ] Testar em diferentes navegadores
- [ ] Testar em dispositivos móveis
- [ ] Configurar backup automático
- [ ] Documentar processo de rollback
- [ ] Treinar equipe de suporte

---

## 🆘 Rollback de Emergência

Se algo der errado:

```bash
# PM2
pm2 restart carnepibra

# Reverter para versão anterior
git checkout v1.0.0
npm run build
# Re-deploy

# Restaurar backup do banco
psql carnepibra < backup.sql
```

---

## 📞 Suporte

Para dúvidas sobre deploy:
- Consulte a documentação do seu provedor
- Contrate um DevOps profissional
- Entre em contato com suporte técnico

---

**Última atualização:** 23/12/2024
**Versão:** 1.0.0

**⚠️ Lembre-se:** Segurança não é opcional em produção. Invista tempo em fazer certo!
