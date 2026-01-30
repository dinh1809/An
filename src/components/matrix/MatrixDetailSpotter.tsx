import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy } from "lucide-react";
import {
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Diamond,
  Hexagon,
  Octagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

interface MatrixDetailSpotterProps {
  difficulty: Difficulty;
  durationSeconds: number;
  onComplete: (result: { score: number; accuracy: number; completed: boolean }) => void;
}

interface GridItem {
  id: number;
  icon: typeof Square;
  color: string;
  rotation: number;
  isOdd: boolean;
}

const ICONS = [Square, Circle, Triangle, Star, Heart, Diamond, Hexagon, Octagon];
const COLORS = {
  primary: ["#8B5CF6", "#7C3AED", "#6D28D9"],
  contrast: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
};

// Grid size based on difficulty
const GRID_SIZES: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

export function MatrixDetailSpotter({ difficulty, durationSeconds, onComplete }: MatrixDetailSpotterProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [score, setScore] = useState(0);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeGrid, setShakeGrid] = useState(false);
  const [level, setLevel] = useState(1);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const roundStartTime = useRef<number>(0);

  const gridSize = GRID_SIZES[difficulty];

  // Generate grid
  const generateGrid = useCallback(() => {
    const size = gridSize + Math.floor(level / 3); // Grow slightly with level
    const actualSize = Math.min(size, 5);
    const totalCells = actualSize * actualSize;

    const baseIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const baseColor = COLORS.primary[Math.floor(Math.random() * COLORS.primary.length)];
    const baseRotation = 0;

    const oddIndex = Math.floor(Math.random() * totalCells);

    const items: GridItem[] = Array.from({ length: totalCells }, (_, i) => {
      const isOdd = i === oddIndex;

      let icon = baseIcon;
      let color = baseColor;
      let rotation = baseRotation;

      if (isOdd) {
        // For matrix mode, differences are based on difficulty
        if (difficulty === "easy") {
          // Easy: Different color only
          color = COLORS.contrast[Math.floor(Math.random() * COLORS.contrast.length)];
        } else if (difficulty === "medium") {
          // Medium: Different shape
          const otherIcons = ICONS.filter(ic => ic !== baseIcon);
          icon = otherIcons[Math.floor(Math.random() * otherIcons.length)];
        } else {
          // Hard: Subtle rotation difference
          rotation = 15 + Math.random() * 30;
        }
      }

      return { id: i, icon, color, rotation, isOdd };
    });

    setGridItems(items);
    roundStartTime.current = Date.now();
  }, [gridSize, level, difficulty]);

  // Initial grid
  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      const totalAttempts = correctCount + wrongCount;
      const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
      onComplete({ score, accuracy, completed: true });
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, correctCount, wrongCount, onComplete]);

  // Handle click
  const handleCellClick = (index: number) => {
    if (clickedIndex !== null) return;

    const clickedItem = gridItems[index];
    const correct = clickedItem.isOdd;

    setClickedIndex(index);

    if (correct) {
      setCorrectCount(c => c + 1);
      setScore(s => s + 100);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setClickedIndex(null);
        setLevel(l => l + 1);
        generateGrid();
      }, 300);
    } else {
      setWrongCount(c => c + 1);
      setShakeGrid(true);

      setTimeout(() => {
        setShakeGrid(false);
        setClickedIndex(null);
      }, 400);
    }
  };

  const currentGridSize = Math.min(gridSize + Math.floor(level / 3), 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <span className={cn("font-mono font-bold", timeLeft <= 5 && "text-destructive")}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(timeLeft / durationSeconds) * 100} className="h-2" />

      {/* Grid */}
      <motion.div
        className={cn(
          "grid gap-2 p-4 rounded-2xl bg-card border shadow-lg",
          shakeGrid && "animate-shake"
        )}
        style={{
          gridTemplateColumns: `repeat(${currentGridSize}, 1fr)`,
        }}
        animate={shakeGrid ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {gridItems.map((item, index) => {
          const IconComponent = item.icon;
          const isClicked = clickedIndex === index;
          const showCorrect = isClicked && item.isOdd;
          const showWrong = isClicked && !item.isOdd;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleCellClick(index)}
              disabled={clickedIndex !== null}
              className={cn(
                "aspect-square rounded-xl transition-colors duration-200 border-2",
                "flex items-center justify-center bg-muted/50 hover:bg-muted",
                "border-border hover:border-primary/50",
                showCorrect && "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
                showWrong && "border-red-500 bg-red-100 dark:bg-red-900/30"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <motion.div style={{ rotate: item.rotation }}>
                <IconComponent
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  style={{ color: item.color }}
                  strokeWidth={2.5}
                />
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Level indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Cấp độ {level}
      </div>
    </div>
  );
}
