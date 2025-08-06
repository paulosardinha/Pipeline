// Serviço para integração com Hotmart API
// Documentação: https://developers.hotmart.com/payments/api/v1

const HOTMART_API_BASE_URL = 'https://developers.hotmart.com/payments/api/v1';
const HOTMART_CLIENT_ID = process.env.VITE_HOTMART_CLIENT_ID;
const HOTMART_CLIENT_SECRET = process.env.VITE_HOTMART_CLIENT_SECRET;

class HotmartService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Obter token de acesso da Hotmart
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://developers.hotmart.com/security/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: HOTMART_CLIENT_ID,
          client_secret: HOTMART_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao obter token de acesso da Hotmart');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expira 1 minuto antes

      return this.accessToken;
    } catch (error) {
      console.error('Erro ao obter token da Hotmart:', error);
      throw error;
    }
  }

  // Verificar se um email tem assinatura ativa
  async checkSubscriptionStatus(email) {
    try {
      const token = await this.getAccessToken();
      
      // Buscar usuário por email
      const userResponse = await fetch(`${HOTMART_API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          return { hasActiveSubscription: false, message: 'Usuário não encontrado na Hotmart' };
        }
        throw new Error('Erro ao buscar usuário na Hotmart');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Buscar assinaturas ativas do usuário
      const subscriptionsResponse = await fetch(`${HOTMART_API_BASE_URL}/users/${userId}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!subscriptionsResponse.ok) {
        throw new Error('Erro ao buscar assinaturas na Hotmart');
      }

      const subscriptionsData = await subscriptionsResponse.json();
      
      // Verificar se há assinaturas ativas
      const activeSubscriptions = subscriptionsData.items?.filter(sub => 
        sub.status === 'ACTIVE' && 
        new Date(sub.next_payment_date) > new Date()
      ) || [];

      return {
        hasActiveSubscription: activeSubscriptions.length > 0,
        subscriptions: activeSubscriptions,
        message: activeSubscriptions.length > 0 
          ? 'Assinatura ativa encontrada' 
          : 'Nenhuma assinatura ativa encontrada'
      };

    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      return { 
        hasActiveSubscription: false, 
        message: 'Erro ao verificar status da assinatura',
        error: error.message 
      };
    }
  }

  // Verificar se um produto específico está ativo para o usuário
  async checkProductSubscription(email, productId) {
    try {
      const token = await this.getAccessToken();
      
      // Buscar usuário por email
      const userResponse = await fetch(`${HOTMART_API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        return { hasActiveSubscription: false, message: 'Usuário não encontrado' };
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Buscar assinaturas específicas do produto
      const subscriptionsResponse = await fetch(`${HOTMART_API_BASE_URL}/users/${userId}/subscriptions?product_id=${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!subscriptionsResponse.ok) {
        throw new Error('Erro ao buscar assinaturas do produto');
      }

      const subscriptionsData = await subscriptionsResponse.json();
      
      const activeSubscriptions = subscriptionsData.items?.filter(sub => 
        sub.status === 'ACTIVE' && 
        new Date(sub.next_payment_date) > new Date()
      ) || [];

      return {
        hasActiveSubscription: activeSubscriptions.length > 0,
        subscriptions: activeSubscriptions,
        message: activeSubscriptions.length > 0 
          ? 'Assinatura ativa encontrada' 
          : 'Nenhuma assinatura ativa encontrada para este produto'
      };

    } catch (error) {
      console.error('Erro ao verificar assinatura do produto:', error);
      return { 
        hasActiveSubscription: false, 
        message: 'Erro ao verificar assinatura do produto',
        error: error.message 
      };
    }
  }
}

// Instância singleton do serviço
export const hotmartService = new HotmartService();

// Função helper para verificar status de assinatura
export const checkHotmartSubscription = async (email, productId = null) => {
  try {
    if (productId) {
      return await hotmartService.checkProductSubscription(email, productId);
    } else {
      return await hotmartService.checkSubscriptionStatus(email);
    }
  } catch (error) {
    console.error('Erro ao verificar assinatura Hotmart:', error);
    return { 
      hasActiveSubscription: false, 
      message: 'Erro ao verificar assinatura',
      error: error.message 
    };
  }
}; 