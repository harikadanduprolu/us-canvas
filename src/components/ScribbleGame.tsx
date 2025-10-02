import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Palette, Trash2, Gamepad2, Heart } from "lucide-react";
import { toast } from "sonner";

export const ScribbleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#e91e63");
  const [guess, setGuess] = useState("");
  const [currentWord, setCurrentWord] = useState("❤️ LOVE");
  const [score, setScore] = useState(0);

  const colors = [
    "#e91e63", // pink
    "#f06292", // light pink
    "#ff9800", // orange
    "#ffb74d", // light orange
    "#9c27b0", // purple
    "#ba68c8", // light purple
    "#2196f3", // blue
    "#4caf50", // green
  ];

  const words = ["LOVE", "KISS", "HUG", "HEART", "ROMANCE", "TOGETHER", "FOREVER", "HAPPY"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;
    
    // Set initial styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentColor;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast("Canvas cleared! Start drawing again.");
  };

  const changeColor = (color: string) => {
    setCurrentColor(color);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = color;
  };

  const submitGuess = () => {
    if (guess.toLowerCase() === currentWord.replace("❤️ ", "").toLowerCase()) {
      setScore(score + 1);
      toast("Correct! You guessed it! 💕");
      setGuess("");
      // Get new word
      const newWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(`❤️ ${newWord}`);
      clearCanvas();
    } else {
      toast("Not quite right, keep trying! 💪");
    }
  };

  const newGame = () => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(`❤️ ${newWord}`);
    setGuess("");
    setScore(0);
    clearCanvas();
    toast("New game started! Start drawing!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-dreamy p-4 rounded-lg">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold text-foreground">Draw This Word:</h3>
          <p className="text-2xl font-bold text-primary">{currentWord}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Drawing Canvas */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Drawing Board
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Palette */}
            <div className="flex gap-2 justify-center">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => changeColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    currentColor === color ? "border-primary scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-border rounded-lg cursor-crosshair shadow-gentle"
                style={{ touchAction: "none" }}
              />
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={clearCanvas} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button onClick={newGame} variant="dreamy" size="sm">
                <Gamepad2 className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guessing Section */}
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Make Your Guess
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="What are they drawing?"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitGuess()}
                className="text-center"
              />
              <Button onClick={submitGuess} className="w-full" variant="romantic">
                Submit Guess
              </Button>
            </div>

            <div className="bg-gradient-sunset p-4 rounded-lg text-center">
              <h4 className="font-semibold text-foreground mb-2">Game Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Draw clearly and simply</li>
                <li>• Use different colors</li>
                <li>• Think like your partner!</li>
                <li>• Have fun together! 💕</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};