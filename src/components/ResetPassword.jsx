import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    console.log('ResetPassword - URL completa:', window.location.href);
    console.log('ResetPassword - Search params:', window.location.search);
    console.log('ResetPassword - Hash:', window.location.hash);
    
    // Verificar se há um token de acesso na URL (tanto em query params quanto em hash fragments)
    let accessToken, refreshToken, recoveryToken;
    
    // Primeiro, tentar obter dos query parameters
    const urlParams = new URLSearchParams(window.location.search);
    accessToken = urlParams.get('access_token');
    refreshToken = urlParams.get('refresh_token');
    recoveryToken = urlParams.get('token');
    const type = urlParams.get('type');
    
    // Se não encontrou nos query params, tentar nos hash fragments
    if (!accessToken || !refreshToken) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      if (!recoveryToken) {
        recoveryToken = hashParams.get('token');
      }
    }
    
    console.log('Tokens encontrados:', { accessToken: !!accessToken, refreshToken: !!refreshToken, recoveryToken: !!recoveryToken, type });
    
    // Se temos tokens de acesso diretos, usar eles
    if (accessToken && refreshToken) {
      const setSession = async () => {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Erro ao definir sessão:', error);
          toast({
            variant: "destructive",
            title: "Erro ao validar link",
            description: "Este link de redefinição de senha é inválido ou expirou.",
          });
          window.location.href = '/';
        } else {
          setIsValidLink(true);
        }
      };
      setSession();
    }
    // Se temos um token de recovery, verificar com o Supabase
    else if (recoveryToken && type === 'recovery') {
      const verifyRecovery = async () => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: recoveryToken,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Erro ao verificar recovery token:', error);
            toast({
              variant: "destructive",
              title: "Link inválido",
              description: "Este link de redefinição de senha é inválido ou expirou.",
            });
            window.location.href = '/';
          } else {
            console.log('Recovery token válido:', data);
            setIsValidLink(true);
          }
        } catch (error) {
          console.error('Erro na verificação:', error);
          toast({
            variant: "destructive",
            title: "Erro ao validar link",
            description: "Ocorreu um erro ao validar o link de redefinição.",
          });
          window.location.href = '/';
        }
      };
      verifyRecovery();
    }
    else {
      console.log('Nenhum token válido encontrado');
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "Este link de redefinição de senha é inválido ou expirou.",
      });
      // Redirecionar para a página principal
      window.location.href = '/';
      return;
    }
  }, [toast]);

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
              <CardTitle>Validando link...</CardTitle>
              <CardDescription className="text-white/70">
                Aguarde enquanto validamos seu link de redefinição de senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
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