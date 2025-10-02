import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useCoupleContext();
  const { toast } = useToast();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      toast({ title: 'Welcome back!', description: 'Logged in successfully' });
      navigate('/couple-home');
    } catch (error) {
      toast({ 
        title: 'Login failed', 
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive' 
      });
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Heart className="h-10 w-10 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lovable</h1>
          <p className="text-muted-foreground">A warm digital space where couples share, play, and grow together</p>
        </div>

        <Card className="shadow-romantic">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
