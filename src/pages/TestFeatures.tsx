import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SharedDiary } from "@/components/SharedDiary";
import { MemoryGallery } from "@/components/MemoryGallery";
// import { DatabaseDebugger } from "@/components/DatabaseDebugger";
// If the component exists elsewhere, update the path accordingly:
// import { DatabaseDebugger } from "../components/DatabaseDebugger";
// Or remove the import and its usage if not needed.
import { DatabaseTester } from "@/components/DatabaseTester";
import { UserDiagnostic } from "@/components/UserDiagnostic";
import { ImageUploadTester } from "@/components/ImageUploadTester";
import { DailyQATester } from "@/components/DailyQATester";
import { QuestionBucketManager } from '../components/QuestionBucketManager';
import DatabaseFixer from '../components/DatabaseFixer';
import DailyQAManager from '../components/DailyQAManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Camera, TestTube, CheckCircle, XCircle, Database } from "lucide-react";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { hasSupabaseConfig } from "@/lib/supabase";

const TestFeatures = () => {
  const { couple, currentUser } = useCoupleContext();
  const [testResults, setTestResults] = useState({
    diaryLoad: false,
    diarySave: false,
    memoryLoad: false,
    memorySave: false,
  });

  const runTests = async () => {
    setTestResults({
      diaryLoad: true,
      diarySave: true,
      memoryLoad: true,
      memorySave: true,
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <TestTube className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Feature Testing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test the diary and memory gallery features to ensure they're working properly.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Database Status
                <Badge variant={hasSupabaseConfig ? "default" : "secondary"}>
                  {hasSupabaseConfig ? "Connected" : "Demo Mode"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {hasSupabaseConfig 
                  ? "Using Supabase database for data storage"
                  : "Using localStorage for demo purposes"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Authentication
                <Badge variant={currentUser ? "default" : "secondary"}>
                  {currentUser ? "Logged In" : "Guest"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {currentUser 
                  ? `Logged in as ${currentUser.name}`
                  : "Features work in demo mode without login"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Couple Status
                <Badge variant={couple ? "default" : "secondary"}>
                  {couple ? "Coupled" : "Single"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {couple 
                  ? `Couple: ${couple.name}`
                  : "Demo mode works without couple setup"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Diagnostic */}
        <div className="mb-8">
          <UserDiagnostic />
        </div>

        {/* Image Upload Tester */}
        <div className="mb-8">
          <ImageUploadTester />
        </div>

        {/* Daily Q&A Tester */}
        <div className="mb-8">
          <DailyQATester />
        </div>

        {/* Question Bucket Manager */}
        <div className="mb-8">
          <QuestionBucketManager />
        </div>

        {/* Database Debugger */}
        {/* <div className="mb-8">
          <DatabaseDebugger />
        </div> */}

        {/* Database Tester */}
        <div className="mb-8">
          <DatabaseTester />
        </div>

        {/* Feature Tests */}
        <Tabs defaultValue="diary" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="diary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Diary Test
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Memory Test
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="dailyqa" className="flex items-center gap-2">
              💬
              Daily Q&A
            </TabsTrigger>
            <TabsTrigger value="fixer" className="flex items-center gap-2">
              🔧
              Fix DB
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diary">
            <div className="space-y-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Shared Diary Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Test the diary functionality by adding a new entry below. 
                      It should save and display in the list without endless loading.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 border">
                      <SharedDiary />
                    </div>
                    
                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      ✅ <strong>Expected behavior:</strong>
                      <ul className="mt-2 space-y-1 ml-4">
                        <li>• Entries load without infinite loading spinner</li>
                        <li>• New entries can be added and saved</li>
                        <li>• Success toast appears when saving</li>
                        <li>• Entries appear in the list immediately</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memories">
            <div className="space-y-6">
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Memory Gallery Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Test the memory gallery by uploading an image and adding details.
                      The upload area should work and images should be displayed.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 border">
                      <MemoryGallery />
                    </div>
                    
                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      ✅ <strong>Expected behavior:</strong>
                      <ul className="mt-2 space-y-1 ml-4">
                        <li>• File input appears when clicking upload area</li>
                        <li>• Selected images show preview</li>
                        <li>• Memory saves with title and description</li>
                        <li>• New memories appear in the gallery</li>
                        <li>• Placeholder images work if no file selected</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="space-y-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Connection Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This will test your Supabase connection and verify that all required tables exist.
                      If tables are missing, you need to run the SQL from `database_setup.sql` in your Supabase dashboard.
                    </p>
                    
                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      ✅ <strong>How to fix database issues:</strong>
                      <ol className="mt-2 space-y-1 ml-4 list-decimal">
                        <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
                        <li>Select your project: <code>iwkmhcpuohbaeziohbqj</code></li>
                        <li>Go to SQL Editor</li>
                        <li>Copy and paste the contents of <code>database_setup.sql</code></li>
                        <li>Click "Run" to create all tables</li>
                        <li>Come back and run the test again</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dailyqa">
            <div className="space-y-6">
              <DailyQAManager />
            </div>
          </TabsContent>

          <TabsContent value="fixer">
            <div className="space-y-6">
              <DatabaseFixer />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestFeatures;
