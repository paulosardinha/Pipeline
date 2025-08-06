import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta!',
      });
    } catch (error) {
      toast({
        title: 'Erro no Login',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu e-mail para confirmar sua conta.',
      });
    } catch (error) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-auth-background bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 inline-block">
            <img  alt="Pipeline Alfa Logo" className="h-24 w-24 rounded-2xl ring-8 ring-white/10" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/d08cb82d-6f38-407f-afdd-2a89111d2bfa/e18ece8ef0a2cbe854d609b168a6f95c.png" />
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
                    <Label htmlFor="signin-email" >E-mail</Label>
                    <Input id="signin-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/10 border-white/20 placeholder:text-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input id="signin-password" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/10 border-white/20 placeholder:text-white/50" />
                  </div>
                  <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                  </Button>
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
                    <Input id="signup-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/10 border-white/20 placeholder:text-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" type="password" placeholder="Crie uma senha forte" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/10 border-white/20 placeholder:text-white/50" />
                  </div>
                  <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cadastrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <img  alt="Modern city skyline at dusk" className="absolute inset-0 w-full h-full object-cover -z-10" src="https://images.unsplash.com/photo-1679379886920-25f131284c2e" />
    </div>
  );
};

export default Auth;