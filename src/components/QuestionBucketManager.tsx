import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Search,
  Filter,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { QuestionBucketItem } from "@/lib/storage";

interface QuestionStats {
  total: number;
  byCategory: Record<string, number>;
  active: number;
  inactive: number;
}

export const QuestionBucketManager = () => {
  const [questions, setQuestions] = useState<QuestionBucketItem[]>([]);
  const [stats, setStats] = useState<QuestionStats>({ total: 0, byCategory: {}, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New question form
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    category: "connection"
  });

  const categories = [
    "connection", "romance", "future", "growth", "fun", 
    "gratitude", "memories", "seasonal", "deep", "general"
  ];

  const categoryColors: Record<string, string> = {
    connection: "bg-blue-100 text-blue-800",
    romance: "bg-pink-100 text-pink-800", 
    future: "bg-purple-100 text-purple-800",
    growth: "bg-green-100 text-green-800",
    fun: "bg-yellow-100 text-yellow-800",
    gratitude: "bg-orange-100 text-orange-800",
    memories: "bg-indigo-100 text-indigo-800",
    seasonal: "bg-teal-100 text-teal-800",
    deep: "bg-violet-100 text-violet-800",
    general: "bg-gray-100 text-gray-800"
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    if (!hasSupabaseConfig) {
      toast("Question bucket requires Supabase configuration");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('question_bucket')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          toast("Question bucket table not found. Please run the database setup script first.");
          return;
        }
        throw error;
      }

      const questionsData = (data || []).map((q: any) => ({
        id: q.id,
        questionText: q.question_text,
        category: q.category,
        isActive: q.is_active
      }));

      setQuestions(questionsData);
      calculateStats(questionsData);
    } catch (error: any) {
      console.error('Failed to load questions:', error);
      toast(`Failed to load questions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (questionsData: QuestionBucketItem[]) => {
    const byCategory: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    questionsData.forEach(q => {
      byCategory[q.category] = (byCategory[q.category] || 0) + 1;
      if (q.isActive) active++;
      else inactive++;
    });

    setStats({
      total: questionsData.length,
      byCategory,
      active,
      inactive
    });
  };

  const addQuestion = async () => {
    if (!newQuestion.text.trim()) {
      toast("Please enter a question");
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('question_bucket')
        .insert({
          id: crypto.randomUUID(),
          question_text: newQuestion.text.trim(),
          category: newQuestion.category,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*');

      if (error) {
        console.error('Failed to add question:', error);
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          toast("Question bucket table not found. Please run the database setup script first.");
          return;
        }
        throw error;
      }

      toast("Question added successfully!");
      setNewQuestion({ text: "", category: "connection" });
      await loadQuestions();
    } catch (error: any) {
      console.error('Failed to add question:', error);
      toast(`Failed to add question: ${error.message}`);
    }
  };

  const toggleQuestionStatus = async (questionId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('question_bucket')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;

      toast(`Question ${!currentStatus ? 'activated' : 'deactivated'}`);
      await loadQuestions();
    } catch (error: any) {
      console.error('Failed to update question:', error);
      toast(`Failed to update question: ${error.message}`);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('question_bucket')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast("Question deleted successfully");
      await loadQuestions();
    } catch (error: any) {
      console.error('Failed to delete question:', error);
      toast(`Failed to delete question: ${error.message}`);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Daily Q&A Question Bucket Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> If you're getting 404 errors, you need to run the database setup script first.
              <br />
              1. Copy the SQL from <code>quick_setup_question_bucket.sql</code>
              <br />
              2. Run it in your Supabase SQL Editor
              <br />
              3. This creates the question_bucket and question_usage tables
              <br /><br />
              <strong>How it works:</strong> Questions rotate daily without repeating until all have been used (yearly cycle). 
              Add questions here to expand the variety. Categories help organize themes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Questions</TabsTrigger>
          <TabsTrigger value="add">Add New Question</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={loadQuestions} disabled={isLoading} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">Loading questions...</CardContent>
              </Card>
            ) : filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No questions found. {searchTerm || selectedCategory !== "all" ? "Try different filters." : "Add some questions to get started."}
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className={!question.isActive ? "opacity-60" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">"{question.questionText}"</p>
                        <div className="flex items-center gap-2">
                          <Badge className={categoryColors[question.category] || categoryColors.general}>
                            {question.category}
                          </Badge>
                          <Badge variant={question.isActive ? "default" : "secondary"}>
                            {question.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleQuestionStatus(question.id, question.isActive)}
                        >
                          {question.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Question Text</label>
                <Textarea
                  placeholder="Enter your question here... (e.g., What's your favorite memory from this week?)"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select 
                  value={newQuestion.category} 
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Tips for good questions:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Keep them personal and relationship-focused</li>
                    <li>Ask about feelings, memories, or preferences</li>
                    <li>Avoid yes/no questions - encourage storytelling</li>
                    <li>Make them specific enough to be interesting</li>
                    <li>Consider the emotional tone (light vs deep)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active Questions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-gray-500">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Inactive Questions</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Questions by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <Badge className={categoryColors[category] || categoryColors.general}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                    <span className="font-medium">{count} questions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>Rotation Info:</strong> With {stats.active} active questions, couples will see a new question 
              for approximately {Math.floor(stats.active / 7)} weeks before any repeats (assuming daily use).
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};
