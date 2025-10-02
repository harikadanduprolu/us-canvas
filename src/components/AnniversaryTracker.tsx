import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Heart, Clock, Plus, MapPin, Gift, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: "anniversary" | "birthday" | "vacation" | "date" | "custom";
  description?: string;
  partnerAReminder?: string;
  partnerBReminder?: string;
}

const anniversaryTypes = [
  { value: "anniversary", label: "Anniversary", icon: Heart },
  { value: "birthday", label: "Birthday", icon: Gift },
  { value: "vacation", label: "Vacation", icon: Plane },
  { value: "date", label: "Special Date", icon: Calendar },
  { value: "custom", label: "Custom", icon: Clock },
];

export const AnniversaryTracker = () => {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([
    {
      id: "1",
      title: "Our First Anniversary",
      date: "2024-02-14",
      type: "anniversary",
      description: "One year since we became official!",
      partnerAReminder: "Book that fancy restaurant you mentioned",
      partnerBReminder: "Pick out that dress you've been saving"
    },
    {
      id: "2", 
      title: "Sarah's Birthday",
      date: "2024-03-20",
      type: "birthday",
      description: "My love's special day!",
      partnerAReminder: "Get the necklace she was looking at",
      partnerBReminder: "Plan something fun for the day!"
    },
    {
      id: "3",
      title: "Paris Trip",
      date: "2024-05-15",
      type: "vacation",
      description: "Our romantic getaway to the City of Love",
      partnerAReminder: "Book the Eiffel Tower dinner",
      partnerBReminder: "Pack that red dress for the dinner"
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAnniversary, setNewAnniversary] = useState({
    title: "",
    date: "",
    type: "anniversary" as Anniversary["type"],
    description: "",
    partnerAReminder: "",
    partnerBReminder: ""
  });

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCountdownText = (days: number) => {
    if (days < 0) return "Passed";
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `${days} days`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  const getTypeIcon = (type: Anniversary["type"]) => {
    const typeInfo = anniversaryTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type: Anniversary["type"]) => {
    switch (type) {
      case "anniversary": return "bg-red-500";
      case "birthday": return "bg-purple-500";
      case "vacation": return "bg-blue-500";
      case "date": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  const handleAddAnniversary = () => {
    if (!newAnniversary.title || !newAnniversary.date) return;
    
    const anniversary: Anniversary = {
      id: Date.now().toString(),
      ...newAnniversary
    };
    
    setAnniversaries([...anniversaries, anniversary]);
    setNewAnniversary({
      title: "",
      date: "",
      type: "anniversary",
      description: "",
      partnerAReminder: "",
      partnerBReminder: ""
    });
    setIsAddingNew(false);
  };

  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    const daysA = getDaysUntil(a.date);
    const daysB = getDaysUntil(b.date);
    
    // Put upcoming events first, then sort by how soon they are
    if (daysA >= 0 && daysB >= 0) return daysA - daysB;
    if (daysA >= 0) return -1;
    if (daysB >= 0) return 1;
    return daysB - daysA; // Both are past, show most recent first
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Anniversary Tracker</h2>
        </div>
        
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-romantic text-white shadow-romantic">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newAnniversary.title}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, title: e.target.value}))}
                  placeholder="Our Anniversary"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAnniversary.date}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, date: e.target.value}))}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={newAnniversary.type}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, type: e.target.value as Anniversary["type"]}))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {anniversaryTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newAnniversary.description}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, description: e.target.value}))}
                  placeholder="Special notes about this day"
                />
              </div>
              
              <div>
                <Label htmlFor="partnerA">Reminder for Partner A</Label>
                <Input
                  id="partnerA"
                  value={newAnniversary.partnerAReminder}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, partnerAReminder: e.target.value}))}
                  placeholder="Don't forget to..."
                />
              </div>
              
              <div>
                <Label htmlFor="partnerB">Reminder for Partner B</Label>
                <Input
                  id="partnerB"
                  value={newAnniversary.partnerBReminder}
                  onChange={(e) => setNewAnniversary(prev => ({...prev, partnerBReminder: e.target.value}))}
                  placeholder="Remember to..."
                />
              </div>
              
              <Button onClick={handleAddAnniversary} className="w-full">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Events */}
      <div className="grid gap-4">
        {sortedAnniversaries.map((anniversary) => {
          const daysUntil = getDaysUntil(anniversary.date);
          const isUpcoming = daysUntil >= 0;
          const isToday = daysUntil === 0;
          const isSoon = daysUntil <= 7 && daysUntil > 0;
          
          return (
            <Card 
              key={anniversary.id} 
              className={cn(
                "shadow-gentle hover:shadow-romantic transition-smooth",
                isToday && "bg-gradient-romantic text-white",
                isSoon && "border-primary/50 bg-primary/5"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", 
                      isToday ? "bg-white/20" : getTypeColor(anniversary.type)
                    )}>
                      <div className={isToday ? "text-white" : "text-white"}>
                        {getTypeIcon(anniversary.type)}
                      </div>
                    </div>
                    <div>
                      <CardTitle className={cn("text-lg", isToday ? "text-white" : "text-foreground")}>
                        {anniversary.title}
                      </CardTitle>
                      <p className={cn("text-sm", isToday ? "text-white/90" : "text-muted-foreground")}>
                        {new Date(anniversary.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={isToday ? "secondary" : isUpcoming ? "default" : "outline"}
                      className={cn(
                        isToday && "bg-white/20 text-white border-white/40"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {getCountdownText(daysUntil)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {anniversary.description && (
                  <p className={cn("text-sm", isToday ? "text-white/90" : "text-muted-foreground")}>
                    {anniversary.description}
                  </p>
                )}
                
                {(anniversary.partnerAReminder || anniversary.partnerBReminder) && (
                  <div className="space-y-2">
                    <h4 className={cn("text-sm font-medium", isToday ? "text-white" : "text-foreground")}>
                      Reminders:
                    </h4>
                    {anniversary.partnerAReminder && (
                      <div className={cn("p-2 rounded-lg text-sm", 
                        isToday ? "bg-white/10" : "bg-primary/5"
                      )}>
                        <span className={cn("font-medium", isToday ? "text-white" : "text-primary")}>
                          Partner A:
                        </span>{" "}
                        <span className={isToday ? "text-white/90" : "text-foreground"}>
                          {anniversary.partnerAReminder}
                        </span>
                      </div>
                    )}
                    {anniversary.partnerBReminder && (
                      <div className={cn("p-2 rounded-lg text-sm",
                        isToday ? "bg-white/10" : "bg-secondary/5"
                      )}>
                        <span className={cn("font-medium", isToday ? "text-white" : "text-secondary")}>
                          Partner B:
                        </span>{" "}
                        <span className={isToday ? "text-white/90" : "text-foreground"}>
                          {anniversary.partnerBReminder}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};