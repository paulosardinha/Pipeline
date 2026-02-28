import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { subscriptionService } from '@/lib/subscriptionService';
import ForgotPasswordCard from './ForgotPasswordCard';

const Auth = () => {


  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);



  // Verificar assinatura quando email mudar
  const checkSubscription = useCallback(async (emailToCheck) => {


    if (!emailToCheck || emailToCheck.length < 5) {

      setSubscriptionStatus(null);
      return;
    }

    // Evitar verificações desnecessárias se já temos um status para este email
    if (subscriptionStatus && subscriptionStatus.email === emailToCheck) {

      return;
    }

    // Verificar se o email é válido antes de fazer a requisição
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {

      return;
    }


    setCheckingSubscription(true);
    try {
      const status = await subscriptionService.checkSubscriptionStatus(emailToCheck);

      setSubscriptionStatus({ ...status, email: emailToCheck }); // Adicionar email ao status
    } catch (error) {
      console.error('❌ Erro ao verificar assinatura:', error);
      setSubscriptionStatus({
        hasActiveSubscription: false,
        message: 'Erro ao verificar assinatura',
        email: emailToCheck
      });
    } finally {
      setCheckingSubscription(false);
    }
  }, [subscriptionStatus]);

  useEffect(() => {

    // Debounce para não fazer muitas requisições - aumentado para 1.5 segundos
    const timeoutId = setTimeout(() => {

      checkSubscription(email);
    }, 1500);
    return () => {

      clearTimeout(timeoutId);
    };
  }, [email, checkSubscription]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (error) {
      // O erro já é tratado no contexto
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
    } catch (error) {
      // O erro já é tratado no contexto
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };



  const renderSubscriptionStatus = useCallback(() => {
    if (!email || email.length < 5) return null;

    if (checkingSubscription) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-800">Verificando assinatura...</p>
            <p className="text-xs text-blue-600">Aguarde um momento</p>
          </div>
        </div>
      );
    }

    if (!subscriptionStatus || subscriptionStatus.email !== email) return null;

    if (subscriptionStatus.hasActiveSubscription) {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Assinatura ativa</p>
            <p className="text-xs text-green-600">Você pode prosseguir com o cadastro/login</p>
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
  }, [email, checkingSubscription, subscriptionStatus]);



  if (showForgotPassword) {

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 inline-block">
              <img alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="/logo.svg" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Pipeline Alfa</h1>
            <p className="text-brand-accent mt-2">A ferramenta definitiva para corretores de sucesso.</p>
          </div>
          <ForgotPasswordCard
            initialEmail={email}
            onBack={() => setShowForgotPassword(false)}
          />
        </div>
        <img alt="Modern city skyline at dusk" className="absolute inset-0 w-full h-full object-cover -z-10" src="https://images.unsplash.com/photo-1679379886920-25f131284c2e" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 inline-block">
            <img alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="/logo.svg" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Pipeline Alfa</h1>
          <p className="text-brand-accent mt-2">A ferramenta definitiva para corretores de sucesso.</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 text-white">
            <TabsTrigger value="signin" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Cadastrar</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="bg-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Bem-vindo de volta!</CardTitle>
                <CardDescription className="text-white/70">Acesse seu pipeline de vendas.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-mail</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        const newEmail = e.target.value;
                        setEmail(newEmail);
                      }}
                      required
                      className="bg-white/10 border-white/20 placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 placeholder:text-white/50"
                    />
                  </div>
                  {renderSubscriptionStatus()}
                  <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading || checkingSubscription}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                  </Button>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-white/70 hover:text-white text-sm"
                    >
                      Esqueci minha senha
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Crie sua conta</CardTitle>
                <CardDescription className="text-white/70">Comece a organizar seus leads agora mesmo.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        const newEmail = e.target.value;
                        setEmail(newEmail);
                      }}
                      required
                      className="bg-white/10 border-white/20 placeholder:text-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Crie uma senha forte"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 placeholder:text-white/50"
                    />
                  </div>
                  {renderSubscriptionStatus()}
                  <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading || checkingSubscription}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cadastrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <img alt="Modern city skyline at dusk" className="absolute inset-0 w-full h-full object-cover -z-10" src="https://images.unsplash.com/photo-1679379886920-25f131284c2e" />
    </div>
  );
};

export default Auth;