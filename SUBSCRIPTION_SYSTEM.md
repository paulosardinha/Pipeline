# Sistema de Verificação de Assinaturas - Pipeline Alfa

## Visão Geral

O sistema de verificação de assinaturas do Pipeline Alfa garante que apenas usuários com assinaturas ativas na Hotmart possam acessar a ferramenta. O sistema integra-se com a Hotmart através de webhooks e verifica o status das assinaturas em tempo real.

## Fluxo de Funcionamento

### 1. Compra na Hotmart
- Cliente compra a ferramenta na Hotmart
- Hotmart envia webhook para o Supabase com os dados da compra
- Sistema registra a assinatura na tabela `subscriptions`

### 2. Cadastro/Login no Sistema
- Usuário tenta fazer cadastro ou login com o email usado na compra
- Sistema verifica se existe assinatura ativa para o email
- Se não existir, acesso é negado com mensagem explicativa
- Se existir, usuário pode prosseguir

### 3. Verificação Contínua
- Sistema verifica assinatura a cada 5 minutos
- Se assinatura expirar, usuário é notificado e redirecionado para logout
- Dados do usuário são preservados para quando a assinatura for reativada

## Componentes do Sistema

### 1. Tabela `subscriptions` (Supabase)
```sql
CREATE TABLE subscriptions (
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

### 2. Webhook da Hotmart (`supabase/functions/hotmart-webhook/index.ts`)
- Recebe notificações da Hotmart sobre mudanças de status
- Processa eventos: `PURCHASE_COMPLETE`, `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_CANCELLED`, etc.
- Atualiza a tabela `subscriptions` automaticamente

### 3. Função de Verificação (`supabase/functions/check-subscription/index.ts`)
- Verifica se um email tem assinatura ativa
- Retorna status da assinatura e informações relevantes
- Usada pelo frontend para validações

### 4. Serviço de Assinatura (`src/lib/subscriptionService.js`)
- Classe JavaScript para gerenciar verificações de assinatura
- Usa função Edge como primário e verificação direta como fallback
- Integra-se com o contexto de autenticação

### 5. Contexto de Autenticação (`src/contexts/SupabaseAuthContext.jsx`)
- Verifica assinatura antes de permitir login/cadastro
- Mantém status da assinatura atualizado
- Fornece informações de assinatura para componentes

### 6. Componente de Status (`src/components/SubscriptionStatus.jsx`)
- Mostra status atual da assinatura no dashboard
- Exibe informações sobre plano, última atualização, etc.
- Alerta sobre assinaturas expiradas

## Configuração

### Variáveis de Ambiente
```bash
# Supabase
SUPABASE_URL=https://adsjmrwteeafwsqfcgcw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hotmart Webhook
HOTMART_WEBHOOK_SECRET=webhook-hotmart-seguro-2025-xyz78
```

### Webhook da Hotmart
URL: `https://adsjmrwteeafwsqfcgcw.supabase.co/functions/v1/hotmart-webhook?secret=webhook-hotmart-seguro-2025-xyz78`

## Eventos Processados

### Eventos de Criação/Ativação
- `PURCHASE_COMPLETE`: Compra finalizada
- `SUBSCRIPTION_CREATED`: Assinatura criada
- `SUBSCRIPTION_RESTARTED`: Assinatura reativada

### Eventos de Cancelamento/Expiração
- `SUBSCRIPTION_CANCELLED`: Assinatura cancelada
- `SUBSCRIPTION_EXPIRED`: Assinatura expirada

## Segurança

### Validações Implementadas
1. **Verificação de Email**: Apenas emails com assinatura ativa podem acessar
2. **Verificação Contínua**: Status verificado a cada 5 minutos
3. **Logout Automático**: Usuários com assinatura expirada são desconectados
4. **Dados Isolados**: Cada usuário só acessa seus próprios dados
5. **Webhook Seguro**: Validação de segredo para webhooks da Hotmart

### Proteções
- Tokens JWT do Supabase para autenticação
- RLS (Row Level Security) no banco de dados
- Validação de assinatura antes de qualquer operação
- Logs de auditoria para todas as verificações

## Tratamento de Erros

### Cenários de Erro
1. **Assinatura não encontrada**: Usuário é orientado a verificar compra na Hotmart
2. **Assinatura expirada**: Usuário é orientado a renovar na Hotmart
3. **Erro de conexão**: Sistema usa fallback para verificação direta
4. **Webhook inválido**: Requisições são rejeitadas com erro 401

### Mensagens para o Usuário
- "Email não possui assinatura ativa. Verifique se você completou a compra na Hotmart"
- "Sua assinatura não está ativa. Verifique se o pagamento foi processado"
- "Sua assinatura expirou. Renove na Hotmart para continuar usando o sistema"

## Monitoramento

### Logs Importantes
- Verificações de assinatura (sucesso/erro)
- Webhooks recebidos da Hotmart
- Tentativas de acesso sem assinatura
- Renovações de assinatura

### Métricas
- Taxa de conversão (compra → cadastro)
- Tempo médio entre compra e primeiro acesso
- Taxa de renovação de assinaturas
- Usuários ativos vs. inativos

## Manutenção

### Tarefas Regulares
1. **Monitorar logs** de webhooks e verificações
2. **Verificar falhas** de sincronização com Hotmart
3. **Atualizar documentação** da API da Hotmart
4. **Revisar políticas** de segurança e acesso

### Troubleshooting
1. **Webhook não recebido**: Verificar configuração na Hotmart
2. **Verificação falhando**: Verificar função Edge e logs
3. **Usuário sem acesso**: Verificar tabela subscriptions
4. **Dados desatualizados**: Verificar sincronização com Hotmart

## Próximos Passos

### Melhorias Planejadas
1. **Dashboard de Assinaturas**: Interface para gerenciar assinaturas
2. **Notificações Push**: Alertas sobre expiração de assinatura
3. **Relatórios**: Análise de uso e conversões
4. **Integração Multi-plataforma**: Suporte a outras plataformas além da Hotmart 