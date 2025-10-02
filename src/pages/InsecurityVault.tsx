import { useState, useEffect } from "react";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Plus, Shield, Heart } from "lucide-react";
import { getInsecurities, InsecurityEntry } from "@/lib/storage";
import { InsecurityCard } from "@/components/InsecurityCard";
import { InsecurityComposer } from "@/components/InsecurityComposer";
import { PreUnlockModal } from "@/components/PreUnlockModal";
import { InsecurityViewer } from "@/components/InsecurityViewer";

const InsecurityVault = () => {
  const { couple, currentUser } = useCoupleContext();
  const [entries, setEntries] = useState<InsecurityEntry[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<InsecurityEntry | null>(null);
  const [showPreUnlock, setShowPreUnlock] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    if (couple) {
      loadEntries();
    }
  }, [couple]);

  const loadEntries = () => {
    if (couple) {
      const allEntries = getInsecurities(couple.id);
      setEntries(allEntries);
    }
  };

  const handleOpenAttempt = (entry: InsecurityEntry) => {
    setSelectedEntry(entry);
    
    // If already opened, go straight to viewer
    if (entry.status === 'opened' || entry.status === 'responded') {
      setShowViewer(true);
    } else {
      // Show pre-unlock modal first
      setShowPreUnlock(true);
    }
  };

  const handleUnlocked = () => {
    setShowPreUnlock(false);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedEntry(null);
    loadEntries();
  };

  const handleComposerClose = () => {
    setShowComposer(false);
    loadEntries();
  };

  if (!couple || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sunset">
        <Card className="p-8 text-center max-w-md">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Please log in to access the Insecurity Vault.</p>
        </Card>
      </div>
    );
  }

  const sealedEntries = entries.filter(e => e.status === 'sealed');
  const openedEntries = entries.filter(e => e.status === 'opened' || e.status === 'responded');

  return (
    <div className="min-h-screen bg-gradient-sunset">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary animate-heartbeat" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Insecurity Vault
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            A safe place to share what's hard. Your partner will be guided to respond with care.
          </p>
          <Button 
            onClick={() => setShowComposer(true)}
            variant="romantic"
            size="lg"
            className="shadow-romantic"
          >
            <Plus className="mr-2 h-5 w-5" />
            Share an Insecurity
          </Button>
        </div>

        {/* Sealed Entries */}
        {sealedEntries.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Sealed</h2>
              <span className="text-muted-foreground">({sealedEntries.length})</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sealedEntries.map(entry => (
                <InsecurityCard
                  key={entry.id}
                  entry={entry}
                  currentUserId={currentUser.id}
                  onOpen={() => handleOpenAttempt(entry)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Opened Entries */}
        {openedEntries.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Opened</h2>
              <span className="text-muted-foreground">({openedEntries.length})</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openedEntries.map(entry => (
                <InsecurityCard
                  key={entry.id}
                  entry={entry}
                  currentUserId={currentUser.id}
                  onOpen={() => handleOpenAttempt(entry)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <Card className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Your Vault is Empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This is a safe space to share vulnerabilities. When you're ready, create your first entry.
            </p>
            <Button onClick={() => setShowComposer(true)} variant="dreamy">
              <Plus className="mr-2 h-4 w-4" />
              Create First Entry
            </Button>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showComposer && couple && currentUser && (
        <InsecurityComposer
          couple={couple}
          currentUser={currentUser}
          onClose={handleComposerClose}
        />
      )}

      {showPreUnlock && selectedEntry && currentUser && (
        <PreUnlockModal
          entry={selectedEntry}
          currentUser={currentUser}
          onUnlocked={handleUnlocked}
          onNeedTime={() => setShowPreUnlock(false)}
        />
      )}

      {showViewer && selectedEntry && currentUser && couple && (
        <InsecurityViewer
          entry={selectedEntry}
          currentUser={currentUser}
          couple={couple}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default InsecurityVault;
