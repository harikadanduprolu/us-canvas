import { DailyActivities } from "@/components/DailyActivities";
import { ChallengeCenter } from "@/components/ChallengeCenter";
import { DailyQA } from "@/components/DailyQA";
import { AnniversaryTracker } from "@/components/AnniversaryTracker";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Target, Heart, Zap, CheckCircle, Clock, MessageCircle } from "lucide-react";

const Activities = () => {
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Calendar className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Love Activities
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Strengthen your bond with daily activities and fun challenges. 
            Build deeper connections through meaningful interactions.
          </p>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">15</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">7</div>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">92%</div>
              <p className="text-xs text-muted-foreground">Bond level</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8 bg-card shadow-gentle">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="anniversaries" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <DailyActivities />
          </TabsContent>
          
          <TabsContent value="challenges">
            <ChallengeCenter />
          </TabsContent>
          
          <TabsContent value="qa">
            <DailyQA />
          </TabsContent>
          
          <TabsContent value="anniversaries">
            <AnniversaryTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Activities;