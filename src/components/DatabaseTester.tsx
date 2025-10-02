import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Database, AlertTriangle } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { saveDiaryEntry, getDiaryEntries, DiaryEntry, savePhoto, getPhotos, Photo } from "@/lib/storage";

export const DatabaseTester = () => {
  const { couple, currentUser } = useCoupleContext();
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    diaryRead: boolean | null;
    diaryWrite: boolean | null;
    photoRead: boolean | null;
    photoWrite: boolean | null;
  }>({
    connection: null,
    diaryRead: null,
    diaryWrite: null,
    photoRead: null,
    photoWrite: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const runTests = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    const results = {
      connection: false,
      diaryRead: false,
      diaryWrite: false,
      photoRead: false,
      photoWrite: false,
    };

    try {
      // Test 1: Basic connection
      console.log("Testing basic connection...");
      if (!hasSupabaseConfig) {
        setErrorMessage("Supabase not configured - using localStorage mode");
        results.connection = true; // localStorage mode works
      } else {
        const { data, error } = await (supabase as any)
          .from('users')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error("Connection test failed:", error);
          setErrorMessage(`Connection failed: ${error.message}`);
        } else {
          console.log("Connection test passed");
          results.connection = true;
        }
      }

      if (!couple?.id || !currentUser?.id) {
        setErrorMessage("Please log in and set up a couple to test data operations");
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      // Test 2: Diary read
      console.log("Testing diary read...");
      try {
        const entries = await getDiaryEntries(couple.id);
        console.log("Diary read test passed, entries:", entries);
        results.diaryRead = true;
      } catch (error: any) {
        console.error("Diary read test failed:", error);
        setErrorMessage(prev => prev + `\nDiary read failed: ${error.message}`);
      }

      // Test 3: Diary write
      console.log("Testing diary write...");
      try {
        const testEntry: DiaryEntry = {
          id: crypto.randomUUID(),
          coupleId: couple.id,
          authorId: currentUser.id,
          authorName: currentUser.name,
          title: "Database Test Entry",
          content: "This is a test entry to verify database connectivity.",
          mood: "happy",
          attachments: [],
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await saveDiaryEntry(testEntry);
        console.log("Diary write test passed");
        results.diaryWrite = true;
        
        // Clean up test entry
        if (hasSupabaseConfig) {
          await (supabase as any)
            .from('diary_entries')
            .delete()
            .eq('id', testEntry.id);
        }
      } catch (error: any) {
        console.error("Diary write test failed:", error);
        setErrorMessage(prev => prev + `\nDiary write failed: ${error.message}`);
      }

      // Test 4: Photo read
      console.log("Testing photo read...");
      try {
        const photos = await getPhotos(couple.id);
        console.log("Photo read test passed, photos:", photos);
        results.photoRead = true;
      } catch (error: any) {
        console.error("Photo read test failed:", error);
        setErrorMessage(prev => prev + `\nPhoto read failed: ${error.message}`);
      }

      // Test 5: Photo write
      console.log("Testing photo write...");
      try {
        const testPhoto: Photo = {
          id: crypto.randomUUID(),
          coupleId: couple.id,
          uploaderId: currentUser.id,
          uploaderName: currentUser.name,
          data: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVTVDwvdGV4dD48L3N2Zz4=",
          caption: "Database Test Photo",
          createdAt: new Date().toISOString(),
        };
        
        await savePhoto(testPhoto);
        console.log("Photo write test passed");
        results.photoWrite = true;
        
        // Clean up test photo
        if (hasSupabaseConfig) {
          await (supabase as any)
            .from('photos')
            .delete()
            .eq('id', testPhoto.id);
        }
      } catch (error: any) {
        console.error("Photo write test failed:", error);
        setErrorMessage(prev => prev + `\nPhoto write failed: ${error.message}`);
      }

    } catch (error: any) {
      console.error("Test suite failed:", error);
      setErrorMessage(`Test suite failed: ${error.message}`);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Button */}
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Running Tests..." : "Run Database Tests"}
        </Button>

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Connection Test</span>
            <StatusIcon status={testResults.connection} />
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Diary Read</span>
            <StatusIcon status={testResults.diaryRead} />
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Diary Write</span>
            <StatusIcon status={testResults.diaryWrite} />
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Photo Read</span>
            <StatusIcon status={testResults.photoRead} />
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span>Photo Write</span>
            <StatusIcon status={testResults.photoWrite} />
          </div>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs">{errorMessage}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Info */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          <p><strong>Supabase Config:</strong> {hasSupabaseConfig ? "✅ Available" : "❌ Missing"}</p>
          <p><strong>Current User:</strong> {currentUser ? `${currentUser.name} (${currentUser.id})` : "❌ Not logged in"}</p>
          <p><strong>Current Couple:</strong> {couple ? `${couple.name} (${couple.id})` : "❌ No couple"}</p>
        </div>
      </CardContent>
    </Card>
  );
};
