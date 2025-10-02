import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { getTodayQuestion, answerDailyQuestion, DailyQuestion } from "@/lib/storage";
import { toast } from "sonner";

interface QAEntry {
  id: string;
  question: string;
  date: string;
  partnerAAnswer?: string;
  partnerBAnswer?: string;
  isCompleted: boolean;
}



export const DailyQA = () => {
  const { couple, currentUser: user } = useCoupleContext();
  const [todayQuestion, setTodayQuestion] = useState<DailyQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPartnerA, setIsPartnerA] = useState(true);

  // Helper function to extract text from answer (can be string or object)
  const getAnswerText = (answer: any): string => {
    if (!answer) return "";
    if (typeof answer === 'string') return answer;
    if (typeof answer === 'object' && answer.text) return answer.text;
    return "";
  };

  // Load today's question from database
  useEffect(() => {
    const loadTodayQuestion = async () => {
      if (!couple?.id || !user?.id) return;
      
      try {
        setIsLoading(true);
        const question = await getTodayQuestion(couple.id);
        setTodayQuestion(question);
        
        // Determine if current user is partner A or B
        const isUserPartnerA = couple.memberA.id === user.id;
        setIsPartnerA(isUserPartnerA);
        
        // Set existing answer if user has already answered
        const existingAnswer = isUserPartnerA ? question.answerByA : question.answerByB;
        const existingAnswerText = getAnswerText(existingAnswer);
        if (existingAnswerText) {
          setUserAnswer(existingAnswerText);
        }
      } catch (error) {
        console.error('Error loading today\'s question:', error);
        toast("Failed to load today's question");
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayQuestion();
  }, [couple?.id, user?.id]);

  const handleSubmitAnswer = async () => {
    if (!todayQuestion?.id || !user?.id || !userAnswer.trim()) {
      toast("Please write an answer before submitting");
      return;
    }

    try {
      setIsLoading(true);
      
      await answerDailyQuestion(todayQuestion.id, user.id, userAnswer, isPartnerA);
      
      toast("Answer saved successfully! 💕 Your response has been recorded.", {
        description: "Check back later to see your partner's response!"
      });

      // Reload the question to get updated data
      const updatedQuestion = await getTodayQuestion(couple!.id);
      setTodayQuestion(updatedQuestion);
      
      console.log('Answer saved and question reloaded:', updatedQuestion);
      
    } catch (error) {
      console.error('Error saving answer:', error);
      toast("Failed to save answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Question */}
      <Card className="bg-gradient-romantic shadow-romantic border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-white text-xl">Today's Question</CardTitle>
          <p className="text-white/90 text-sm">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-white text-center py-4">Loading...</div>
          ) : todayQuestion ? (
            <>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-white text-lg font-medium text-center">
                  "{todayQuestion.questionText}"
                </p>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                />
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isLoading}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  {isLoading ? "Saving..." : "Submit Answer"}
                </Button>
              </div>

              {/* Show partner's answer if available */}
              {todayQuestion && (
                <div className="space-y-2">
                  {(isPartnerA ? todayQuestion.answerByB : todayQuestion.answerByA) && (
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/70 text-sm mb-1">Your partner's answer:</p>
                      <p className="text-white">
                        {getAnswerText(isPartnerA ? todayQuestion.answerByB : todayQuestion.answerByA)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-white text-center py-4">No question available</div>
          )}
        </CardContent>
      </Card>

      {/* Current Question Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Today's Status</h3>
        </div>

        {todayQuestion && (
          <Card className="shadow-gentle">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">
                Question for {new Date(todayQuestion.date).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-muted-foreground italic">"{todayQuestion.questionText}"</p>
                
                <div className="space-y-2">
                  {/* User's answer */}
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">You</span>
                      {(isPartnerA ? todayQuestion.answerByA : todayQuestion.answerByB) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-foreground">
                      {(isPartnerA ? todayQuestion.answerByA : todayQuestion.answerByB) 
                        ? getAnswerText(isPartnerA ? todayQuestion.answerByA : todayQuestion.answerByB)
                        : "Not answered yet"
                      }
                    </p>
                  </div>

                  {/* Partner's answer */}
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-secondary-foreground" />
                      <span className="text-sm font-medium">Your Partner</span>
                      {(isPartnerA ? todayQuestion.answerByB : todayQuestion.answerByA) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-foreground">
                      {(isPartnerA ? todayQuestion.answerByB : todayQuestion.answerByA)
                        ? getAnswerText(isPartnerA ? todayQuestion.answerByB : todayQuestion.answerByA)
                        : "Waiting for answer..."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};


