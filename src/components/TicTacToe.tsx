import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, X, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

type Player = "heart" | "kiss" | null;
type Board = Player[];

export const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"heart" | "kiss">("heart");
  const [winner, setWinner] = useState<Player>(null);
  const [gameStats, setGameStats] = useState({ heart: 0, kiss: 0, draws: 0 });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (newBoard: Board): Player => {
    for (const [a, b, c] of winningCombinations) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }
    if (newBoard.every(cell => cell !== null)) {
      return null; // Will represent draw
    }
    return null;
  };

  const makeMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (newBoard.every(cell => cell !== null) && !gameWinner) {
        setGameStats(prev => ({ ...prev, draws: prev.draws + 1 }));
        toast("It's a draw! Love wins! 💕");
      } else {
        setGameStats(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }));
        toast(`${gameWinner === "heart" ? "Hearts" : "Kisses"} win! 🎉`);
      }
    } else {
      setCurrentPlayer(currentPlayer === "heart" ? "kiss" : "heart");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("heart");
    setWinner(null);
    toast("New game started! 🎮");
  };

  const renderCell = (index: number) => {
    const cellValue = board[index];
    return (
      <button
        onClick={() => makeMove(index)}
        className="aspect-square bg-card border-2 border-border rounded-lg flex items-center justify-center text-4xl hover:bg-accent transition-colors disabled:cursor-not-allowed"
        disabled={!!cellValue || !!winner}
      >
        {cellValue === "heart" && <Heart className="h-8 w-8 text-primary fill-current" />}
        {cellValue === "kiss" && <span className="text-pink-500">💋</span>}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="text-center bg-gradient-dreamy p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-foreground mb-2">Hearts vs Kisses</h3>
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{gameStats.heart}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Heart className="h-4 w-4" /> Hearts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{gameStats.draws}</div>
            <div className="text-sm text-muted-foreground">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-500">{gameStats.kiss}</div>
            <div className="text-sm text-muted-foreground">💋 Kisses</div>
          </div>
        </div>

        {!winner && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">Current turn:</span>
            {currentPlayer === "heart" ? (
              <Heart className="h-5 w-5 text-primary fill-current" />
            ) : (
              <span className="text-pink-500">💋</span>
            )}
          </div>
        )}

        {winner && winner !== ("draw" as any) && (
          <div className="flex items-center justify-center gap-2 text-primary">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">
              {winner === "heart" ? "Hearts" : "Kisses"} Win!
            </span>
          </div>
        )}

        {winner === ("draw" as any) && (
          <div className="text-primary font-semibold">
            💕 It's a Draw - Love Wins! 💕
          </div>
        )}
      </div>

      {/* Game Board */}
      <Card className="shadow-romantic">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
            {Array(9).fill(null).map((_, index) => (
              <div key={index}>
                {renderCell(index)}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={resetGame} variant="dreamy" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Instructions */}
      <Card className="bg-gradient-sunset shadow-gentle">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-3">How to Play</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Hearts (❤️) vs Kisses (💋)</li>
            <li>• Take turns placing your symbol</li>
            <li>• Get 3 in a row to win!</li>
            <li>• Horizontal, vertical, or diagonal counts</li>
            <li>• Have fun and may love always win! 💕</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};