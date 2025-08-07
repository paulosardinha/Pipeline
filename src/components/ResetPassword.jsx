import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';

const ResetPassword = ({ tokens }) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    console.log('=== RESET PASSWORD COMPONENT ===');
    console.log('ResetPassword - Tokens recebidos:', tokens);
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search:', window.location.search);
    console.log('Hash:', window.location.hash);
    
    // Logs mais visíveis para debug
    console.warn('🔄 RESET PASSWORD: Componente iniciado');
    console.warn('🎫 Tokens:', tokens);
    console.warn('🌐 URL completa:', window.location.href);
    
    setIsValidating(true);
    
    if (!tokens) {
      console.log('Nenhum token recebido, verificando sessão atual do Supabase');
      
      // Tentar obter a sessão atual do Supabase (pode ter sido processada automaticamente)
      const checkCurrentSession = async () => {
        try {
          console.log('Verificando sessão atual...');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Resultado da verificação de sessão:', { session, error });
          
          if (session && session.user) {
            console.log('Sessão ativa encontrada:', session);
            console.log('User:', session.user);
            console.log('Access token:', session.access_token);
            setIsValidLink(true);
            setIsValidating(false);
            return;
          }
          
          console.log('Nenhuma sessão ativa encontrada');
          
          // Verificar se há tokens na URL que podem ter sido processados automaticamente
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          // Se não há tokens na URL e nenhuma sessão ativa, verificar se é um link válido
          if (!urlParams.has('token') && !hashParams.has('token') && 
              !urlParams.has('access_token') && !hashParams.has('access_token')) {
            
            console.warn('⏳ Aguardando validação do link...');
            
            // Aguardar um pouco mais para dar tempo do Supabase processar automaticamente
            setTimeout(async () => {
              // Verificar novamente a sessão após o delay
              const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
              
              if (retrySession && retrySession.user) {
                console.log('Sessão encontrada após retry:', retrySession);
                setIsValidLink(true);
                setIsValidating(false);
              } else {
                console.warn('❌ Link considerado inválido após verificação completa');
                toast({
                  variant: "destructive",
                  title: "Link inválido",
                  description: "Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.",
                });
                setIsValidating(false);
                // Não redirecionar automaticamente, deixar o usuário clicar no botão
              }
            }, 3000); // Reduzido de 5 para 3 segundos
          } else {
            // Se há tokens na URL, aguardar um pouco mais para processamento
            console.log('Tokens detectados na URL, aguardando processamento...');
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession && retrySession.user) {
                console.log('Sessão processada com sucesso:', retrySession);
                setIsValidLink(true);
                setIsValidating(false);
              } else {
                console.warn('❌ Falha ao processar tokens da URL');
                toast({
                  variant: "destructive",
                  title: "Link inválido",
                  description: "Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.",
                });
                setIsValidating(false);
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Erro ao verificar sessão:', error);
          setIsValidating(false);
          toast({
            variant: "destructive",
            title: "Erro ao validar link",
            description: "Ocorreu um erro ao validar o link de redefinição. Por favor, tente novamente.",
          });
        }
      };
      
      checkCurrentSession();
      return;
    }
    
    // Se temos tokens de acesso diretos, usar eles
    if (tokens.access_token && tokens.refresh_token) {
      console.log('Processando tokens de acesso diretos');
      const setSession = async () => {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

          if (error) {
            console.error('Erro ao definir sessão:', error);
            toast({
              variant: "destructive",
              title: "Erro ao validar link",
              description: "Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.",
            });
            setIsValidating(false);
          } else {
            console.log('Sessão definida com sucesso');
            setIsValidLink(true);
            setIsValidating(false);
          }
        } catch (error) {
          console.error('Erro ao processar sessão:', error);
          setIsValidating(false);
          toast({
            variant: "destructive",
            title: "Erro ao validar link",
            description: "Ocorreu um erro ao processar o link de redefinição. Por favor, tente novamente.",
          });
        }
      };
      setSession();
    }
    // Se temos um token de recovery, verificar com o Supabase
    else if (tokens.token && tokens.type === 'recovery') {
      console.log('Processando token de recovery');
      const verifyRecovery = async () => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokens.token,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Erro ao verificar recovery token:', error);
            toast({
              variant: "destructive",
              title: "Link inválido",
              description: "Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.",
            });
            setIsValidating(false);
          } else {
            console.log('Recovery token válido:', data);
            setIsValidLink(true);
            setIsValidating(false);
          }
        } catch (error) {
          console.error('Erro na verificação:', error);
          setIsValidating(false);
          toast({
            variant: "destructive",
            title: "Erro ao validar link",
            description: "Ocorreu um erro ao validar o link de redefinição. Por favor, tente novamente.",
          });
        }
      };
      verifyRecovery();
    }
    else {
      console.log('Tokens inválidos recebidos:', tokens);
      setIsValidating(false);
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.",
      });
    }
  }, [tokens, toast]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Senha atualizada com sucesso!",
        description: "Sua senha foi redefinida. Você será redirecionado para o login.",
      });

      // Redirecionar para o login após 3 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir sua senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  // Tela de validação do link
  if (isValidating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-6">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Validando Link
                </h2>
                <p className="text-gray-600 mb-4">
                  Aguarde enquanto validamos seu link de redefinição de senha...
                </p>
                <div className="text-sm text-gray-500">
                  Este processo pode levar alguns segundos.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 inline-block">
              <img alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/d08cb82d-6f38-407f-afdd-2a89111d2bfa/e18ece8ef0a2cbe854d609b168a6f95c.png" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Pipeline Alfa</h1>
            <p className="text-brand-accent mt-2">A ferramenta definitiva para corretores de sucesso.</p>
          </div>
          
          <Card className="bg-white/5 border-white/20 text-white">
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <CardTitle>Link Inválido</CardTitle>
                <CardDescription className="text-white/70">
                  Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-white/70 text-center">
                  Para solicitar um novo link de redefinição:
                </p>
                <ol className="text-sm text-white/60 text-left space-y-2">
                  <li>1. Volte à página de login</li>
                  <li>2. Clique em "Esqueci minha senha"</li>
                  <li>3. Digite seu e-mail</li>
                  <li>4. Verifique sua caixa de entrada</li>
                </ol>
                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                  Voltar ao Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <img alt="Modern city skyline at dusk" className="absolute inset-0 w-full h-full object-cover -z-10" src="https://images.unsplash.com/photo-1679379886920-25f131284c2e" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 inline-block">
              <img alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/d08cb82d-6f38-407f-afdd-2a89111d2bfa/e18ece8ef0a2cbe854d609b168a6f95c.png" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Pipeline Alfa</h1>
            <p className="text-brand-accent mt-2">A ferramenta definitiva para corretores de sucesso.</p>
          </div>
          
          <Card className="bg-white/5 border-white/20 text-white">
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle>Senha redefinida com sucesso!</CardTitle>
                <CardDescription className="text-white/70">
                  Sua senha foi atualizada. Você será redirecionado para o login em alguns segundos.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleBackToLogin}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
              >
                Ir para o login
              </Button>
            </CardContent>
          </Card>
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
            <img alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/d08cb82d-6f38-407f-afdd-2a89111d2bfa/e18ece8ef0a2cbe854d609b168a6f95c.png" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Pipeline Alfa</h1>
          <p className="text-brand-accent mt-2">A ferramenta definitiva para corretores de sucesso.</p>
        </div>
        
        <Card className="bg-white/5 border-white/20 text-white">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription className="text-white/70">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input 
                    id="new-password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="bg-white/10 border-white/20 placeholder:text-white/50 pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/50" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="bg-white/10 border-white/20 placeholder:text-white/50 pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/50" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Redefinir senha'}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-white/70 hover:text-white text-sm"
                >
                  Voltar ao login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <img alt="Modern city skyline at dusk" className="absolute inset-0 w-full h-full object-cover -z-10" src="https://images.unsplash.com/photo-1679379886920-25f131284c2e" />
    </div>
  );
};

export default ResetPassword;