import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Trophy, 
  Calendar, 
  Users, 
  Heart, 
  Star, 
  Clock,
  CheckCircle,
  Flag,
  Gift
} from "lucide-react";
import { toast } from "sonner";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { saveDiaryEntry, DiaryEntry } from "@/lib/storage";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  reward: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  daysLeft: number;
}

const challenges: Challenge[] = [
  {
    id: "1",
    title: "7-Day Gratitude Challenge",
    description: "Share one thing you're grateful for about your partner every day for a week.",
    type: "weekly",
    difficulty: "easy",
    duration: "7 days",
    reward: "Love Letter Badge",
    progress: 3,
    maxProgress: 7,
    completed: false,
    daysLeft: 4,
  },
  {
    id: "2",
    title: "Photo Memory Marathon", 
    description: "Upload and share 30 favorite memories together in one month.",
    type: "monthly",
    difficulty: "medium",
    duration: "30 days", 
    reward: "Memory Keeper Trophy",
    progress: 18,
    maxProgress: 30,
    completed: false,
    daysLeft: 12,
  },
  {
    id: "3",
    title: "Daily Check-in Streak",
    description: "Have a meaningful conversation about your day every day for 14 days.",
    type: "daily",
    difficulty: "easy",
    duration: "14 days",
    reward: "Communication Master",
    progress: 14,
    maxProgress: 14,
    completed: true,
    daysLeft: 0,
  },
  {
    id: "4",
    title: "Surprise Week",
    description: "Plan and execute 5 small surprises for your partner in one week.",
    type: "weekly",
    difficulty: "medium", 
    duration: "7 days",
    reward: "Surprise Master Badge",
    progress: 0,
    maxProgress: 5,
    completed: false,
    daysLeft: 7,
  },
  {
    id: "5",
    title: "Game Night Champions",
    description: "Play games together for 10 sessions and track your wins/losses.",
    type: "monthly",
    difficulty: "easy",
    duration: "30 days",
    reward: "Gaming Couple Trophy", 
    progress: 6,
    maxProgress: 10,
    completed: false,
    daysLeft: 18,
  },
  {
    id: "6",
    title: "Love Language Explorer",
    description: "Try each of the 5 love languages with your partner over 5 weeks.",
    type: "monthly",
    difficulty: "hard",
    duration: "35 days",
    reward: "Love Expert Certificate",
    progress: 0,
    maxProgress: 5,
    completed: false,
    daysLeft: 35,
  },
];

const difficultyColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  hard: "bg-red-100 text-red-800 border-red-200",
};

const typeIcons = {
  daily: <Calendar className="h-4 w-4" />,
  weekly: <Target className="h-4 w-4" />,
  monthly: <Flag className="h-4 w-4" />,
};

export const ChallengeCenter = () => {
  const { couple, currentUser } = useCoupleContext();
  const [selectedChallenges, setSelectedChallenges] = useState(challenges);
  
  const activeChallenge = selectedChallenges.filter(c => !c.completed && c.progress > 0);
  const completedChallenges = selectedChallenges.filter(c => c.completed);
  const availableChallenges = selectedChallenges.filter(c => !c.completed && c.progress === 0);

  const joinChallenge = async (challengeId: string) => {
    if (!couple?.id || !currentUser?.id) {
      toast("Please log in to join challenges");
      return;
    }

    try {
      const challenge = selectedChallenges.find(c => c.id === challengeId);
      if (!challenge) return;

      // Save challenge join to database
      const challengeEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: `Challenge Joined: ${challenge.title}`,
        content: `Started the "${challenge.title}" challenge! ${challenge.description}`,
        attachments: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(challengeEntry);

      setSelectedChallenges(prev =>
        prev.map(c =>
          c.id === challengeId
            ? { ...c, progress: 1 }
            : c
        )
      );
      
      toast("Challenge joined! Let the fun begin! 🎯");
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast("Failed to join challenge. Please try again.");
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const progressPercent = (challenge.progress / challenge.maxProgress) * 100;
    
    return (
      <Card className="shadow-gentle hover:shadow-romantic transition-smooth">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {typeIcons[challenge.type]}
                {challenge.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>
            <Badge className={difficultyColors[challenge.difficulty]}>
              {challenge.difficulty}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          {challenge.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {challenge.progress}/{challenge.maxProgress}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Challenge Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.duration}</span>
            </div>
            {!challenge.completed && challenge.daysLeft > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{challenge.daysLeft} days left</span>
              </div>
            )}
          </div>

          {/* Reward */}
          <div className="bg-gradient-sunset p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-primary" />
              <span className="font-medium">Reward:</span>
              <span className="text-primary font-medium">{challenge.reward}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {challenge.completed ? (
              <Button variant="outline" className="w-full gap-2" disabled>
                <Trophy className="h-4 w-4 text-yellow-500" />
                Completed!
              </Button>
            ) : challenge.progress > 0 ? (
              <Button variant="dreamy" className="w-full gap-2">
                <Target className="h-4 w-4" />
                Continue Challenge
              </Button>
            ) : (
              <Button 
                onClick={() => joinChallenge(challenge.id)}
                variant="romantic" 
                className="w-full gap-2"
              >
                <Star className="h-4 w-4" />
                Join Challenge
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Challenge Stats */}
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Target className="h-6 w-6" />
            Challenge Center
          </CardTitle>
          <p className="text-muted-foreground">
            Take on fun challenges together and earn amazing rewards!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{activeChallenge.length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completedChallenges.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{availableChallenges.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6 bg-card shadow-gentle">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Available
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeChallenge.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeChallenge.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Join a challenge to start having fun together!
                </p>
                <Button variant="romantic">Browse Available Challenges</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {availableChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Completed Challenges Yet</h3>
                <p className="text-muted-foreground">
                  Complete your first challenge to see it here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};