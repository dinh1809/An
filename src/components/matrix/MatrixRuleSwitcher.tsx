import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, AlertTriangle } from "lucide-react";
import { Square, Circle, Triangle, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
type RuleType = "text" | "color";
type ColorKey = "red" | "blue" | "yellow" | "green";

interface MatrixRuleSwitcherProps {
  difficulty: Difficulty;
  durationSeconds: number;
  onComplete: (result: { score: number; accuracy: number; completed: boolean }) => void;
}

interface StroopCard {
  textContent: ColorKey;
  fontColor: ColorKey;
  isCongruent: boolean;
}

const COLORS: Record<ColorKey, { hex: string; bgClass: string; textVi: string }> = {
  red: { hex: "#EF4444", bgClass: "bg-red-500", textVi: "ĐỎ" },
  blue: { hex: "#3B82F6", bgClass: "bg-blue-500", textVi: "XANH" },
  yellow: { hex: "#EAB308", bgClass: "bg-yellow-500", textVi: "VÀNG" },
  green: { hex: "#22C55E", bgClass: "bg-green-500", textVi: "XANH LÁ" },
};

const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

const RULE_LABELS: Record<RuleType, { vi: string }> = {
  text: { vi: "NGHĨA CHỮ" },
  color: { vi: "MÀU CHỮ" },
};

// Congruent probability based on difficulty
const CONGRUENT_PROB: Record<Difficulty, number> = {
  easy: 0.7,    // 70% congruent
  medium: 0.5,  // 50% congruent
  hard: 0.3,    // 30% congruent
};

export function MatrixRuleSwitcher({ difficulty, durationSeconds, onComplete }: MatrixRuleSwitcherProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [score, setScore] = useState(0);
  const [currentRule, setCurrentRule] = useState<RuleType>("color");
  const [currentCard, setCurrentCard] = useState<StroopCard | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showRuleChange, setShowRuleChange] = useState(false);
  const [turnsUntilSwitch, setTurnsUntilSwitch] = useState(3);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const roundStartTime = useRef<number>(0);

  // Generate card
  const generateCard = useCallback((): StroopCard => {
    const congruentProb = CONGRUENT_PROB[difficulty];
    const isCongruent = Math.random() < congruentProb;

    const textContent = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    let fontColor = textContent;

    if (!isCongruent) {
      const otherColors = COLOR_KEYS.filter(c => c !== textContent);
      fontColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    return { textContent, fontColor, isCongruent };
  }, [difficulty]);

  // Get correct answer
  const getCorrectAnswer = (card: StroopCard, rule: RuleType): ColorKey => {
    return rule === "text" ? card.textContent : card.fontColor;
  };

  // Switch rule
  const switchRule = useCallback(() => {
    setShowRuleChange(true);
    setCurrentRule(r => r === "color" ? "text" : "color");

    setTimeout(() => {
      setShowRuleChange(false);
      setTurnsUntilSwitch(difficulty === "hard" ? 2 : difficulty === "medium" ? 3 : 4);
    }, 800);
  }, [difficulty]);

  // Initial card
  useEffect(() => {
    setCurrentCard(generateCard());
    roundStartTime.current = Date.now();
  }, [generateCard]);

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

  // Handle bin click
  const handleBinClick = (binId: ColorKey) => {
    if (!currentCard) return;

    const correctAnswer = getCorrectAnswer(currentCard, currentRule);
    const isCorrect = binId === correctAnswer;

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setScore(s => s + (currentCard.isCongruent ? 80 : 120));
      setShowSuccess(true);

      const newTurns = turnsUntilSwitch - 1;
      if (newTurns <= 0) {
        setTimeout(() => switchRule(), 200);
      } else {
        setTurnsUntilSwitch(newTurns);
      }

      setTimeout(() => {
        setShowSuccess(false);
        setCurrentCard(generateCard());
        roundStartTime.current = Date.now();
      }, 250);
    } else {
      setWrongCount(c => c + 1);
      setShakeScreen(true);

      setTimeout(() => {
        setShakeScreen(false);
      }, 400);
    }
  };

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

      {/* Rule indicator */}
      <motion.div
        className={cn(
          "text-center p-2 rounded-lg font-bold text-sm",
          currentRule === "color" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
        )}
        animate={showRuleChange ? { scale: [1, 1.1, 1] } : {}}
      >
        Quy tắc: {RULE_LABELS[currentRule].vi}
      </motion.div>

      {/* Card */}
      <motion.div
        className={cn(
          "min-h-32 flex items-center justify-center p-6 rounded-2xl bg-card border shadow-lg"
        )}
        animate={shakeScreen ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {currentCard && (
          <motion.span
            key={`${currentCard.textContent}-${currentCard.fontColor}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-black"
            style={{ color: COLORS[currentCard.fontColor].hex }}
          >
            {COLORS[currentCard.textContent].textVi}
          </motion.span>
        )}
      </motion.div>

      {/* Color bins */}
      <div className="grid grid-cols-4 gap-2">
        {COLOR_KEYS.map((colorKey) => (
          <motion.button
            key={colorKey}
            onClick={() => handleBinClick(colorKey)}
            className={cn(
              "h-14 rounded-xl font-bold text-white text-xs shadow-lg",
              COLORS[colorKey].bgClass
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {COLORS[colorKey].textVi}
          </motion.button>
        ))}
      </div>

      {/* Success flash */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-emerald-500/20 pointer-events-none rounded-2xl"
        />
      )}
    </div>
  );
}
