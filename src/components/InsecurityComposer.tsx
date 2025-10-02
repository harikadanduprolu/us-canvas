import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Couple, User } from "@/contexts/CoupleContext";
import { saveInsecurity, addInsecurityAudit, InsecurityEntry } from "@/lib/storage";
import { Shield, AlertCircle, Calendar, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InsecurityComposerProps {
  couple: Couple;
  currentUser: User;
  onClose: () => void;
}

export const InsecurityComposer = ({ couple, currentUser, onClose }: InsecurityComposerProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [allowReplies, setAllowReplies] = useState(true);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before saving.",
        variant: "destructive"
      });
      return;
    }

    const entry: InsecurityEntry = {
      id: crypto.randomUUID(),
      coupleId: couple.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      title: title.trim() || undefined,
      content: content.trim(),
      attachments: [],
      urgency,
      visibility: 'sealed',
      allowReplies,
      tags,
      status: 'sealed',
      createdAt: new Date().toISOString(),
      replies: []
    };

    saveInsecurity(entry);
    
    // Add audit log
    addInsecurityAudit({
      id: crypto.randomUUID(),
      insecurityId: entry.id,
      action: 'created',
      actorId: currentUser.id,
      actorName: currentUser.name,
      createdAt: new Date().toISOString()
    });

    toast({
      title: "Insecurity saved",
      description: "Your entry has been sealed securely.",
    });

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Share an Insecurity
          </DialogTitle>
          <DialogDescription>
            A safe place to share what's hard. Your partner will be guided to respond with care and kindness.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Feeling overwhelmed at work"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind? *</Label>
            <Textarea
              id="content"
              placeholder="Share what you're feeling..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Urgency Level
            </Label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={urgency === level ? "default" : "outline"}
                  onClick={() => setUrgency(level)}
                  className="flex-1 capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., mental-health, work, family"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Allow Replies */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowReplies"
              checked={allowReplies}
              onChange={(e) => setAllowReplies(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="allowReplies" className="cursor-pointer">
              Allow my partner to reply
            </Label>
          </div>

          {/* Info box */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">What happens next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your partner will be notified</li>
              <li>They'll be asked to prepare before reading</li>
              <li>They'll see suggested supportive responses</li>
              <li>Everything is private between you two</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="romantic" className="flex-1">
              <Shield className="mr-2 h-4 w-4" />
              Save & Seal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
