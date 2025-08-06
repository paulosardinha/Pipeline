// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    // Verificar método
    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Método não permitido'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configurações do Supabase não encontradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let email: string;

    if (req.method === 'POST') {
      // Para requisições POST, pegar email do body
      const body = await req.json();
      email = body.email;
    } else {
      // Para requisições GET, pegar email dos query params
      const url = new URL(req.url);
      email = url.searchParams.get('email') || '';
    }

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email é obrigatório'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verificar se existe assinatura ativa
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        return new Response(JSON.stringify({
          success: true,
          hasActiveSubscription: false,
          message: 'Nenhuma assinatura ativa encontrada',
          subscription: null
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      throw error;
    }

    // Verificar se a assinatura ainda está ativa baseado no updated_at
    const lastUpdate = new Date(subscription.updated_at);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    // Se a última atualização foi há mais de 30 dias, considerar como inativa
    if (daysSinceUpdate > 30) {
      return new Response(JSON.stringify({
        success: true,
        hasActiveSubscription: false,
        message: 'Assinatura expirada',
        subscription: subscription
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      hasActiveSubscription: true,
      message: 'Assinatura ativa encontrada',
      subscription: subscription
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Erro na função check-subscription:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}); 