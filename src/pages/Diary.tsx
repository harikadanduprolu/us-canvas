import { SharedDiary } from "@/components/SharedDiary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, Calendar, Users } from "lucide-react";

const Diary = () => {
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <BookOpen className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Love Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Write your journey together in this beautiful shared diary. 
            Capture moments, feelings, and memories that matter most.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">42</div>
              <p className="text-sm text-muted-foreground">Days together</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-6">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">18</div>
              <p className="text-sm text-muted-foreground">Diary entries</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">2</div>
              <p className="text-sm text-muted-foreground">Hearts connected</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Diary Component */}
        <SharedDiary />
      </div>
    </div>
  );
};

export default Diary;