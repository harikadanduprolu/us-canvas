import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScribbleGame } from "./ScribbleGame";
import { SharedDiary } from "./SharedDiary";
import { MemoryGallery } from "./MemoryGallery";
import { BookOpen, Gamepad2, Camera } from "lucide-react";

export const FeaturesSection = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Try Our Features
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience how easy it is to stay connected with your partner
        </p>
      </div>
      
      <Tabs defaultValue="diary" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8 bg-card shadow-gentle">
          <TabsTrigger value="diary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Diary
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Gallery
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="diary">
          <Card className="shadow-romantic">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Shared Digital Diary</CardTitle>
              <CardDescription className="text-lg">
                Write your thoughts, memories, and dreams together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SharedDiary />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games">
          <Card className="shadow-romantic">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Scribble & Guess</CardTitle>
              <CardDescription className="text-lg">
                Draw and guess each other's drawings in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScribbleGame />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery">
          <Card className="shadow-romantic">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Memory Gallery</CardTitle>
              <CardDescription className="text-lg">
                Share and organize your precious moments together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemoryGallery />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};