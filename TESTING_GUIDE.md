# Guia de Testes - Sistema de Verificação de Assinaturas

## 🧪 Como Testar o Sistema

### 1. Preparação Inicial

#### 1.1 Verificar Configurações
```bash
# Verificar se as variáveis de ambiente estão configuradas
# No Supabase Dashboard > Settings > Environment Variables
SUPABASE_URL=https://adsjmrwteeafwsqfcgcw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
HOTMART_WEBHOOK_SECRET=webhook-hotmart-seguro-2025-xyz78
```

#### 1.2 Verificar Tabela Subscriptions
```sql
-- No Supabase SQL Editor, verificar se a tabela existe
SELECT * FROM subscriptions LIMIT 5;

-- Se não existir, criar a tabela:
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  subscription_status TEXT,
  hotmart_transaction_id TEXT,
  hotmart_subscriber_code TEXT,
  hotmart_plan_id TEXT,
  hotmart_plan_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 Verificar Funções Edge
```bash
# Verificar se as funções foram deployadas
# No Supabase Dashboard > Edge Functions
# - hotmart-webhook
# - check-subscription
```

### 2. Testes de Funcionamento

#### 2.1 Teste de Webhook da Hotmart

**Passo 1: Simular Webhook**
```bash
# Usar curl para simular um webhook da Hotmart
curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook?secret=webhook-hotmart-seguro-2025-xyz78" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: webhook-hotmart-seguro-2025-xyz78" \
  -d '{
    "event": "PURCHASE_COMPLETE",
    "data": {
      "buyer": {
        "email": "teste@exemplo.com"
      },
      "purchase": {
        "transaction": "TEST123456"
      },
      "subscription": {
        "status": "ACTIVE",
        "subscriber": {
          "code": "SUB123"
        },
        "plan": {
          "id": "PLAN123",
          "name": "Pipeline Alfa Mensal"
        }
      }
    }
  }'
```

**Passo 2: Verificar se foi registrado**
```sql
-- No Supabase SQL Editor
SELECT * FROM subscriptions WHERE email = 'teste@exemplo.com';
```

#### 2.2 Teste de Verificação de Assinatura

**Passo 1: Testar Função Edge**
```bash
# Testar a função check-subscription
curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/check-subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com"
  }'
```

**Passo 2: Verificar Resposta**
```json
{
  "success": true,
  "hasActiveSubscription": true,
  "message": "Assinatura ativa encontrada",
  "subscription": {
    "email": "teste@exemplo.com",
    "status": "active",
    "hotmart_plan_name": "Pipeline Alfa Mensal"
  }
}
```

#### 2.3 Teste de Login/Cadastro

**Cenário 1: Email com Assinatura Ativa**
1. Acesse a aplicação
2. Tente fazer cadastro com `teste@exemplo.com`
3. Deve mostrar "Assinatura ativa" e permitir cadastro

**Cenário 2: Email sem Assinatura**
1. Tente fazer cadastro com `semassinatura@exemplo.com`
2. Deve mostrar "Assinatura não encontrada" e negar acesso

**Cenário 3: Email Inválido**
1. Tente fazer cadastro com `emailinvalido`
2. Deve mostrar erro de email inválido

### 3. Testes de Interface

#### 3.1 Teste do Componente Auth
```javascript
// No console do navegador, testar verificação de assinatura
// 1. Abrir DevTools (F12)
// 2. Ir para Console
// 3. Testar:

// Simular verificação de assinatura
const testEmail = 'teste@exemplo.com';
fetch('/api/check-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail })
})
.then(res => res.json())
.then(data => console.log('Status:', data));
```

#### 3.2 Teste do Dashboard
1. Fazer login com email que tem assinatura ativa
2. Verificar se o componente `SubscriptionStatus` aparece
3. Verificar se mostra informações corretas:
   - Status: "Ativa"
   - Plano: "Pipeline Alfa Mensal"
   - Última atualização: Data atual

### 4. Testes de Segurança

#### 4.1 Teste de Acesso sem Assinatura
```javascript
// Simular usuário sem assinatura
// 1. Criar usuário no Supabase Auth
// 2. Tentar acessar dados sem assinatura
// 3. Verificar se é bloqueado

// No console do navegador:
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('user_id', 'user-id-sem-assinatura');

