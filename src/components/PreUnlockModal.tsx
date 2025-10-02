import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Heart, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { InsecurityEntry, saveInsecurity, addInsecurityAudit } from "@/lib/storage";
import { User } from "@/contexts/CoupleContext";
import { toast } from "@/hooks/use-toast";

interface PreUnlockModalProps {
  entry: InsecurityEntry;
  currentUser: User;
  onUnlocked: () => void;
  onNeedTime: () => void;
}

export const PreUnlockModal = ({ entry, currentUser, onUnlocked, onNeedTime }: PreUnlockModalProps) => {
  const [checks, setChecks] = useState({
    calm: false,
    listen: false,
    privacy: false
  });

  const allChecked = checks.calm && checks.listen && checks.privacy;

  const handleOpen = () => {
    if (!allChecked) {
      toast({
        title: "Please confirm readiness",
        description: "All checkboxes must be checked before opening.",
        variant: "destructive"
      });
      return;
    }

    // Update entry status
    const updatedEntry: InsecurityEntry = {
      ...entry,
      status: 'opened',
      openedBy: currentUser.id,
      openedAt: new Date().toISOString()
    };
    saveInsecurity(updatedEntry);

    // Add audit
    addInsecurityAudit({
      id: crypto.randomUUID(),
      insecurityId: entry.id,
      action: 'opened',
      actorId: currentUser.id,
      actorName: currentUser.name,
      createdAt: new Date().toISOString()
    });

    onUnlocked();
  };

  const handleNeedTime = () => {
    toast({
      title: "Take your time",
      description: "We'll keep this here for when you're ready.",
    });
    onNeedTime();
  };

  return (
    <Dialog open={true} onOpenChange={onNeedTime}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary animate-heartbeat" />
            Before You Open
          </DialogTitle>
          <DialogDescription>
            This content is sensitive. Please make sure you can be fully present and kind.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Urgency Warning */}
          {entry.urgency === 'high' && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="ml-2">
                <p className="font-semibold mb-2">This is marked as high urgency</p>
                <p className="text-sm">
                  If you or they are in immediate danger, contact emergency services. 
                  <a 
                    href="https://988lifeline.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 underline inline-flex items-center gap-1"
                  >
                    Get help resources
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Readiness Checklist */}
          <div className="space-y-4 bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Ready to Listen?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="calm" 
                  checked={checks.calm}
                  onCheckedChange={(checked) => setChecks({...checks, calm: checked as boolean})}
                />
                <Label htmlFor="calm" className="cursor-pointer text-base leading-relaxed">
                  I'm in a calm place right now and can give this my full attention
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="listen" 
                  checked={checks.listen}
                  onCheckedChange={(checked) => setChecks({...checks, listen: checked as boolean})}
                />
                <Label htmlFor="listen" className="cursor-pointer text-base leading-relaxed">
                  I can listen without judgment and respond with kindness
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="privacy" 
                  checked={checks.privacy}
                  onCheckedChange={(checked) => setChecks({...checks, privacy: checked as boolean})}
                />
                <Label htmlFor="privacy" className="cursor-pointer text-base leading-relaxed">
                  I will respect their privacy and not share this with anyone
                </Label>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Remember:</strong> Your partner is being vulnerable. 
              They're sharing this because they trust you.
            </p>
            <p>
              You don't need to fix anything or have all the answers. Sometimes just being there is enough.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleNeedTime} 
              variant="outline" 
              className="flex-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              I Need Time
            </Button>
            <Button 
              onClick={handleOpen} 
              variant="romantic" 
              className="flex-1"
              disabled={!allChecked}
            >
              <Heart className="mr-2 h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
