import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Zap, Heart, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Question {
  type: "truth" | "dare";
  text: string;
  level: "easy" | "medium" | "spicy";
}

const questions: Question[] = [
  { type: "truth", text: "What's your biggest fear about our relationship?", level: "medium" },
  { type: "truth", text: "What's the most romantic thing I've ever done for you?", level: "easy" },
  { type: "truth", text: "If you could change one thing about me, what would it be?", level: "spicy" },
  { type: "dare", text: "Give me a 30-second shoulder massage", level: "easy" },
  { type: "dare", text: "Tell me your favorite thing about me in a funny voice", level: "easy" },
  { type: "dare", text: "Write 'I love you' on my back with your finger and let me guess", level: "medium" },
  { type: "truth", text: "What's one secret you've never told me?", level: "medium" },
  { type: "dare", text: "Do your best impression of me", level: "medium" },
  { type: "truth", text: "What's your favorite memory of us together?", level: "easy" },
  { type: "dare", text: "Sing our favorite song together", level: "medium" },
];

const levelColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  spicy: "bg-red-100 text-red-800 border-red-200",
};

export const TruthOrDare = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedType, setSelectedType] = useState<"truth" | "dare" | null>(null);
  const [score, setScore] = useState({ truth: 0, dare: 0 });

  const getRandomQuestion = (type: "truth" | "dare") => {
    const filteredQuestions = questions.filter(q => q.type === type);
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const question = filteredQuestions[randomIndex];
    setCurrentQuestion(question);
    setSelectedType(type);
    toast(`${type === "truth" ? "Truth" : "Dare"} selected! 💕`);
  };

  const completeQuestion = () => {
    if (!currentQuestion || !selectedType) return;
    
    setScore(prev => ({
      ...prev,
      [selectedType]: prev[selectedType] + 1
    }));
    
    setCurrentQuestion(null);
    setSelectedType(null);
    toast("Great job! Ready for another? 🌟");
  };

  const skipQuestion = () => {
    setCurrentQuestion(null);
    setSelectedType(null);
    toast("No worries! Try another one 😊");
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="text-center bg-gradient-dreamy p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-foreground mb-2">Truth or Dare</h3>
        <p className="text-muted-foreground mb-4">
          Get to know each other better with fun questions and playful challenges!
        </p>
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{score.truth}</div>
            <div className="text-sm text-muted-foreground">Truths</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{score.dare}</div>
            <div className="text-sm text-muted-foreground">Dares</div>
          </div>
        </div>
      </div>

      {/* Question Selection */}
      {!currentQuestion && (
        <Card className="shadow-gentle">
          <CardHeader className="text-center">
            <CardTitle>Choose Your Adventure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => getRandomQuestion("truth")}
                variant="romantic"
                size="lg"
                className="h-20 text-lg"
              >
                <MessageSquare className="mr-2 h-6 w-6" />
                Truth
              </Button>
              <Button
                onClick={() => getRandomQuestion("dare")}
                variant="dreamy"
                size="lg"
                className="h-20 text-lg"
              >
                <Zap className="mr-2 h-6 w-6" />
                Dare
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <Card className="shadow-romantic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedType === "truth" ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                {selectedType?.toUpperCase()}
              </CardTitle>
              <Badge className={levelColors[currentQuestion.level]}>
                {currentQuestion.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-sunset p-6 rounded-lg text-center">
              <p className="text-lg font-medium text-foreground">
                {currentQuestion.text}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={completeQuestion} variant="romantic">
                <Heart className="mr-2 h-4 w-4" />
                Completed!
              </Button>
              <Button onClick={skipQuestion} variant="outline">
                Skip This One
              </Button>
              <Button onClick={() => getRandomQuestion(selectedType!)} variant="ghost">
                <RefreshCw className="mr-2 h-4 w-4" />
                New {selectedType}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Tips */}
      <Card className="bg-gradient-love text-white shadow-gentle">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Game Tips
          </h4>
          <ul className="space-y-1 text-sm opacity-90">
            <li>• Be honest and open with truths</li>
            <li>• Have fun with dares - they're meant to be playful!</li>
            <li>• Respect each other's boundaries</li>
            <li>• Create your own questions as you play</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};