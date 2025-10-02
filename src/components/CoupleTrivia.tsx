import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: "preferences" | "memories" | "dreams" | "personality";
}

const triviaQuestions: Question[] = [
  {
    id: 1,
    question: "What's my favorite way to spend a weekend?",
    options: ["Outdoor adventure", "Cozy home day", "Social gathering", "Cultural activities"],
    correct: 1,
    category: "preferences"
  },
  {
    id: 2,
    question: "What was I wearing when we first met?",
    options: ["Red dress", "Blue jeans and t-shirt", "Black jacket", "I don't remember"],
    correct: 1,
    category: "memories"
  },
  {
    id: 3,
    question: "What's my biggest dream for our future?",
    options: ["Travel the world", "Start a family", "Buy a house", "All of the above"],
    correct: 3,
    category: "dreams"
  },
  {
    id: 4,
    question: "How do I prefer to resolve conflicts?",
    options: ["Talk it out immediately", "Take time to think first", "Write a letter", "Use humor"],
    correct: 0,
    category: "personality"
  },
  {
    id: 5,
    question: "What's my love language?",
    options: ["Physical touch", "Words of affirmation", "Quality time", "Acts of service"],
    correct: 2,
    category: "personality"
  },
];

const categoryColors = {
  preferences: "bg-blue-100 text-blue-800 border-blue-200",
  memories: "bg-pink-100 text-pink-800 border-pink-200",
  dreams: "bg-purple-100 text-purple-800 border-purple-200",
  personality: "bg-green-100 text-green-800 border-green-200",
};

export const CoupleTrivia = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentQuestion = triviaQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / triviaQuestions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;
    setShowResult(true);
    setAnswers(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setScore(score + 1);
      toast("Correct! You know your partner well! 💕");
    } else {
      toast("Not quite right, but keep learning about each other! 😊");
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < triviaQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameCompleted(false);
    setAnswers([]);
    toast("New trivia game started! 🧠");
  };

  const getScoreMessage = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage >= 80) return "Amazing! You two are perfectly in sync! 💕";
    if (percentage >= 60) return "Great job! You know each other well! 😊";
    if (percentage >= 40) return "Not bad! Keep learning about each other! 🌟";
    return "Time to spend more quality time together! 💖";
  };

  if (gameCompleted) {
    return (
      <div className="space-y-6">
        <Card className="shadow-romantic text-center">
          <CardHeader>
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">Trivia Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-primary">
              {score}/{triviaQuestions.length}
            </div>
            <p className="text-xl text-muted-foreground">
              {getScoreMessage()}
            </p>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{triviaQuestions.length - score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>

            <Button onClick={resetGame} variant="romantic" size="lg" className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="shadow-gentle">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">Question {currentQuestionIndex + 1} of {triviaQuestions.length}</span>
            </div>
            <Badge className={categoryColors[currentQuestion.category]}>
              {currentQuestion.category}
            </Badge>
          </div>
          <Progress value={progress} className="mb-3" />
          <div className="text-center">
            <span className="text-lg font-bold text-primary">Score: {score}</span>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-romantic">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full text-left h-auto p-4 justify-start";
              let variant: any = "outline";

              if (showResult) {
                if (index === currentQuestion.correct) {
                  buttonClass += " border-green-500 bg-green-50 text-green-800";
                } else if (index === selectedAnswer) {
                  buttonClass += " border-red-500 bg-red-50 text-red-800";
                }
              } else if (selectedAnswer === index) {
                variant = "secondary";
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  variant={variant}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option}</span>
                    {showResult && index === currentQuestion.correct && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult && index === selectedAnswer && index !== currentQuestion.correct && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="text-center pt-4">
            {!showResult ? (
              <Button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                variant="romantic"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion} variant="dreamy" size="lg">
                {currentQuestionIndex < triviaQuestions.length - 1 ? "Next Question" : "Finish Game"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-love text-white shadow-gentle">
        <CardContent className="pt-4">
          <h4 className="font-semibold mb-2">💡 Trivia Tip</h4>
          <p className="text-sm opacity-90">
            Don't worry about getting everything right! This is about learning and having fun together. 
            Use wrong answers as conversation starters! 💕
          </p>
        </CardContent>
      </Card>
    </div>
  );
};