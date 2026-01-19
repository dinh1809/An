import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Timer,
  Trophy,
  Play,
  Square,
  Circle,
  Triangle,
  Diamond,
  Zap,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGameSoundContext } from "@/hooks/useGameSound";

type GamePhase = "intro" | "countdown" | "playing";
type RuleType = "text" | "color" | "shape";
type ColorKey = "red" | "blue" | "yellow" | "green";
type ShapeKey = "circle" | "square" | "triangle" | "diamond";

interface StroopCard {
  textContent: ColorKey; // The word written
  fontColor: ColorKey;   // The color of the text
  shape: ShapeKey;       // Container shape
  isCongruent: boolean;  // Is text meaning = font color?
}

interface BinData {
  id: ColorKey;
  label: string;
  textVi: string;
  hex: string;
  bgClass: string;
}

interface TrialData {
  isCongruent: boolean;
  reactionTime: number;
  isCorrect: boolean;
  ruleAtTrial: RuleType;
  wasAfterSwitch: boolean;
}

const GAME_DURATION = 90; // seconds
const TIMEOUT_THRESHOLD = 3000; // 3 seconds = timeout

// Color definitions
const COLORS: Record<ColorKey, { hex: string; bgClass: string; textVi: string }> = {
  red: { hex: "#EF4444", bgClass: "bg-red-500", textVi: "ĐỎ" },
  blue: { hex: "#3B82F6", bgClass: "bg-blue-500", textVi: "XANH DƯƠNG" },
  yellow: { hex: "#EAB308", bgClass: "bg-yellow-500", textVi: "VÀNG" },
  green: { hex: "#22C55E", bgClass: "bg-green-500", textVi: "XANH LÁ" },
};

const SHAPES: Record<ShapeKey, { icon: typeof Circle; label: string }> = {
  circle: { icon: Circle, label: "Tròn" },
  square: { icon: Square, label: "Vuông" },
  triangle: { icon: Triangle, label: "Tam giác" },
  diamond: { icon: Diamond, label: "Kim cương" },
};

const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];
const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];

const RULE_LABELS: Record<RuleType, { vi: string; instruction: string }> = {
  text: { vi: "NGHĨA CHỮ", instruction: "Đọc nghĩa của từ" },
  color: { vi: "MÀU CHỮ", instruction: "Nhìn màu của chữ" },
  shape: { vi: "HÌNH DẠNG", instruction: "Phân loại theo hình" },
};

