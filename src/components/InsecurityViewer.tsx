import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, Send, Calendar, AlertCircle, User } from "lucide-react";
import { InsecurityEntry, InsecurityReply, saveInsecurity, addInsecurityAudit } from "@/lib/storage";
import { User as UserType, Couple } from "@/contexts/CoupleContext";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface InsecurityViewerProps {
  entry: InsecurityEntry;
  currentUser: UserType;
  couple: Couple;
  onClose: () => void;
}

const SUGGESTED_REPLIES = [
  "Thank you for sharing this with me. I'm here for you. 💕",
  "I hear you and I care deeply. Do you want to talk about this now?",
  "I'm so sorry you're feeling this way. How can I support you?",
  "I may not have all the answers, but I'm here to listen. Want to call?",
  "This means a lot that you told me. I love you and we'll figure this out together.",
];

export const InsecurityViewer = ({ entry, currentUser, couple, onClose }: InsecurityViewerProps) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const isAuthor = entry.authorId === currentUser.id;
  const canReply = entry.allowReplies && !isAuthor;

  const urgencyColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-accent text-accent-foreground',
    high: 'bg-destructive/20 text-destructive',
  };

  const handleQuickReply = (message: string) => {
    sendReply(message);
  };

  const handleCustomReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Message required",
        description: "Please write something before sending.",
        variant: "destructive"
      });
      return;
    }
    sendReply(replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
  };

  const sendReply = (message: string) => {
    const reply: InsecurityReply = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      message,
      createdAt: new Date().toISOString()
    };

    const updatedEntry: InsecurityEntry = {
      ...entry,
      status: 'responded',
      replies: [...entry.replies, reply]
    };

    saveInsecurity(updatedEntry);

    addInsecurityAudit({
      id: crypto.randomUUID(),
      insecurityId: entry.id,
      action: 'commented',
      actorId: currentUser.id,
      actorName: currentUser.name,
      createdAt: new Date().toISOString()
    });

    toast({
      title: "Reply sent",
      description: "Your message has been delivered.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-2xl">
                {entry.title || 'Shared Insecurity'}
              </span>
            </div>
            <Badge className={urgencyColors[entry.urgency]}>
              <span className="flex items-center gap-1">
                {entry.urgency === 'high' && <AlertCircle className="h-3 w-3" />}
                {entry.urgency}
              </span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>From {entry.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </span>
            </div>
            {entry.openedAt && (
              <div className="flex items-center gap-2">
                <span>Opened {formatDistanceToNow(new Date(entry.openedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content */}
          <Card className="p-6 bg-muted/30">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </Card>

          {/* Existing Replies */}
          {entry.replies.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Replies</h3>
              {entry.replies.map(reply => (
                <Card key={reply.id} className="p-4 bg-primary/5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-sm text-foreground">
                      {reply.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{reply.message}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Reply Section */}
          {canReply && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Send Support
              </h3>

              {/* Suggested Replies */}
              {!showReplyBox && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick responses:</p>
                  <div className="grid gap-2">
                    {SUGGESTED_REPLIES.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleQuickReply(suggestion)}
                        variant="outline"
                        className="justify-start text-left h-auto py-3 px-4"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    onClick={() => setShowReplyBox(true)}
                    variant="dreamy"
                    className="w-full"
                  >
                    Write Custom Message
                  </Button>
                </div>
              )}

              {/* Custom Reply Box */}
              {showReplyBox && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowReplyBox(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCustomReply}
                      variant="romantic"
                      className="flex-1"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info for author */}
          {isAuthor && !entry.allowReplies && (
            <div className="text-sm text-muted-foreground italic text-center">
              You've disabled replies for this entry
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
