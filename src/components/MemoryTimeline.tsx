import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Heart, Camera, Plus, Star } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "milestone" | "photo" | "memory" | "anniversary";
  location?: string;
  imageUrl?: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "We Met! 💕",
    description: "The day our love story began at the coffee shop downtown. You spilled coffee on my book, and I knew you were special!",
    date: "2024-01-01",
    type: "milestone",
    location: "Downtown Café",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
  },
  {
    id: "2", 
    title: "First Date",
    description: "Dinner at that Italian place. We talked for hours and closed down the restaurant. The beginning of forever! 🍝",
    date: "2024-01-05",
    type: "memory",
    location: "Bella Vista Restaurant",
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Made it Official! 💖",
    description: "The day we decided to be exclusive. Walking in the park under the stars, you asked me to be your girlfriend.",
    date: "2024-01-15",
    type: "milestone",
    location: "Central Park",
  },
  {
    id: "4",
    title: "Weekend Getaway",
    description: "Our first trip together to the mountains. Hiking, campfires, and falling deeper in love with nature and each other.",
    date: "2024-02-14",
    type: "memory",
    location: "Blue Ridge Mountains",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
  },
  {
    id: "5",
    title: "First 'I Love You' 💕",
    description: "During that movie night at home, right before the credits rolled, we both said it at the same time. Perfect timing!",
    date: "2024-03-22",
    type: "milestone",
    location: "Your Apartment",
  },
  {
    id: "6",
    title: "Meeting Your Parents",
    description: "The day I met your family. I was so nervous, but they welcomed me with open arms. Your mom made the best apple pie! 🥧",
    date: "2024-04-10",
    type: "memory",
    location: "Your Parents' House",
  },
];

const typeIcons = {
  milestone: <Star className="h-4 w-4" />,
  photo: <Camera className="h-4 w-4" />,
  memory: <Heart className="h-4 w-4" />,
  anniversary: <Calendar className="h-4 w-4" />,
};

const typeColors = {
  milestone: "bg-yellow-100 text-yellow-800 border-yellow-200",
  photo: "bg-blue-100 text-blue-800 border-blue-200", 
  memory: "bg-pink-100 text-pink-800 border-pink-200",
  anniversary: "bg-purple-100 text-purple-800 border-purple-200",
};

export const MemoryTimeline = () => {
  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="h-6 w-6" />
            Our Love Timeline
          </CardTitle>
          <p className="text-muted-foreground">
            Every milestone, memory, and magical moment we've shared together
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button variant="romantic" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Memory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-romantic"></div>

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-6">
              {/* Timeline Dot */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-romantic rounded-full flex items-center justify-center text-white shadow-romantic">
                  {typeIcons[event.type]}
                </div>
                {index < timelineEvents.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-0.5 h-6 bg-gradient-romantic transform -translate-x-1/2"></div>
                )}
              </div>

              {/* Event Card */}
              <Card className="flex-1 hover:shadow-romantic transition-smooth hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={`${typeColors[event.type]} flex items-center gap-1`}>
                      {typeIcons[event.type]}
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {event.imageUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <p className="text-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Footer */}
      <Card className="bg-gradient-love text-white text-center shadow-gentle">
        <CardContent className="pt-6">
          <Heart className="h-8 w-8 mx-auto mb-3 animate-heartbeat" />
          <h3 className="text-xl font-semibold mb-2">Our Story Continues...</h3>
          <p className="opacity-90">
            Every day with you adds a new beautiful chapter to our love story. 
            Here's to many more memories to come! 💕
          </p>
        </CardContent>
      </Card>
    </div>
  );
};