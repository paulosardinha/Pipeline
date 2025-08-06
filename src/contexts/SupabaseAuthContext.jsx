import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { subscriptionService } from '@/lib/subscriptionService';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    // Verificar status da assinatura se houver usuário
    if (session?.user?.email) {
      try {
        const status = await subscriptionService.checkSubscriptionStatus(session.user.email);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setSubscriptionStatus({ hasActiveSubscription: false, message: 'Erro ao verificar assinatura' });
      }
    } else {
      setSubscriptionStatus(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    // Verificar se o email tem assinatura ativa antes de permitir cadastro
    const subscriptionCheck = await subscriptionService.checkSubscriptionStatus(email);
    
    if (!subscriptionCheck.hasActiveSubscription) {
      const error = new Error('Email não possui assinatura ativa. Verifique se você completou a compra na Hotmart e aguarde alguns minutos para o sistema processar.');
      toast({
        variant: "destructive",
        title: "Cadastro não permitido",
        description: error.message,
      });
      return { error };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    // Verificar se o email tem assinatura ativa antes de permitir login
    const subscriptionCheck = await subscriptionService.checkSubscriptionStatus(email);
    
    if (!subscriptionCheck.hasActiveSubscription) {
      const error = new Error('Sua assinatura não está ativa. Verifique se o pagamento foi processado ou reative sua assinatura na Hotmart.');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: error.message,
      });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    }

    return { error };
  }, [toast]);

  const resetPassword = useCallback(async (email) => {
    // Verificar se o email tem assinatura ativa antes de permitir reset
    const subscriptionCheck = await subscriptionService.checkSubscriptionStatus(email);
    
    if (!subscriptionCheck.hasActiveSubscription) {
      const error = new Error('Email não possui assinatura ativa. Verifique se você completou a compra na Hotmart.');
      toast({
        variant: "destructive",
        title: "Reset de senha não permitido",
        description: error.message,
      });
      return { error };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message || "Não foi possível enviar o e-mail de reset de senha.",
      });
    } else {
      toast({
        title: "E-mail enviado com sucesso!",
        description: "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    subscriptionStatus,
    signUp,
    signIn,
    resetPassword,
    signOut,
  }), [user, session, loading, subscriptionStatus, signUp, signIn, resetPassword, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
