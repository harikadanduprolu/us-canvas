import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { useCoupleContext } from "@/contexts/CoupleContext";

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
}

export const DatabaseDebugger = () => {
  const { couple, currentUser } = useCoupleContext();
  const [isChecking, setIsChecking] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const requiredTables = [
    'users',
    'couples', 
    'diary_entries',
    'photos',
    'daily_questions',
    'reminders',
    'insecurities',
    'insecurity_replies',
    'song_bucket'
  ];

  const checkDatabaseConnection = async () => {
    if (!hasSupabaseConfig) {
      setConnectionStatus('error');
      setErrorMessage('Supabase configuration not found. Check your .env file.');
      return;
    }

    setIsChecking(true);
    setTableStatuses([]);
    setErrorMessage('');

    try {
      // Test basic connection
      const { data: connectionTest, error: connectionError } = await (supabase as any)
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        setConnectionStatus('error');
        setErrorMessage(`Connection failed: ${connectionError.message}`);
        setIsChecking(false);
        return;
      }

      setConnectionStatus('connected');

      // Check each table
      const statuses: TableStatus[] = [];
      
      for (const tableName of requiredTables) {
        try {
          const { data, error } = await (supabase as any)
            .from(tableName)
            .select('*')
            .limit(1);

          statuses.push({
            name: tableName,
            exists: !error,
            error: error?.message
          });
        } catch (err: any) {
          statuses.push({
            name: tableName,
            exists: false,
            error: err.message || 'Unknown error'
          });
        }
      }

      setTableStatuses(statuses);
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage(`Unexpected error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const testDataOperations = async () => {
    if (!couple?.id || !currentUser?.id) {
      setErrorMessage('Please log in and set up a couple to test data operations');
      return;
    }

    setIsChecking(true);
    try {
      // Test diary entry creation
      const testEntry = {
        id: crypto.randomUUID(),
        couple_id: couple.id,
        author_id: currentUser.id,
        author_name: currentUser.name,
        title: 'Database Test Entry',
        content: 'This is a test entry created by the database debugger.',
        attachments: [],
        is_private: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await (supabase as any)
        .from('diary_entries')
        .insert(testEntry)
        .select();

      if (error) {
        setErrorMessage(`Data operation failed: ${error.message}`);
      } else {
        setErrorMessage('');
        // Clean up test entry
        await (supabase as any)
          .from('diary_entries')
          .delete()
          .eq('id', testEntry.id);
      }
    } catch (err: any) {
      setErrorMessage(`Data operation error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Debugger
          <Badge variant={hasSupabaseConfig ? "default" : "secondary"}>
            {hasSupabaseConfig ? "Configured" : "Not Configured"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">Connection Status</p>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Connected to Supabase</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Connection Failed</span>
                </>
              )}
              {connectionStatus === 'unknown' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Not Tested</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={checkDatabaseConnection}
              disabled={isChecking || !hasSupabaseConfig}
              size="sm"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            
            <Button 
              onClick={testDataOperations}
              disabled={isChecking || !hasSupabaseConfig || connectionStatus !== 'connected'}
              size="sm"
              variant="outline"
            >
              Test Data Ops
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Table Status */}
        {tableStatuses.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium">Required Tables</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {tableStatuses.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-mono">{table.name}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(table.exists)}
                    <Badge variant={table.exists ? "default" : "destructive"} className="text-xs">
                      {table.exists ? "OK" : "Missing"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current User/Couple Info */}
        <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
          <p><strong>Current User:</strong> {currentUser ? `${currentUser.name} (${currentUser.email})` : 'Not logged in'}</p>
          <p><strong>Current Couple:</strong> {couple ? `${couple.name} (${couple.id})` : 'No couple set'}</p>
          <p><strong>Environment:</strong> {hasSupabaseConfig ? 'Production (Supabase)' : 'Development (localStorage)'}</p>
        </div>

        {/* Setup Instructions */}
        {!hasSupabaseConfig && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> To use the database, create a <code>.env</code> file with your Supabase credentials:
              <br />
              <code>VITE_SUPABASE_URL=your_url_here</code>
              <br />
              <code>VITE_SUPABASE_ANON_KEY=your_key_here</code>
            </AlertDescription>
          </Alert>
        )}

        {tableStatuses.some(t => !t.exists) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Missing Tables:</strong> Some required tables are missing. 
              Run the SQL setup script in your Supabase dashboard to create them.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
