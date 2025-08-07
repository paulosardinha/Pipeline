import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { subscriptionService } from '@/lib/subscriptionService';

const ForgotPasswordCard = ({ initialEmail, onBack }) => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [lastResetAttempt, setLastResetAttempt] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);



  // Verificar assinatura quando email mudar
  const checkSubscription = useCallback(async (emailToCheck) => {

    
    // Verificar se o email é válido antes de fazer a requisição
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {

      setSubscriptionStatus(null);
      return;
    }

    // Evitar verificações desnecessárias se já temos um status para este email
    if (subscriptionStatus && subscriptionStatus.email === emailToCheck) {

      return;
    }

    setCheckingSubscription(true);

    
    try {
      const status = await subscriptionService.checkSubscriptionStatus(emailToCheck);

      setSubscriptionStatus({ ...status, email: emailToCheck });
    } catch (error) {
      console.error('❌ Error checking subscription:', error);
      setSubscriptionStatus({ hasActiveSubscription: false, email: emailToCheck, error: true });
    } finally {
      setCheckingSubscription(false);
    }
  }, [subscriptionStatus]);

  // Verificar assinatura apenas quando email estiver completo e válido
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {

      checkSubscription(email);
    } else {

      setSubscriptionStatus(null);
    }
  }, [email, checkSubscription]);

  // Cooldown timer
  useEffect(() => {
    let interval;
    if (resetCooldown > 0) {
      interval = setInterval(() => {
        setResetCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resetCooldown]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "E-mail obrigatório",
        description: "Por favor, insira seu e-mail para redefinir a senha.",
      });
      return;
    }

    // Verificar rate limiting
    const now = Date.now();
    if (lastResetAttempt && (now - lastResetAttempt) < 60000) { // 1 minuto
      const remainingTime = Math.ceil((60000 - (now - lastResetAttempt)) / 1000);
      toast({
        variant: "destructive",
        title: "Aguarde um momento",
        description: `Você pode tentar novamente em ${remainingTime} segundos.`,
      });
      return;
    }

    setLoading(true);
    setLastResetAttempt(now);
    
    try {
      const { error } = await resetPassword(email);
      if (!error) {
        setResetEmailSent(true);
        // Iniciar cooldown de 5 minutos
        setResetCooldown(300);
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de reset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setResetEmailSent(false);
    setEmail('');
    onBack();
  };

  const renderSubscriptionStatus = () => {
    if (!subscriptionStatus || subscriptionStatus.email !== email) return null;

    if (subscriptionStatus.hasActiveSubscription) {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Assinatura ativa</p>
            <p className="text-xs text-green-600">Você pode prosseguir com o reset de senha</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">Assinatura não encontrada</p>
            <p className="text-xs text-red-600">
              {subscriptionStatus.message || 'Verifique se você completou a compra na Hotmart'}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="bg-white/5 border-white/20 text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-0 h-auto text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <CardTitle className="mt-2">
          {resetEmailSent ? 'E-mail enviado!' : 'Esqueci minha senha'}
        </CardTitle>
        <CardDescription className="text-white/70">
          {resetEmailSent 
            ? 'Verifique sua caixa de entrada e siga as instruções.'
            : 'Digite seu e-mail para receber um link de redefinição de senha.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetEmailSent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/80">
                Enviamos um e-mail para <strong>{email}</strong> com instruções para redefinir sua senha.
              </p>
              <p className="text-xs text-white/60 mt-2">
                Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
              </p>
            </div>
            <Button
              onClick={handleBack}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              Voltar ao login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">E-mail</Label>
              <Input 
                id="forgot-email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => {
              
                  setEmail(e.target.value);
                }} 
                required 
                className="bg-white/10 border-white/20 placeholder:text-white/50" 
              />
            </div>
            {renderSubscriptionStatus()}
            {resetCooldown > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Aguarde para tentar novamente</p>
                  <p className="text-xs text-yellow-600">
                    Para evitar spam, você pode solicitar um novo e-mail em {Math.floor(resetCooldown / 60)}:{(resetCooldown % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" 
              disabled={loading || resetCooldown > 0 || !email || email.length < 5 || checkingSubscription || !subscriptionStatus || (subscriptionStatus && !subscriptionStatus.hasActiveSubscription)}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : resetCooldown > 0 ? (
                `Aguarde ${Math.floor(resetCooldown / 60)}:${(resetCooldown % 60).toString().padStart(2, '0')}`
              ) : checkingSubscription ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando assinatura...</>
              ) : !subscriptionStatus && email.length >= 5 ? (
                'Aguardando verificação...'
              ) : !email || email.length < 5 ? (
                'Digite um e-mail válido'
              ) : subscriptionStatus && !subscriptionStatus.hasActiveSubscription ? (
                'Assinatura necessária'
              ) : (
                'Enviar e-mail de redefinição'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordCard;