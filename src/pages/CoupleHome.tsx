import { useCoupleContext } from '@/contexts/CoupleContext';
import { getTodayQuestion, answerDailyQuestion } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, BookOpen, Image, Camera, Gamepad2, Music, Calendar, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const CoupleHome = () => {
  const { currentUser, couple } = useCoupleContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [todayQuestion, setTodayQuestion] = useState<any>(null);
  const [myAnswer, setMyAnswer] = useState('');

  useEffect(() => {
    const load = async () => {
      if (couple?.id) {
        const question = await getTodayQuestion(couple.id);
        setTodayQuestion(question);
        const isPartnerA = currentUser?.id === couple.memberA.id;
        if (isPartnerA && question.answerByA) {
          setMyAnswer(question.answerByA.text);
        } else if (!isPartnerA && question.answerByB) {
          setMyAnswer(question.answerByB.text);
        }
      }
    };
    load();
  }, [couple, currentUser]);

  const handleAnswerSubmit = async () => {
    if (!todayQuestion || !currentUser || !couple) return;
    const isPartnerA = currentUser.id === couple.memberA.id;
    await answerDailyQuestion(todayQuestion.id, currentUser.id, myAnswer, isPartnerA);
    toast({ title: 'Answer saved!', description: 'Your daily question response has been recorded' });
    const updated = await getTodayQuestion(couple.id);
    setTodayQuestion(updated);
  };

  const hasPartnerAnswered = () => {
    if (!todayQuestion || !currentUser || !couple) return false;
    const isPartnerA = currentUser.id === couple.memberA.id;
    return isPartnerA ? !!todayQuestion.answerByB : !!todayQuestion.answerByA;
  };

  const quickActions = [
    { icon: BookOpen, label: 'New Entry', action: () => navigate('/diary-editor'), color: 'text-blue-500' },
    { icon: Camera, label: 'Polaroid', action: () => navigate('/polaroid'), color: 'text-pink-500' },
    { icon: Gamepad2, label: 'Play Game', action: () => navigate('/games'), color: 'text-purple-500' },
    { icon: Music, label: 'Song Bucket', action: () => navigate('/song-bucket'), color: 'text-green-500' },
  ];

  const partnerName = couple
    ? (currentUser?.id === couple.memberA.id ? couple.memberB.name : couple.memberA.name)
    : '';
  const isWaitingForPartner = couple ? !couple.memberB.id : false;

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Heart className="h-10 w-10 text-white animate-heartbeat" />
            </div>
          </div>
          {couple ? (
            <>
              <h1 className="text-4xl font-bold text-foreground mb-2">{couple.name}</h1>
              <p className="text-muted-foreground">
                {isWaitingForPartner ? 'Waiting for your partner to join...' : `You and ${partnerName}`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-foreground mb-2">Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}</h1>
              <p className="text-muted-foreground">You're logged in. Explore features below.</p>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.label}
              className="cursor-pointer hover:shadow-romantic transition-smooth"
              onClick={action.action}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <action.icon className={`h-8 w-8 ${action.color} mb-2`} />
                <p className="text-sm font-medium">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Question (only when couple exists) */}
        {couple && todayQuestion && (
          <Card className="mb-8 shadow-gentle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Today's Question
              </CardTitle>
              <CardDescription>{todayQuestion.questionText}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Your answer..."
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAnswerSubmit} 
                  className="mt-2"
                  disabled={!myAnswer.trim()}
                >
                  Save Answer
                </Button>
              </div>
              
              {hasPartnerAnswered() && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">{partnerName}'s answer:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser && couple && currentUser.id === couple.memberA.id 
                      ? todayQuestion.answerByB?.text 
                      : todayQuestion.answerByA?.text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-romantic transition-smooth cursor-pointer" onClick={() => navigate('/diary')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Shared Journal
              </CardTitle>
              <CardDescription>Write and share your thoughts together</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-romantic transition-smooth cursor-pointer" onClick={() => navigate('/memories')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Memory Gallery
              </CardTitle>
              <CardDescription>Your shared photos and moments</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-romantic transition-smooth cursor-pointer" onClick={() => navigate('/activities')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activities & Reminders
              </CardTitle>
              <CardDescription>Track milestones and stay connected</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-romantic transition-smooth cursor-pointer" onClick={() => navigate('/insecurity-vault')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Insecurity Vault
              </CardTitle>
              <CardDescription>A safe space for vulnerable moments</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoupleHome;