console.log('Acesso negado:', error);
```

#### 4.2 Teste de Webhook Inválido
```bash
# Testar webhook sem segredo
curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Deve retornar 401 Unauthorized
```

### 5. Testes de Cenários Reais

#### 5.1 Fluxo Completo de Compra
1. **Simular Compra na Hotmart**
   ```bash
   # Enviar webhook de compra
   curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook?secret=webhook-hotmart-seguro-2025-xyz78" \
     -H "Content-Type: application/json" \
     -d '{
       "event": "PURCHASE_COMPLETE",
       "data": {
         "buyer": {"email": "novo@cliente.com"},
         "purchase": {"transaction": "TXN789"},
         "subscription": {
           "status": "ACTIVE",
           "plan": {"name": "Pipeline Alfa Mensal"}
         }
       }
     }'
   ```

2. **Testar Cadastro**
   - Acessar aplicação
   - Tentar cadastro com `novo@cliente.com`
   - Verificar se permite acesso

3. **Testar Uso**
   - Fazer login
   - Criar alguns leads
   - Verificar se dados são salvos

#### 5.2 Teste de Expiração de Assinatura
1. **Simular Expiração**
   ```sql
   -- No Supabase SQL Editor
   UPDATE subscriptions 
   SET status = 'cancelled', updated_at = NOW() - INTERVAL '31 days'
   WHERE email = 'teste@exemplo.com';
   ```

2. **Testar Acesso**
   - Tentar fazer login
   - Verificar se é bloqueado
   - Verificar se mostra mensagem de expiração

#### 5.3 Teste de Renovação
1. **Simular Renovação**
   ```bash
   # Enviar webhook de renovação
   curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook?secret=webhook-hotmart-seguro-2025-xyz78" \
     -H "Content-Type: application/json" \
     -d '{
       "event": "SUBSCRIPTION_RESTARTED",
       "data": {
         "buyer": {"email": "teste@exemplo.com"},
         "subscription": {"status": "ACTIVE"}
       }
     }'
   ```

2. **Testar Acesso Restaurado**
   - Tentar fazer login
   - Verificar se acesso é restaurado
   - Verificar se dados anteriores estão preservados

### 6. Testes de Performance

#### 6.1 Teste de Verificação Contínua
```javascript
// No console do navegador, monitorar verificações
// 1. Fazer login
// 2. Abrir DevTools > Network
// 3. Filtrar por "check-subscription"
// 4. Verificar se requisições acontecem a cada 5 minutos
```

#### 6.2 Teste de Debounce
```javascript
// Testar se não faz muitas requisições durante digitação
// 1. Ir para tela de cadastro
// 2. Digitar email rapidamente
// 3. Verificar no Network se só faz uma requisição após 500ms
```

### 7. Testes de Erro

#### 7.1 Teste de Falha de Conexão
```javascript
// Simular falha de rede
// 1. Desconectar internet
// 2. Tentar verificar assinatura
// 3. Verificar se usa fallback (verificação direta)
```

#### 7.2 Teste de Dados Inválidos
```bash
# Testar webhook com dados inválidos
curl -X POST "https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook?secret=webhook-hotmart-seguro-2025-xyz78" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "INVALID_EVENT",
    "data": {}
  }'
```

### 8. Checklist de Testes

#### ✅ Testes Básicos
- [ ] Webhook da Hotmart recebe e processa dados
- [ ] Tabela subscriptions é atualizada corretamente
- [ ] Função check-subscription retorna status correto
- [ ] Login/cadastro verifica assinatura antes de permitir
- [ ] Interface mostra status da assinatura
- [ ] Dashboard exibe componente SubscriptionStatus

#### ✅ Testes de Segurança
- [ ] Acesso negado para emails sem assinatura
- [ ] Webhook rejeita requisições sem segredo
- [ ] Dados são isolados por usuário
- [ ] Logout automático quando assinatura expira

#### ✅ Testes de Cenários
- [ ] Fluxo completo de compra → cadastro → uso
- [ ] Expiração de assinatura → bloqueio
- [ ] Renovação de assinatura → restauração
- [ ] Preservação de dados após renovação

#### ✅ Testes de Performance
- [ ] Verificação contínua funciona a cada 5 minutos
- [ ] Debounce evita requisições excessivas
- [ ] Fallback funciona quando função Edge falha

### 9. Comandos Úteis

#### 9.1 Verificar Logs
```bash
# No Supabase Dashboard > Logs
# Filtrar por:
# - "hotmart-webhook"
# - "check-subscription"
# - "subscription"
```

#### 9.2 Limpar Dados de Teste
```sql
-- Limpar dados de teste
DELETE FROM subscriptions WHERE email LIKE '%teste%';
DELETE FROM auth.users WHERE email LIKE '%teste%';
```

#### 9.3 Verificar Status do Sistema
```sql
-- Verificar todas as assinaturas
SELECT 
  email, 
  status, 
  hotmart_plan_name, 
  updated_at,
  CASE 
    WHEN updated_at < NOW() - INTERVAL '30 days' THEN 'EXPIRADA'
    ELSE 'ATIVA'
  END as status_calculado
FROM subscriptions
ORDER BY updated_at DESC;
```

### 10. Próximos Passos

Após completar os testes:
1. **Documentar resultados** dos testes
2. **Corrigir problemas** encontrados
3. **Otimizar performance** se necessário
4. **Implementar melhorias** baseadas nos testes
5. **Configurar monitoramento** contínuo

## 🎯 Dicas Importantes

1. **Teste em ambiente de desenvolvimento** antes de produção
2. **Use dados fictícios** para testes
3. **Monitore logs** durante os testes
4. **Teste todos os cenários** possíveis
5. **Documente problemas** encontrados
6. **Valide com usuários reais** quando possível 