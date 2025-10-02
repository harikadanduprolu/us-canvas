import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Calendar, AlertCircle } from "lucide-react";
import { InsecurityEntry } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";

interface InsecurityCardProps {
  entry: InsecurityEntry;
  currentUserId: string;
  onOpen: () => void;
}

export const InsecurityCard = ({ entry, currentUserId, onOpen }: InsecurityCardProps) => {
  const isAuthor = entry.authorId === currentUserId;
  const isSealed = entry.status === 'sealed';
  
  const urgencyColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-accent text-accent-foreground',
    high: 'bg-destructive/20 text-destructive',
  };

  const urgencyIcons = {
    low: null,
    medium: <AlertCircle className="h-3 w-3" />,
    high: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-1">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isSealed ? (
              <Lock className="h-5 w-5 text-primary" />
            ) : (
              <Unlock className="h-5 w-5 text-muted-foreground" />
            )}
            <Badge variant={isSealed ? "default" : "secondary"}>
              {isSealed ? 'Sealed' : 'Opened'}
            </Badge>
          </div>
          <Badge className={urgencyColors[entry.urgency]}>
            <span className="flex items-center gap-1">
              {urgencyIcons[entry.urgency]}
              {entry.urgency}
            </span>
          </Badge>
        </div>
        
        {entry.title && (
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {entry.title}
          </h3>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div>
            {isAuthor ? (
              <span className="text-primary">By you</span>
            ) : (
              <span>From {entry.authorName}</span>
            )}
          </div>
        </div>

        {!isSealed && entry.openedAt && (
          <div className="text-sm text-muted-foreground">
            Opened {formatDistanceToNow(new Date(entry.openedAt), { addSuffix: true })}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button 
          onClick={onOpen}
          variant={isSealed ? "romantic" : "dreamy"}
          className="w-full"
        >
          {isSealed ? (
            isAuthor ? 'View' : 'Open'
          ) : (
            'View'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
