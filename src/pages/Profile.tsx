import { CoupleProfile } from "@/components/CoupleProfile";
import { MoodTracker } from "@/components/MoodTracker";
import { UserProfileEditor } from "@/components/UserProfileEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Heart, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoupleContext } from "@/contexts/CoupleContext";

const Profile = () => {
  const { logout } = useCoupleContext();

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <User className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Love Profile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your relationship journey, set goals, and celebrate your growth together.
          </p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">Level 7</div>
              <p className="text-xs text-muted-foreground">Couple level</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">89%</div>
              <p className="text-xs text-muted-foreground">Happiness</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">247</div>
              <p className="text-xs text-muted-foreground">Days together</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2 animate-heartbeat" />
              <div className="text-lg font-bold text-foreground">95%</div>
              <p className="text-xs text-muted-foreground">Love meter</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-card shadow-gentle">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mood Tracker
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-6">
              <UserProfileEditor />
              <CoupleProfile />
              <Card className="shadow-gentle p-4 text-center">
                <h3 className="text-lg font-semibold mb-3">Manage Session</h3>
                <Button variant="destructive" onClick={logout} className="w-full">
                  Logout
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="mood">
            <MoodTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;