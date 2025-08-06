#!/usr/bin/env node

/**
 * Script de Teste Automatizado - Sistema de Verificação de Assinaturas
 * 
 * Como usar:
 * 1. npm install node-fetch (se necessário)
 * 2. node test-subscription-system.js
 */

const fetch = require('node-fetch');

// Configurações
const SUPABASE_URL = 'https://adsjmrwteeafwsqfcgcw.supabase.co';
const WEBHOOK_SECRET = 'webhook-hotmart-seguro-2025-xyz78';
const TEST_EMAIL = 'teste@exemplo.com';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Funções de teste
async function testWebhook() {
  logInfo('Testando webhook da Hotmart...');
  
  try {
    const webhookData = {
      event: 'PURCHASE_COMPLETE',
      data: {
        buyer: {
          email: TEST_EMAIL
        },
        purchase: {
          transaction: 'TEST123456'
        },
        subscription: {
          status: 'ACTIVE',
          subscriber: {
            code: 'SUB123'
          },
          plan: {
            id: 'PLAN123',
            name: 'Pipeline Alfa Mensal'
          }
        }
      }
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/hotmart-webhook?secret=${WEBHOOK_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('Webhook processado com sucesso');
      return true;
    } else {
      logError(`Webhook falhou: ${result.message || result.error}`);
      return false;
    }
  } catch (error) {
    logError(`Erro no webhook: ${error.message}`);
    return false;
  }
}

async function testCheckSubscription() {
  logInfo('Testando verificação de assinatura...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      if (result.hasActiveSubscription) {
        logSuccess('Assinatura ativa encontrada');
      } else {
        logWarning('Assinatura não encontrada ou inativa');
      }
      return result.hasActiveSubscription;
    } else {
      logError(`Verificação falhou: ${result.message || result.error}`);
      return false;
    }
  } catch (error) {
    logError(`Erro na verificação: ${error.message}`);
    return false;
  }
}

async function testInvalidWebhook() {
  logInfo('Testando webhook inválido...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/hotmart-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    });

    if (response.status === 401) {
      logSuccess('Webhook inválido rejeitado corretamente');
      return true;
    } else {
      logError(`Webhook inválido não foi rejeitado. Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Erro no teste de webhook inválido: ${error.message}`);
    return false;
  }
}

async function testSubscriptionExpiration() {
  logInfo('Testando expiração de assinatura...');
  
  try {
    // Primeiro, criar uma assinatura expirada
    const expiredData = {
      event: 'SUBSCRIPTION_EXPIRED',
      data: {
        buyer: {
          email: 'expirado@exemplo.com'
        },
        subscription: {
          status: 'EXPIRED'
        }
      }
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/hotmart-webhook?secret=${WEBHOOK_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(expiredData)
    });

    if (response.ok) {
      // Agora testar verificação
      const checkResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'expirado@exemplo.com' })
      });

      const result = await checkResponse.json();
      
      if (result.hasActiveSubscription === false) {
        logSuccess('Expiração de assinatura funcionando corretamente');
        return true;
      } else {
        logError('Expiração de assinatura não funcionou');
        return false;
      }
    } else {
      logError('Falha ao simular expiração');
      return false;
    }
  } catch (error) {
    logError(`Erro no teste de expiração: ${error.message}`);
    return false;
  }
}

async function testSubscriptionRenewal() {
  logInfo('Testando renovação de assinatura...');
  
  try {
    const renewalData = {
      event: 'SUBSCRIPTION_RESTARTED',
      data: {
        buyer: {
          email: TEST_EMAIL
        },
        subscription: {
          status: 'ACTIVE'
        }
      }
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/hotmart-webhook?secret=${WEBHOOK_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(renewalData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      logSuccess('Renovação de assinatura processada com sucesso');
      return true;
    } else {
      logError(`Renovação falhou: ${result.message || result.error}`);
      return false;
    }
  } catch (error) {
    logError(`Erro no teste de renovação: ${error.message}`);
    return false;
  }
}

// Função principal
async function runTests() {
  log('🚀 Iniciando testes do sistema de verificação de assinaturas...', 'bold');
  log('');
  
  const tests = [
    { name: 'Webhook da Hotmart', fn: testWebhook },
    { name: 'Verificação de Assinatura', fn: testCheckSubscription },
    { name: 'Webhook Inválido', fn: testInvalidWebhook },
    { name: 'Expiração de Assinatura', fn: testSubscriptionExpiration },
    { name: 'Renovação de Assinatura', fn: testSubscriptionRenewal }
  ];

  const results = [];
  
  for (const test of tests) {
    log(`\n${colors.bold}${test.name}${colors.reset}`);
    log('─'.repeat(test.name.length));
    
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
      
      if (result) {
        logSuccess(`${test.name} passou`);
      } else {
        logError(`${test.name} falhou`);
      }
    } catch (error) {
      logError(`${test.name} falhou com erro: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Resumo dos resultados
  log('\n' + '='.repeat(50));
  log('📊 RESUMO DOS TESTES', 'bold');
  log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  log('');
  log(`Total: ${passed} passaram, ${failed} falharam`, passed > failed ? 'green' : 'red');
  
  if (failed === 0) {
    log('\n🎉 Todos os testes passaram!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima.', 'yellow');
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runTests().catch(error => {
    logError(`Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testWebhook,
  testCheckSubscription,
  testInvalidWebhook,
  testSubscriptionExpiration,
  testSubscriptionRenewal,
  runTests
}; 