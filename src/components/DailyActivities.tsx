import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  CheckCircle, 
  Clock, 
  Star, 
  MessageSquare,
  Camera,
  Coffee,
  Music,
  Book,
  Gift
} from "lucide-react";
import { toast } from "sonner";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { saveDiaryEntry, getDiaryEntries, DiaryEntry } from "@/lib/storage";

interface Activity {
  id: string;
  title: string;
  description: string;
  type: "gratitude" | "communication" | "surprise" | "quality-time" | "appreciation";
  duration: string;
  points: number;
  completed: boolean;
  icon: any;
}

const dailyActivities: Activity[] = [
  {
    id: "1",
    title: "Morning Love Note",
    description: "Send your partner a sweet good morning message telling them one thing you're grateful for about them.",
    type: "gratitude",
    duration: "2 min",
    points: 10,
    completed: false,
    icon: MessageSquare,
  },
  {
    id: "2", 
    title: "Photo Memory Share",
    description: "Share a favorite photo of you two together and tell them why it's special to you.",
    type: "appreciation", 
    duration: "5 min",
    points: 15,
    completed: true,
    icon: Camera,
  },
  {
    id: "3",
    title: "Coffee Date Planning",
    description: "Plan a virtual or in-person coffee date for this week. Discuss what you'd like to talk about.",
    type: "quality-time",
    duration: "10 min", 
    points: 20,
    completed: false,
    icon: Coffee,
  },
  {
    id: "4",
    title: "Share Your Day",
    description: "Tell your partner about the best and most challenging part of your day. Really listen to theirs too.",
    type: "communication",
    duration: "15 min",
    points: 25,
    completed: false,
    icon: Heart,
  },
  {
    id: "5",
    title: "Surprise Playlist",
    description: "Create a short playlist of 3-5 songs that remind you of your partner and share it with them.",
    type: "surprise",
    duration: "20 min",
    points: 30,
    completed: false,
    icon: Music,
  },
  {
    id: "6",
    title: "Future Dreams Chat",
    description: "Spend time talking about one thing you're both looking forward to in your relationship.",
    type: "communication", 
    duration: "25 min",
    points: 35,
    completed: false,
    icon: Star,
  },
];

const typeColors = {
  gratitude: "bg-yellow-100 text-yellow-800 border-yellow-200",
  communication: "bg-blue-100 text-blue-800 border-blue-200",
  surprise: "bg-purple-100 text-purple-800 border-purple-200",
  "quality-time": "bg-green-100 text-green-800 border-green-200",
  appreciation: "bg-pink-100 text-pink-800 border-pink-200",
};

export const DailyActivities = () => {
  const { couple, currentUser } = useCoupleContext();
  const [activities, setActivities] = useState(dailyActivities);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  
  // Load completed activities from database
  useEffect(() => {
    const loadCompletedActivities = async () => {
      if (!couple?.id) return;
      
      try {
        const entries = await getDiaryEntries(couple.id);
        const today = new Date().toISOString().split('T')[0];
        
        // Find activity completion entries for today
        const todayActivityEntries = entries.filter(entry => 
          entry.createdAt.startsWith(today) && 
          entry.title.startsWith('Activity Completed:')
        );
        
        const completed = new Set(todayActivityEntries.map(entry => 
          entry.title.replace('Activity Completed: ', '').split(' - ')[0]
        ));
        
        setCompletedActivities(completed);
        
        // Update activities state
        setActivities(prev => 
          prev.map(activity => ({
            ...activity,
            completed: completed.has(activity.id)
          }))
        );
      } catch (error) {
        console.error('Error loading completed activities:', error);
      }
    };

    loadCompletedActivities();
  }, [couple?.id]);
  
  const completedCount = activities.filter(a => a.completed).length;
  const totalPoints = activities.filter(a => a.completed).reduce((sum, a) => sum + a.points, 0);
  const progressPercent = (completedCount / activities.length) * 100;

  const completeActivity = async (activityId: string) => {
    if (!couple?.id || !currentUser?.id) {
      toast("Please log in to complete activities");
      return;
    }

    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      // Save completion to database
      const completionEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: `Activity Completed: ${activity.id} - ${activity.title}`,
        content: `Completed daily activity: "${activity.title}". ${activity.description} (+${activity.points} points)`,
        attachments: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(completionEntry);
      
      setActivities(prev => 
        prev.map(act => 
          act.id === activityId 
            ? { ...act, completed: true }
            : act
        )
      );
      
      setCompletedActivities(prev => new Set([...prev, activityId]));
      toast("Activity completed! Great job strengthening your bond! 💕");
    } catch (error) {
      console.error('Error completing activity:', error);
      toast("Failed to save activity completion");
    }
  };

  const uncompleteActivity = async (activityId: string) => {
    if (!couple?.id || !currentUser?.id) {
      toast("Please log in to modify activities");
      return;
    }

    try {
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, completed: false }
            : activity
        )
      );
      
      setCompletedActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      
      toast("Activity marked as incomplete");
    } catch (error) {
      console.error('Error uncompleting activity:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6" />
            Today's Love Activities
          </CardTitle>
          <p className="text-muted-foreground">
            Simple daily activities to strengthen your connection
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Love Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {progressPercent === 100 && (
            <div className="text-center text-primary font-medium">
              🎉 Perfect day! You're amazing together! 🎉
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          
          return (
            <Card 
              key={activity.id} 
              className={`shadow-gentle hover:shadow-romantic transition-smooth ${
                activity.completed ? 'bg-green-50 border-green-200' : 'hover:-translate-y-1'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Activity Icon */}
                  <div className={`p-3 rounded-full ${
                    activity.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className={`font-semibold ${
                          activity.completed ? 'text-green-800 line-through' : 'text-foreground'
                        }`}>
                          {activity.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${
                          activity.completed ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={typeColors[activity.type]}>
                          {activity.type.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.duration}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-primary">
                          <Star className="h-3 w-3" />
                          {activity.points} points
                        </div>
                      </div>

                      {/* Complete Button */}
                      {!activity.completed ? (
                        <Button 
                          onClick={() => completeActivity(activity.id)}
                          variant="romantic" 
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => uncompleteActivity(activity.id)}
                          variant="outline" 
                          size="sm"
                          className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily Motivation */}
      <Card className="bg-gradient-love text-white text-center shadow-gentle">
        <CardContent className="pt-6">
          <Heart className="h-8 w-8 mx-auto mb-3 animate-heartbeat" />
          <h3 className="text-xl font-semibold mb-2">Daily Love Reminder</h3>
          <p className="opacity-90">
            "The best relationships are built one small, loving action at a time. 
            Every activity you complete together strengthens the beautiful bond you share." 💕
          </p>
        </CardContent>
      </Card>
    </div>
  );
};