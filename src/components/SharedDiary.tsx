import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, BookOpen, Calendar, Smile, Frown, Meh, Star } from "lucide-react";
import { toast } from "sonner";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { getDiaryEntries, saveDiaryEntry, DiaryEntry as StorageDiaryEntry } from "@/lib/storage";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: "happy" | "love" | "sad" | "neutral" | "excited";
  date: string;
  author: "You" | "Partner";
}

const moodIcons = {
  happy: <Smile className="h-4 w-4" />,
  love: <Heart className="h-4 w-4" />,
  sad: <Frown className="h-4 w-4" />,
  neutral: <Meh className="h-4 w-4" />,
  excited: <Star className="h-4 w-4" />,
};

const moodColors = {
  happy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  love: "bg-pink-100 text-pink-800 border-pink-200",
  sad: "bg-blue-100 text-blue-800 border-blue-200",
  neutral: "bg-gray-100 text-gray-800 border-gray-200",
  excited: "bg-purple-100 text-purple-800 border-purple-200",
};

export const SharedDiary = () => {
  const { couple, currentUser } = useCoupleContext();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "happy" as const,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load diary entries from database
  useEffect(() => {
    const loadEntries = async () => {
      if (!couple?.id) return;
      
      try {
        setIsLoading(true);
        const dbEntries = await getDiaryEntries(couple.id);
        
        // Convert database entries to component format
        const formattedEntries: DiaryEntry[] = dbEntries.map((entry: StorageDiaryEntry) => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          mood: (entry.mood as "happy" | "love" | "sad" | "neutral" | "excited") || "happy",
          date: entry.createdAt.split('T')[0],
          author: entry.authorId === currentUser?.id ? "You" : "Partner"
        }));
        
        setEntries(formattedEntries);
      } catch (error) {
        console.error('Error loading diary entries:', error);
        toast("Failed to load diary entries");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, [couple?.id, currentUser?.id]);

  const addEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast("Please fill in both title and content!");
      return;
    }

    if (!couple?.id || !currentUser?.id) {
      toast("Please log in to add entries");
      return;
    }

    try {
      setIsLoading(true);
      
      const dbEntry: StorageDiaryEntry = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        attachments: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(dbEntry);

      const newDiaryEntry: DiaryEntry = {
        id: dbEntry.id,
        title: dbEntry.title,
        content: dbEntry.content,
        mood: newEntry.mood,
        date: new Date().toISOString().split("T")[0],
        author: "You",
      };

      setEntries([newDiaryEntry, ...entries]);
      setNewEntry({ title: "", content: "", mood: "happy" });
      toast("Entry added to your shared diary! 💕");
    } catch (error) {
      console.error('Error saving diary entry:', error);
      toast("Failed to save diary entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Entry Form */}
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Write a New Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Entry title (e.g., 'Our Perfect Sunday')"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          />
          
          <Textarea
            placeholder="Share your thoughts, feelings, or memories..."
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            rows={4}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">How are you feeling?</label>
            <div className="flex gap-2">
              {Object.entries(moodIcons).map(([mood, icon]) => (
                <button
                  key={mood}
                  onClick={() => setNewEntry({ ...newEntry, mood: mood as any })}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border transition-all ${
                    newEntry.mood === mood
                      ? moodColors[mood as keyof typeof moodColors]
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {icon}
                  <span className="text-xs capitalize">{mood}</span>
                </button>
              ))}
            </div>
          </div>
          
          <Button onClick={addEntry} className="w-full" variant="romantic" disabled={isLoading}>
            <Heart className="h-4 w-4 mr-2" />
            {isLoading ? "Adding..." : "Add to Our Diary"}
          </Button>
        </CardContent>
      </Card>

      {/* Diary Entries */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Your Shared Stories
        </h3>
        
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-gentle transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{entry.author}</span>
                    <span>•</span>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={`${moodColors[entry.mood]} flex items-center gap-1`}>
                  {moodIcons[entry.mood]}
                  {entry.mood}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{entry.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">
          ✨ Keep writing your love story together ✨
        </p>
      </div>
    </div>
  );
};