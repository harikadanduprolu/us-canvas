import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { createCouple, joinCouple, couple } = useCoupleContext();
  const { toast } = useToast();
  
  const [coupleName, setCoupleName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const code = await createCouple(coupleName, anniversary);
      setGeneratedCode(code);
      toast({ 
        title: 'Couple created!', 
        description: 'Share your invite code with your partner' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Could not create couple',
        variant: 'destructive' 
      });
    }
  };

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinCouple(inviteCode);
      toast({ title: 'Connected!', description: 'You joined your couple successfully' });
      navigate('/couple-home');
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Invalid invite code',
        variant: 'destructive' 
      });
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const continueToHome = () => {
    navigate('/couple-home');
  };

  // If couple exists and is complete, redirect
  if (couple && couple.memberB.id) {
    navigate('/couple-home');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Heart className="h-10 w-10 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Set Up Your Couple Space</h1>
          <p className="text-muted-foreground">Create a new couple or join your partner</p>
        </div>

        <Card className="shadow-romantic">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Connect with your partner to unlock all features</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedCode ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Your Invite Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-bold text-primary tracking-wider">{generatedCode}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyInviteCode}
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Share this code with your partner</p>
                </div>
                <Button onClick={continueToHome} className="w-full">
                  Continue to Home
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Your partner can join anytime using this code
                </p>
              </div>
            ) : (
              <Tabs defaultValue="create">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="join">Join</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create">
                  <form onSubmit={handleCreateCouple} className="space-y-4">
                    <div>
                      <Label htmlFor="couple-name">Couple Name</Label>
                      <Input
                        id="couple-name"
                        placeholder="e.g., Alex & Jordan"
                        value={coupleName}
                        onChange={(e) => setCoupleName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="anniversary">Anniversary Date (Optional)</Label>
                      <Input
                        id="anniversary"
                        type="date"
                        value={anniversary}
                        onChange={(e) => setAnniversary(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Couple</Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="join">
                  <form onSubmit={handleJoinCouple} className="space-y-4">
                    <div>
                      <Label htmlFor="invite-code">Invite Code</Label>
                      <Input
                        id="invite-code"
                        placeholder="Enter your partner's code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ask your partner for their invite code
                      </p>
                    </div>
                    <Button type="submit" className="w-full">Join Couple</Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
