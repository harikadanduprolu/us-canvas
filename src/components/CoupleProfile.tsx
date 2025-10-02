import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Edit, 
  Star, 
  Trophy,
  Users,
  Gift,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface CoupleData {
  partner1: {
    name: string;
    age: number;
    location: string;
    loveLanguage: string;
  };
  partner2: {
    name: string;
    age: number;
    location: string;
    loveLanguage: string;
  };
  relationship: {
    startDate: string;
    status: string;
    level: number;
    anniversary: string;
  };
  stats: {
    daysTogeth0r: number;
    memoriesShared: number;
    gamesPlayed: number;
    challengesCompleted: number;
  };
}

const initialCoupleData: CoupleData = {
  partner1: {
    name: "Alex",
    age: 26,
    location: "New York, NY",
    loveLanguage: "Quality Time",
  },
  partner2: {
    name: "Jordan", 
    age: 24,
    location: "New York, NY",
    loveLanguage: "Words of Affirmation",
  },
  relationship: {
    startDate: "2024-01-01",
    status: "In a loving relationship",
    level: 7,
    anniversary: "January 1st",
  },
  stats: {
    daysTogeth0r: 247,
    memoriesShared: 89,
    gamesPlayed: 23,
    challengesCompleted: 8,
  },
};

const achievements = [
  { id: "1", title: "First Week", description: "Completed first week together", icon: "🎉", unlocked: true },
  { id: "2", title: "Memory Keeper", description: "Shared 50 memories", icon: "📸", unlocked: true },
  { id: "3", title: "Game Master", description: "Played 20 games together", icon: "🎮", unlocked: true },
  { id: "4", title: "Communication Pro", description: "7-day chat streak", icon: "💬", unlocked: true },
  { id: "5", title: "Love Champion", description: "Reached relationship level 5", icon: "❤️", unlocked: true },
  { id: "6", title: "Challenge Victor", description: "Completed 10 challenges", icon: "🏆", unlocked: false },
];

export const CoupleProfile = () => {
  const [coupleData, setCoupleData] = useState(initialCoupleData);
  const [editMode, setEditMode] = useState(false);

  const daysUntilAnniversary = () => {
    const anniversary = new Date(`2025-01-01`);
    const today = new Date();
    const diffTime = anniversary.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const relationshipProgress = (coupleData.relationship.level / 10) * 100;

  return (
    <div className="space-y-6">
      {/* Couple Header */}
      <Card className="bg-gradient-dreamy shadow-romantic overflow-hidden">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Couple Avatars */}
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 border-4 border-white shadow-gentle mb-2">
                  <AvatarFallback className="bg-gradient-romantic text-white text-2xl">
                    {coupleData.partner1.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">{coupleData.partner1.name}</p>
                <p className="text-sm text-muted-foreground">{coupleData.partner1.age} years old</p>
              </div>

              <div className="mx-8">
                <Heart className="h-12 w-12 text-primary animate-heartbeat" />
              </div>

              <div className="text-center">
                <Avatar className="h-20 w-20 border-4 border-white shadow-gentle mb-2">
                  <AvatarFallback className="bg-gradient-romantic text-white text-2xl">
                    {coupleData.partner2.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">{coupleData.partner2.name}</p>
                <p className="text-sm text-muted-foreground">{coupleData.partner2.age} years old</p>
              </div>
            </div>

            {/* Relationship Status */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {coupleData.partner1.name} & {coupleData.partner2.name}
              </h2>
              <p className="text-muted-foreground">{coupleData.relationship.status}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Together since {coupleData.relationship.anniversary}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{coupleData.partner1.location}</span>
                </div>
              </div>
            </div>

            {/* Relationship Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-semibold">Relationship Level {coupleData.relationship.level}</span>
              </div>
              <Progress value={relationshipProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {10 - coupleData.relationship.level} levels to Love Master!
              </p>
            </div>

            <Button 
              onClick={() => setEditMode(!editMode)}
              variant="dreamy" 
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {editMode ? "Save Profile" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
          <CardContent className="pt-4">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{coupleData.stats.daysTogeth0r}</div>
            <p className="text-sm text-muted-foreground">Days Together</p>
          </CardContent>
        </Card>

        <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
          <CardContent className="pt-4">
            <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{coupleData.stats.memoriesShared}</div>
            <p className="text-sm text-muted-foreground">Memories Shared</p>
          </CardContent>
        </Card>

        <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
          <CardContent className="pt-4">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{coupleData.stats.gamesPlayed}</div>
            <p className="text-sm text-muted-foreground">Games Played</p>
          </CardContent>
        </Card>

        <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
          <CardContent className="pt-4">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{coupleData.stats.challengesCompleted}</div>
            <p className="text-sm text-muted-foreground">Challenges Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Love Languages */}
      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Love Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-sunset p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{coupleData.partner1.name}'s Love Language</h4>
              <Badge variant="secondary" className="text-primary">
                {coupleData.partner1.loveLanguage}
              </Badge>
            </div>
            <div className="bg-gradient-sunset p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">{coupleData.partner2.name}'s Love Language</h4>
              <Badge variant="secondary" className="text-primary">
                {coupleData.partner2.loveLanguage}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border text-center transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-love text-white border-primary shadow-gentle"
                    : "bg-muted/50 text-muted-foreground border-muted"
                }`}
              >
                <div className="text-2xl mb-2 filter grayscale-0">
                  {achievement.unlocked ? achievement.icon : "🔒"}
                </div>
                <h4 className={`font-medium mb-1 ${achievement.unlocked ? "" : "opacity-60"}`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm ${achievement.unlocked ? "opacity-90" : "opacity-40"}`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anniversary Countdown */}
      <Card className="bg-gradient-love text-white text-center shadow-romantic">
        <CardContent className="pt-6">
          <Gift className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Next Anniversary</h3>
          <div className="text-4xl font-bold mb-2">{daysUntilAnniversary()}</div>
          <p className="opacity-90">days to celebrate your special day!</p>
        </CardContent>
      </Card>
    </div>
  );
};