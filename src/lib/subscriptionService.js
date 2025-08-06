import { supabase } from './customSupabaseClient';

class SubscriptionService {
  // Verificar se um email tem assinatura ativa usando a função Edge
  async checkSubscriptionStatus(email) {
    try {
      // Usar a função Edge do Supabase
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { email }
      });

      if (error) {
        console.error('Erro na função Edge:', error);
        // Fallback para verificação direta no banco
        return await this.checkSubscriptionStatusDirect(email);
      }

      return {
        hasActiveSubscription: data.hasActiveSubscription,
        message: data.message,
        subscription: data.subscription
      };

    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      // Fallback para verificação direta no banco
      return await this.checkSubscriptionStatusDirect(email);
    }
  }

  // Verificação direta no banco (fallback)
  async checkSubscriptionStatusDirect(email) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return {
            hasActiveSubscription: false,
            message: 'Nenhuma assinatura ativa encontrada',
            subscription: null
          };
        }
        throw error;
      }

      // Verificar se a assinatura ainda está ativa baseado no updated_at
      const lastUpdate = new Date(data.updated_at);
      const now = new Date();
      const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

      // Se a última atualização foi há mais de 30 dias, considerar como inativa
      if (daysSinceUpdate > 30) {
        return {
          hasActiveSubscription: false,
          message: 'Assinatura expirada',
          subscription: data
        };
      }

      return {
        hasActiveSubscription: true,
        message: 'Assinatura ativa encontrada',
        subscription: data
      };

    } catch (error) {
      console.error('Erro ao verificar status da assinatura (fallback):', error);
      return {
        hasActiveSubscription: false,
        message: 'Erro ao verificar status da assinatura',
        error: error.message
      };
    }
  }

  // Verificar se um usuário pode acessar o sistema
  async canUserAccess(email) {
    const subscriptionStatus = await this.checkSubscriptionStatus(email);
    return subscriptionStatus.hasActiveSubscription;
  }

  // Atualizar status da assinatura (usado pelo webhook)
  async updateSubscriptionStatus(email, status, subscriptionData = {}) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          email,
          status,
          subscription_status: subscriptionData.subscription_status || status,
          hotmart_transaction_id: subscriptionData.hotmart_transaction_id,
          hotmart_subscriber_code: subscriptionData.hotmart_subscriber_code,
          hotmart_plan_id: subscriptionData.hotmart_plan_id,
          hotmart_plan_name: subscriptionData.hotmart_plan_name,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Status da assinatura atualizado para ${status}`
      };

    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const subscriptionService = new SubscriptionService(); 