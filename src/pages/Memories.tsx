import { MemoryGallery } from "@/components/MemoryGallery";
import { MemoryTimeline } from "@/components/MemoryTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Heart, Camera, Plus, Star, Clock, Image, Video } from "lucide-react";

const Memories = () => {
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <Camera className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Beautiful Memories
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Treasure every moment together. Upload photos, create timelines, 
            and relive your most precious memories as a couple.
          </p>
        </div>

        {/* Memory Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Image className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">127</div>
              <p className="text-xs text-muted-foreground">Photos</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Video className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">23</div>
              <p className="text-xs text-muted-foreground">Videos</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">Milestones</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth">
            <CardContent className="pt-4">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">365</div>
              <p className="text-xs text-muted-foreground">Days together</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-card shadow-gentle">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery">
            <MemoryGallery />
          </TabsContent>
          
          <TabsContent value="timeline">
            <MemoryTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Memories;