import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Database, CheckCircle, XCircle } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { saveDiaryEntry, DiaryEntry } from "@/lib/storage";

export const UserDiagnostic = () => {
  const { couple, currentUser, login } = useCoupleContext();
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const [isTestingWrite, setIsTestingWrite] = useState(false);
  const [testResults, setTestResults] = useState("");
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbCouples, setDbCouples] = useState<any[]>([]);

  const checkDatabase = async () => {
    if (!hasSupabaseConfig) {
      setTestResults("Supabase not configured - using localStorage mode");
      return;
    }

    try {
      // Check users table
      const { data: users, error: usersError } = await (supabase as any)
        .from('users')
        .select('id, email, name')
        .limit(10);

      if (usersError) {
        setTestResults(`Users table error: ${usersError.message}`);
        return;
      }

      setDbUsers(users || []);

      // Check couples table
      const { data: couples, error: couplesError } = await (supabase as any)
        .from('couples')
        .select('id, name, member_a_id, member_b_id')
        .limit(10);

      if (couplesError) {
        setTestResults(`Couples table error: ${couplesError.message}`);
        return;
      }

      setDbCouples(couples || []);
      setTestResults("Database check completed");
    } catch (error: any) {
      setTestResults(`Database check failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    setIsTestingLogin(true);
    try {
      await login('harika@luv.com', 'password123');
      setTestResults("Login test completed - check console for details");
    } catch (error: any) {
      setTestResults(`Login failed: ${error.message}`);
    } finally {
      setIsTestingLogin(false);
    }
  };

  const testDirectWrite = async () => {
    if (!couple?.id || !currentUser?.id) {
      setTestResults("Need to be logged in with couple to test write");
      return;
    }

    setIsTestingWrite(true);
    try {
      const testEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        title: "Direct Write Test",
        content: "Testing direct database write functionality",
        mood: "happy",
        attachments: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("TESTING: About to save entry with data:", testEntry);
      await saveDiaryEntry(testEntry);
      setTestResults("✅ Direct write test successful - check console logs");
      
      // Clean up test entry if using Supabase
      if (hasSupabaseConfig) {
        setTimeout(async () => {
          await (supabase as any)
            .from('diary_entries')
            .delete()
            .eq('id', testEntry.id);
          console.log("Test entry cleaned up");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Direct write test failed:", error);
      setTestResults(`❌ Direct write failed: ${error.message}`);
    } finally {
      setIsTestingWrite(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User & Database Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Current User</h3>
            {currentUser ? (
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {currentUser.id}</p>
                <p><strong>Name:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Not logged in</p>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Current Couple</h3>
            {couple ? (
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {couple.id}</p>
                <p><strong>Name:</strong> {couple.name}</p>
                <p><strong>Member A:</strong> {couple.memberA.name} ({couple.memberA.id})</p>
                <p><strong>Member B:</strong> {couple.memberB.name} ({couple.memberB.id})</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No couple set</p>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkDatabase} size="sm">
            <Database className="h-4 w-4 mr-2" />
            Check Database
          </Button>
          <Button 
            onClick={testLogin} 
            disabled={isTestingLogin}
            size="sm"
            variant="outline"
          >
            {isTestingLogin ? "Logging in..." : "Test Login"}
          </Button>
          <Button 
            onClick={testDirectWrite}
            disabled={isTestingWrite || !couple || !currentUser}
            size="sm"
            variant="outline"
          >
            {isTestingWrite ? "Testing..." : "Test Direct Write"}
          </Button>
        </div>

        {/* Results */}
        {testResults && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs whitespace-pre-wrap">{testResults}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Database Contents */}
        {dbUsers.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Users in Database</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {dbUsers.map(user => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2 font-mono text-xs">{user.id}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dbCouples.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Couples in Database</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Member A ID</th>
                    <th className="text-left p-2">Member B ID</th>
                  </tr>
                </thead>
                <tbody>
                  {dbCouples.map(couple => (
                    <tr key={couple.id} className="border-t">
                      <td className="p-2 font-mono text-xs">{couple.id}</td>
                      <td className="p-2">{couple.name}</td>
                      <td className="p-2 font-mono text-xs">{couple.member_a_id}</td>
                      <td className="p-2 font-mono text-xs">{couple.member_b_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Click "Check Database" to see what users/couples exist in Supabase</li>
              <li>Click "Test Login" to try logging in as Harika</li>
              <li>Check the console (F12) for detailed logs</li>
              <li>If logged in, try "Test Direct Write" to test database saving</li>
              <li>Compare the current user/couple IDs with the database IDs above</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
