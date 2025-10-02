import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Loader2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getTodayQuestion, answerDailyQuestion, DailyQuestion } from "@/lib/storage";
import { useCoupleContext } from "@/contexts/CoupleContext";

export const DailyQATester = () => {
  const { couple, currentUser } = useCoupleContext();
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<DailyQuestion | null>(null);
  const [testAnswer, setTestAnswer] = useState("");

  const loadTodaysQuestion = async () => {
    if (!couple?.id) {
      toast("Please log in with a couple account to test");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading today's question for couple:", couple.id);
      const question = await getTodayQuestion(couple.id);
      setCurrentQuestion(question);
      console.log("Loaded question:", question);
      toast("Question loaded successfully!");
    } catch (error: any) {
      console.error("Failed to load question:", error);
      toast(`Failed to load question: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTestAnswer = async () => {
    if (!currentQuestion?.id || !currentUser?.id || !testAnswer.trim()) {
      toast("Please load a question and enter an answer first");
      return;
    }

    setIsLoading(true);
    try {
      const isPartnerA = couple?.memberA.id === currentUser.id;
      console.log("Submitting answer:", {
        questionId: currentQuestion.id,
        userId: currentUser.id,
        answer: testAnswer,
        isPartnerA
      });

      await answerDailyQuestion(currentQuestion.id, currentUser.id, testAnswer, isPartnerA);
      
      // Reload question to see updated data
      const updatedQuestion = await getTodayQuestion(couple!.id);
      setCurrentQuestion(updatedQuestion);
      
      setTestAnswer("");
      toast("Answer saved successfully! 💕");
    } catch (error: any) {
      console.error("Failed to save answer:", error);
      toast(`Failed to save answer: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnswerText = (answer: any): string => {
    if (!answer) return "";
    if (typeof answer === 'string') return answer;
    if (typeof answer === 'object' && answer.text) return answer.text;
    return "";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Daily Q&A Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={currentUser && couple ? "default" : "secondary"}>
            {currentUser && couple ? "Ready to Test" : "Login Required"}
          </Badge>
          {currentUser && couple && (
            <span className="text-sm text-muted-foreground">
              Testing as {currentUser.name} in "{couple.name}"
            </span>
          )}
        </div>

        {/* Load Question Button */}
        <Button
          onClick={loadTodaysQuestion}
          disabled={!currentUser || !couple || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Load Today's Question
            </>
          )}
        </Button>

        {/* Current Question */}
        {currentQuestion && (
          <Alert>
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Today's Question:</h4>
                  <p className="italic">"{currentQuestion.questionText}"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Date: {new Date(currentQuestion.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Answer Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Partner A:</span>
                    {currentQuestion.answerByA ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Partner B:</span>
                    {currentQuestion.answerByB ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Show Existing Answers */}
                {(currentQuestion.answerByA || currentQuestion.answerByB) && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Current Answers:</h5>
                    {currentQuestion.answerByA && (
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <strong>Partner A:</strong> {getAnswerText(currentQuestion.answerByA)}
                      </div>
                    )}
                    {currentQuestion.answerByB && (
                      <div className="p-2 bg-pink-50 rounded text-sm">
                        <strong>Partner B:</strong> {getAnswerText(currentQuestion.answerByB)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Answer Input */}
        {currentQuestion && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Answer:</label>
              <Textarea
                value={testAnswer}
                onChange={(e) => setTestAnswer(e.target.value)}
                placeholder="Write your test answer here..."
                rows={3}
                className="mt-1"
              />
            </div>

            <Button
              onClick={submitTestAnswer}
              disabled={!testAnswer.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Test Answer
                </>
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <div className="text-sm space-y-2">
              <p><strong>How to test Daily Q&A:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Make sure you're logged in (use User Diagnostic above)</li>
                <li>Click "Load Today's Question" to get or create today's question</li>
                <li>Write a test answer and submit it</li>
                <li>Check the console (F12) for detailed logs</li>
                <li>Try logging in as the other partner to test both answers</li>
                <li>Visit the actual Daily Q&A page to see the full interface</li>
              </ol>
              <p className="mt-3 text-muted-foreground">
                This tests the complete Q&A flow: question loading → answer submission → status updates
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