const RuleSwitcher = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSound, triggerHaptic, initAudio } = useGameSoundContext();

  // Game State
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);

  // Rule State
  const [currentRule, setCurrentRule] = useState<RuleType>("color");
  const [showRuleChange, setShowRuleChange] = useState(false);
  const [turnsUntilSwitch, setTurnsUntilSwitch] = useState(0);
  const [totalSwitches, setTotalSwitches] = useState(0);

  // Card State
  const [currentCard, setCurrentCard] = useState<StroopCard | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);

  // Stats tracking
  const roundStartTime = useRef<number>(0);
  const [trials, setTrials] = useState<TrialData[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [perseverativeErrors, setPerseverativeErrors] = useState(0);
  const justSwitched = useRef<boolean>(false);
  const previousRule = useRef<RuleType>("color");
  const isMounted = useRef(true);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const addTimeout = (fn: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      if (isMounted.current) fn();
    }, delay);
    timeoutsRef.current.push(timeout as unknown as number);
    return timeout;
  };

  const timeoutRef = useRef<number | null>(null);

  // Session Data
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate random switch interval (3-9)
  const getRandomSwitchInterval = useCallback(() => {
    return Math.floor(Math.random() * 7) + 3; // 3 to 9
  }, []);

  // Generate random card with Stroop conflict (70% incongruent)
  const generateCard = useCallback((): StroopCard => {
    const textContent = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const shape = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];

    // 70% chance of incongruent (Stroop conflict)
    const shouldBeCongruent = Math.random() > 0.7;

    let fontColor: ColorKey;
    if (shouldBeCongruent) {
      fontColor = textContent; // Same as text meaning
    } else {
      // Pick a different color
      const otherColors = COLOR_KEYS.filter(c => c !== textContent);
      fontColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    return {
      textContent,
      fontColor,
      shape,
      isCongruent: textContent === fontColor,
    };
  }, []);

  // Get correct answer based on current rule
  const getCorrectAnswer = useCallback((card: StroopCard, rule: RuleType): ColorKey | ShapeKey => {
    switch (rule) {
      case "text":
        return card.textContent; // The word meaning
      case "color":
        return card.fontColor; // The font color
      case "shape":
        return card.shape; // The shape
      default:
        return card.fontColor;
    }
  }, []);

  // Switch to a new random rule (different from current)
  const switchToNewRule = useCallback(() => {
    const availableRules: RuleType[] = ["text", "color", "shape"].filter(r => r !== currentRule) as RuleType[];
    const newRule = availableRules[Math.floor(Math.random() * availableRules.length)];

    previousRule.current = currentRule;
    setCurrentRule(newRule);
    setTotalSwitches(s => s + 1);
    justSwitched.current = true;

    // Flash white effect
    setFlashWhite(true);
    addTimeout(() => setFlashWhite(false), 200);

    // Show rule change notification
    setShowRuleChange(true);
    addTimeout(() => setShowRuleChange(false), 1500);

    // Set new random interval
    setTurnsUntilSwitch(getRandomSwitchInterval());
  }, [currentRule, getRandomSwitchInterval]);

  // Start new game session
  const startSession = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        game_type: "stroop_chaos",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      toast.error("Không thể bắt đầu phiên đánh giá");
      return null;
    }

    return data.id;
  };

  // Complete session with final scores
  const completeSession = async (sid: string) => {
    const totalTrials = trials.length;
    const congruentTrials = trials.filter(t => t.isCongruent);
    const incongruentTrials = trials.filter(t => !t.isCongruent);

    const accuracyCongruent = congruentTrials.length > 0
      ? (congruentTrials.filter(t => t.isCorrect).length / congruentTrials.length) * 100
      : 0;
    const accuracyIncongruent = incongruentTrials.length > 0
      ? (incongruentTrials.filter(t => t.isCorrect).length / incongruentTrials.length) * 100
      : 0;

    const avgTimeCongruent = congruentTrials.length > 0
      ? congruentTrials.reduce((a, b) => a + b.reactionTime, 0) / congruentTrials.length
      : 0;
    const avgTimeIncongruent = incongruentTrials.length > 0
      ? incongruentTrials.reduce((a, b) => a + b.reactionTime, 0) / incongruentTrials.length
      : 0;

    // Stroop interference score (higher = more difficulty with incongruent)
    const stroopInterference = Math.round(avgTimeIncongruent - avgTimeCongruent);

    // Calculate switch cost
    const switchTrials = trials.filter(t => t.wasAfterSwitch && t.isCorrect);
    const normalTrials = trials.filter(t => !t.wasAfterSwitch && t.isCorrect);
    const avgSwitchTime = switchTrials.length > 0
      ? switchTrials.reduce((a, b) => a + b.reactionTime, 0) / switchTrials.length
      : 0;
    const avgNormalTime = normalTrials.length > 0
      ? normalTrials.reduce((a, b) => a + b.reactionTime, 0) / normalTrials.length
      : 0;
    const switchCost = Math.round(avgSwitchTime - avgNormalTime);

    const overallAccuracy = totalTrials > 0 ? (correctCount / totalTrials) * 100 : 0;
    const avgReaction = trials.length > 0
      ? Math.round(trials.reduce((a, b) => a + b.reactionTime, 0) / trials.length)
      : 0;

    // Store metrics as JSON-compatible object
    const metrics = {
      total_trials: totalTrials,
      stroop_interference_score: stroopInterference,
      switch_cost_ms: switchCost,
      accuracy_congruent: Math.round(accuracyCongruent),
      accuracy_incongruent: Math.round(accuracyIncongruent),
      perseverative_errors: perseverativeErrors,
      total_switches: totalSwitches,
    };

    const { error } = await supabase
      .from("game_sessions")
      .update({
        completed_at: new Date().toISOString(),
        final_score: score,
        accuracy_percentage: Math.round(overallAccuracy),
        avg_reaction_time_ms: avgReaction,
        difficulty_level_reached: totalSwitches,
        metrics: metrics,
      })
      .eq("id", sid);

    if (error) {
      console.error("Failed to complete session:", error);
    }
  };

  // Start the game
  const handleStart = async () => {
    initAudio(); // Initialize sound context

    const newSessionId = await startSession();
    if (!newSessionId) return;

    setSessionId(newSessionId);
    setPhase("countdown");
    setCountdown(3);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCurrentRule("color");
    setCorrectCount(0);
    setWrongCount(0);
    setTurnsUntilSwitch(getRandomSwitchInterval());
    setTotalSwitches(0);
    setPerseverativeErrors(0);
    setTrials([]);
    justSwitched.current = false;
    previousRule.current = "color";
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase("playing");
      setCurrentCard(generateCard());
      roundStartTime.current = Date.now();
    }
  }, [phase, countdown, generateCard]);

  // Game timer
  useEffect(() => {
    if (phase !== "playing") return;

    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  // Timeout checker (3 second timeout per trial)
  useEffect(() => {
    if (phase !== "playing" || !currentCard) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, TIMEOUT_THRESHOLD);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentCard, phase]);

  // Handle timeout (too slow)
  const handleTimeout = () => {
    if (phase !== "playing" || !currentCard) return;

    setShowTimeout(true);
    setWrongCount(c => c + 1);

    // Record as wrong trial
    const newTrial: TrialData = {
      isCongruent: currentCard.isCongruent,
      reactionTime: TIMEOUT_THRESHOLD,
      isCorrect: false,
      ruleAtTrial: currentRule,
      wasAfterSwitch: justSwitched.current,
    };
    setTrials(t => [...t, newTrial]);

    addTimeout(() => {
      setShowTimeout(false);
      nextCard();
    }, 800);
  };

  // Move to next card
  const nextCard = () => {
    setCurrentCard(generateCard());
    roundStartTime.current = Date.now();
    justSwitched.current = false;
  };

  // Handle bin click
  const handleBinClick = (binId: string) => {
    if (phase !== "playing" || !currentCard) return;

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const reactionTime = Date.now() - roundStartTime.current;
    const correctAnswer = getCorrectAnswer(currentCard, currentRule);
    const isCorrect = binId === correctAnswer;

    // Record trial
    const newTrial: TrialData = {
      isCongruent: currentCard.isCongruent,
      reactionTime,
      isCorrect,
      ruleAtTrial: currentRule,
      wasAfterSwitch: justSwitched.current,
    };
    setTrials(t => [...t, newTrial]);

    if (isCorrect) {
      // Play success sound
      playSound("correct");

      setCorrectCount(c => c + 1);
      setScore(s => s + (currentCard.isCongruent ? 80 : 120)); // More points for incongruent
      setShowSuccess(true);

      // Decrease turns until switch
      const newTurns = turnsUntilSwitch - 1;
      if (newTurns <= 0) {
        // Time to switch! Play level up sound
        playSound("levelUp");
        addTimeout(() => {
          switchToNewRule();
        }, 200);
      } else {
        setTurnsUntilSwitch(newTurns);
      }

      // Next card
      addTimeout(() => {
        setShowSuccess(false);
        nextCard();
      }, 250);
    } else {
      // Wrong answer - play wrong sound and haptic
      playSound("wrong");
      triggerHaptic(200);

      setWrongCount(c => c + 1);
      setShakeScreen(true);

      // Check if perseverative error (using old rule after switch)
      if (justSwitched.current) {
        const oldCorrectAnswer = getCorrectAnswer(currentCard, previousRule.current);
        if (binId === oldCorrectAnswer) {
          setPerseverativeErrors(p => p + 1);
        }
      }

      addTimeout(() => {
        setShakeScreen(false);
      }, 500);
    }
  };

  // Finish the game
  const finishGame = async () => {
    if (!sessionId) return;

    await completeSession(sessionId);
    navigate(`/assessment/result?session=${sessionId}&game=stroop_chaos`);
  };

  // Render the Stroop card
  const renderStroopCard = () => {
    if (!currentCard) return null;

    const ShapeIcon = SHAPES[currentCard.shape].icon;
    const colorHex = COLORS[currentCard.fontColor].hex;
    const textContent = COLORS[currentCard.textContent].textVi;

    return (
      <motion.div
        key={`${currentCard.textContent}-${currentCard.fontColor}-${currentCard.shape}-${Date.now()}`}
        className="relative w-36 h-44 sm:w-44 sm:h-52 rounded-2xl bg-card border-2 border-border shadow-xl flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Shape container outline */}
        <ShapeIcon
          className="absolute w-full h-full opacity-10"
          strokeWidth={1}
        />

        {/* The text with conflicting color */}
        <span
          className="text-xl sm:text-2xl font-black tracking-tight text-center px-2"
          style={{ color: colorHex }}
        >
          {textContent}
        </span>

        {/* Shape indicator in corner */}
        <div className="absolute top-2 right-2">
          <ShapeIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </motion.div>
    );
  };

  // Render bins (always 4 colors)
  const renderBins = () => {
    const bins: BinData[] = COLOR_KEYS.map(color => ({
      id: color,
      label: COLORS[color].textVi,
      textVi: COLORS[color].textVi,
      hex: COLORS[color].hex,
      bgClass: COLORS[color].bgClass,
    }));

    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {bins.map((bin) => (
          <motion.button
            key={bin.id}
            onClick={() => handleBinClick(bin.id)}
            className={cn(
              "h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center gap-1 text-white font-bold transition-all",
              bin.bgClass,
              "hover:scale-105 active:scale-95 shadow-lg border-2 border-white/20"
            )}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xs sm:text-sm font-medium opacity-90">{bin.label}</span>
          </motion.button>
        ))}
      </div>
    );
  };

  // Shape bins for shape rule
  const renderShapeBins = () => {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {SHAPE_KEYS.map((shapeKey) => {
          const ShapeIcon = SHAPES[shapeKey].icon;
          return (
            <motion.button
              key={shapeKey}
              onClick={() => handleBinClick(shapeKey)}
              className={cn(
                "h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center gap-1 text-white font-bold transition-all",
                "bg-slate-600 hover:bg-slate-500",
                "hover:scale-105 active:scale-95 shadow-lg border-2 border-white/20"
              )}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShapeIcon className="w-8 h-8" strokeWidth={2} />
              <span className="text-xs opacity-80">{SHAPES[shapeKey].label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-200",
      flashWhite && "bg-white"
    )}>
      <div className="w-full max-w-lg">
        {/* Intro Screen */}
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-orange-200 dark:border-orange-800/50">
                <CardHeader className="text-center pb-2">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-gradient mx-auto mb-4 shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl">Stroop Chaos</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Thử thách kiểm soát xung động
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Visual Demo */}
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-lg font-black" style={{ color: COLORS.blue.hex }}>
                      ĐỎ
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Chữ viết "ĐỎ" nhưng màu xanh dương → Não phải chọn đúng!
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0 mt-0.5">1</div>
                      <span><strong>Luật MÀU:</strong> Chọn theo màu của chữ (không phải nghĩa)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0 mt-0.5">2</div>
                      <span><strong>Luật CHỮ:</strong> Chọn theo nghĩa của từ (bỏ qua màu)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0 mt-0.5">3</div>
                      <span><strong>Luật HÌNH:</strong> Chọn theo hình dạng xung quanh</span>
                    </div>
                    <div className="flex items-start gap-2 text-primary">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span><strong>Luật đổi ngẫu nhiên!</strong> Thích nghi nhanh để sống sót.</span>
                    </div>
                  </div>

                  {/* Stats preview */}
                  <div className="grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="font-bold text-xl text-primary">90s</div>
                      <div className="text-muted-foreground text-xs">Thời gian</div>
                    </div>
                    <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                      <div className="font-bold text-xl text-destructive">3s</div>
                      <div className="text-muted-foreground text-xs">Timeout / lượt</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full bg-brand-gradient hover:opacity-90 h-12 text-lg text-white"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Bắt đầu Chaos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Countdown Screen */}
          {phase === "countdown" && (
            <motion.div
              key="countdown"
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
            >
              <motion.div
                className="text-9xl font-bold bg-brand-gradient bg-clip-text text-transparent"
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {countdown}
              </motion.div>
              <p className="text-muted-foreground mt-4 text-lg">Chuẩn bị...</p>
            </motion.div>
          )}

          {/* Playing Screen */}
          {phase === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(shakeScreen && "animate-[shake_0.5s_ease-in-out]")}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-muted-foreground" />
                  <span className={cn(
                    "font-mono text-xl font-bold",
                    timeLeft <= 10 ? "text-red-500" : "text-foreground"
                  )}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-lg">{score}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress
                value={(timeLeft / GAME_DURATION) * 100}
                className="h-2 mb-4"
              />

              {/* Rule Indicator */}
              <motion.div
                className={cn(
                  "text-center mb-6 p-4 rounded-xl transition-all",
                  showRuleChange
                    ? "bg-brand-gradient text-white"
                    : "bg-muted"
                )}
                animate={showRuleChange ? { scale: [1, 1.05, 1] } : {}}
              >
                {showRuleChange ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Zap className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xl font-black">ĐỔI LUẬT!</p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Luật hiện tại</p>
                    <p className="text-xl font-black text-foreground">
                      {RULE_LABELS[currentRule].vi}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {RULE_LABELS[currentRule].instruction}
                    </p>
                  </>
                )}
              </motion.div>

              {/* Card Area */}
              <div className="flex justify-center mb-8 relative">
                {renderStroopCard()}

                {/* Success overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timeout overlay */}
                <AnimatePresence>
                  {showTimeout && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-center text-white">
                        <Timer className="w-10 h-10 mx-auto mb-2 text-red-400" />
                        <p className="font-bold text-lg">TIMEOUT!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bins - Color or Shape based on rule */}
              {currentRule === "shape" ? renderShapeBins() : renderBins()}

              {/* Stats at bottom */}
              <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="text-green-500 font-bold text-lg">{correctCount}</p>
                  <p className="text-xs">Đúng</p>
                </div>
                <div className="text-center">
                  <p className="text-red-500 font-bold text-lg">{wrongCount}</p>
                  <p className="text-xs">Sai</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-500 font-bold text-lg">{totalSwitches}</p>
                  <p className="text-xs">Đổi luật</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default RuleSwitcher;
