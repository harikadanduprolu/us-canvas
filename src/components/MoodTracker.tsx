import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Smile, Meh, Frown, Star, TrendingUp } from "lucide-react";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { saveDiaryEntry, DiaryEntry } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

const moods = [
  { emoji: "😍", label: "In Love", value: 5, color: "text-pink-500", moodType: "love" as const },
  { emoji: "😊", label: "Happy", value: 4, color: "text-green-500", moodType: "happy" as const },
  { emoji: "😌", label: "Content", value: 3, color: "text-blue-500", moodType: "neutral" as const },
  { emoji: "😐", label: "Neutral", value: 2, color: "text-gray-500", moodType: "neutral" as const },
  { emoji: "😔", label: "Low", value: 1, color: "text-orange-500", moodType: "sad" as const },
];

export const MoodTracker = () => {
  const { couple, currentUser } = useCoupleContext();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveMood = async () => {
    if (!selectedMood || !couple?.id || !currentUser?.id) {
      toast({
        title: "Error",
        description: "Please select a mood and make sure you're logged in",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const selectedMoodData = moods.find(mood => mood.value === selectedMood);
      if (!selectedMoodData) return;

      const moodEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: `Daily Mood: ${selectedMoodData.label}`,
        content: `I'm feeling ${selectedMoodData.label.toLowerCase()} today ${selectedMoodData.emoji}`,
        mood: selectedMoodData.moodType,
        attachments: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(moodEntry);
      
      toast({
        title: "Mood saved! 💕",
        description: "Your mood has been recorded in your shared diary",
      });
      
      setSelectedMood(null);
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Daily Mood Check-in
          </CardTitle>
          <p className="text-muted-foreground">
            Track your emotional journey together
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {moods.map((mood) => (
              <Button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                variant={selectedMood === mood.value ? "default" : "outline"}
                className="h-20 flex-col gap-2"
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </Button>
            ))}
          </div>
          
          {selectedMood && (
            <div className="text-center">
              <Button 
                variant="romantic" 
                onClick={saveMood} 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Mood"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};