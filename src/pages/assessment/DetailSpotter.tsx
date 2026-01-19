import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Timer,
  Trophy,
  Play,
  Sparkles,
  // Level 1-3: Oriented Search icons (Landolt C / Arrow logic)
  ChevronRight,
  ArrowUp,
  CornerDownRight,
  // Level 4-7: Mirror Logic icons (Asymmetrical)
  Hand,
  Footprints,
  ThumbsUp,
  MousePointerClick,
  // Level 8+: Conjunction Search shapes
  Square,
  Circle,
  Triangle,
  Hexagon,
  type LucideIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGameSoundContext } from "@/hooks/useGameSound";

interface TelemetryData {
  target_position_index: number;
  click_position_index: number;
  is_correct: boolean;
  reaction_time_ms: number;
}

interface GridItem {
  id: number;
  icon: LucideIcon;
  color: string;
  rotation: number;
  scaleX: number; // For mirror logic
  isOdd: boolean;
  offsetX?: number; // Jitter
  offsetY?: number;
}

type GamePhase = "intro" | "countdown" | "playing";
type DifficultyTier = "oriented" | "mirror" | "conjunction";

const GAME_DURATION = 60; // seconds

// Level 1-3: Oriented Search icons (clear directionality)
const ORIENTED_ICONS: LucideIcon[] = [ChevronRight, ArrowUp, CornerDownRight];

// Level 4-7: Mirror Logic icons (asymmetrical - can be flipped)
const MIRROR_ICONS: LucideIcon[] = [Hand, Footprints, ThumbsUp, MousePointerClick];

// Level 8+: Conjunction Search (shape + color combinations)
const CONJUNCTION_SHAPES: LucideIcon[] = [Square, Circle, Triangle, Hexagon];
const CONJUNCTION_COLORS = {
  distractorCombos: [
    { shape: Square, color: "#EF4444" },    // Red Square
    { shape: Circle, color: "#3B82F6" },    // Blue Circle
    { shape: Triangle, color: "#10B981" },  // Green Triangle
  ],
  target: { shape: Circle, color: "#EF4444" }, // Red Circle (unique combination)
};

const BASE_COLORS = {
  primary: "#8B5CF6", // Violet
  secondary: "#6366F1", // Indigo
};

const DetailSpotter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSound, triggerHaptic, initAudio } = useGameSoundContext();

  // Game State
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Round State
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [gridSize, setGridSize] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeGrid, setShakeGrid] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  // Stats
  const roundStartTime = useRef<number>(0);
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

  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Session Data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [telemetryBuffer, setTelemetryBuffer] = useState<TelemetryData[]>([]);

  // Determine difficulty tier based on level
  const getDifficultyTier = (lvl: number): DifficultyTier => {
    if (lvl <= 3) return "oriented";
    if (lvl <= 7) return "mirror";
    return "conjunction";
  };

  // Calculate grid size based on level (3x3 -> 6x6 -> 8x8)
  const getGridSize = (lvl: number): number => {
    if (lvl <= 2) return 3;
    if (lvl <= 4) return 4;
    if (lvl <= 6) return 5;
    if (lvl <= 8) return 6;
    if (lvl <= 10) return 7;
    return 8; // Max 8x8
  };

  // Get rotation options based on sub-level
  const getRotationOptions = (lvl: number): { base: number; target: number } => {
    // Level 1: Very obvious (0° vs 90°)
    if (lvl === 1) return { base: 0, target: 90 };
    // Level 2: Moderate (0° vs 45°)
    if (lvl === 2) return { base: 0, target: 45 };
    // Level 3: Subtle (0° vs 15°)
    return { base: 0, target: 15 };
  };

  // Add slight jitter for realism (optional)
  const getJitter = (lvl: number): { x: number; y: number } => {
    if (lvl < 5) return { x: 0, y: 0 };
    const maxJitter = Math.min(3, lvl - 4);
    return {
      x: (Math.random() - 0.5) * maxJitter * 2,
      y: (Math.random() - 0.5) * maxJitter * 2,
    };
  };

  // Generate grid items for current level
  const generateGrid = useCallback((lvl: number) => {
    const size = getGridSize(lvl);
    const totalItems = size * size;
    const tier = getDifficultyTier(lvl);
    const oddIndex = Math.floor(Math.random() * totalItems);

    let items: GridItem[];

    switch (tier) {
      case "oriented": {
        // Level 1-3: Oriented Search (Landolt C Logic)
        // Distractors: All same rotation, Target: Different rotation
        const icon = ORIENTED_ICONS[Math.floor(Math.random() * ORIENTED_ICONS.length)];
        const { base, target } = getRotationOptions(lvl);

        items = Array.from({ length: totalItems }, (_, i) => {
          const jitter = getJitter(lvl);
          return {
            id: i,
            icon,
            color: BASE_COLORS.primary,
            rotation: i === oddIndex ? target : base,
            scaleX: 1,
            isOdd: i === oddIndex,
            offsetX: jitter.x,
            offsetY: jitter.y,
          };
        });
        break;
      }

      case "mirror": {
        // Level 4-7: Mirror Logic (QC Check)
        // Distractors: Normal orientation, Target: Mirrored (scaleX: -1)
        const icon = MIRROR_ICONS[Math.floor(Math.random() * MIRROR_ICONS.length)];

        items = Array.from({ length: totalItems }, (_, i) => {
          const jitter = getJitter(lvl);
          return {
            id: i,
            icon,
            color: BASE_COLORS.primary,
            rotation: 0,
            scaleX: i === oddIndex ? -1 : 1, // Mirror the target
            isOdd: i === oddIndex,
            offsetX: jitter.x,
            offsetY: jitter.y,
          };
        });
        break;
      }

      case "conjunction": {
        // Level 8+: Conjunction Search (Brain Burner)
        // Distractors: Mix of "Red Squares" and "Blue Circles"
        // Target: "Red Circle" (unique combination)
        const distractors = CONJUNCTION_COLORS.distractorCombos;
        const target = CONJUNCTION_COLORS.target;

        items = Array.from({ length: totalItems }, (_, i) => {
          const jitter = getJitter(lvl);

          if (i === oddIndex) {
            // Target: unique combination (Red Circle)
            return {
              id: i,
              icon: target.shape,
              color: target.color,
              rotation: 0,
              scaleX: 1,
              isOdd: true,
              offsetX: jitter.x,
              offsetY: jitter.y,
            };
          } else {
            // Distractor: random from distractor combos
            const distractor = distractors[Math.floor(Math.random() * distractors.length)];
            return {
              id: i,
              icon: distractor.shape,
              color: distractor.color,
              rotation: 0,
              scaleX: 1,
              isOdd: false,
              offsetX: jitter.x,
              offsetY: jitter.y,
            };
          }
        });
        break;
      }
    }

    setGridSize(size);
    setGridItems(items);
    roundStartTime.current = Date.now();
  }, []);

  // Calculate score with bonus for harder levels
  const calculateScore = (lvl: number, reactionTimeMs: number): number => {
    const tier = getDifficultyTier(lvl);
    let baseScore = 100;

    // Tier bonus
    if (tier === "mirror") baseScore = 150;
    if (tier === "conjunction") baseScore = 200;

    // Speed bonus (faster = more points)
    const speedBonus = Math.max(0, Math.floor((2000 - reactionTimeMs) / 100) * 5);

    return baseScore + speedBonus;
  };

  // Start new game session
  const startSession = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        game_type: "detail_spotter",
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

  // Save telemetry data
  const saveTelemetry = async (sid: string, telemetry: TelemetryData[]) => {
    if (telemetry.length === 0) return;

    const records = telemetry.map(t => ({
      session_id: sid,
      ...t
    }));

    const { error } = await supabase
      .from("assessment_telemetry")
      .insert(records);

    if (error) {
      console.error("Failed to save telemetry:", error);
    }
  };

  // Complete session with final scores
  const completeSession = async (
    sid: string,
    finalScore: number,
    accuracy: number,
    avgReaction: number,
    maxLevel: number
  ) => {
    const { error } = await supabase
      .from("game_sessions")
      .update({
        completed_at: new Date().toISOString(),
        final_score: finalScore,
        accuracy_percentage: accuracy,
        avg_reaction_time_ms: avgReaction,
        difficulty_level_reached: maxLevel,
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
    setLevel(1);
    setCorrectCount(0);
    setWrongCount(0);
    setReactionTimes([]);
    setTelemetryBuffer([]);
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      addTimeout(() => setCountdown(c => c - 1), 1000);
    } else {
      setPhase("playing");
      generateGrid(1);
    }
  }, [phase, countdown, generateGrid]);

  // Game timer
  useEffect(() => {
    if (phase !== "playing") return;

    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    addTimeout(() => setTimeLeft(t => t - 1), 1000);
  }, [phase, timeLeft]);

  // Handle grid cell click
  const handleCellClick = (index: number) => {
    if (phase !== "playing" || clickedIndex !== null) return;

    const reactionTime = Date.now() - roundStartTime.current;
    const clickedItem = gridItems[index];
    const oddItem = gridItems.find(item => item.isOdd);
    const correct = clickedItem.isOdd;

    setClickedIndex(index);

    // Buffer telemetry
    setTelemetryBuffer(buf => [...buf, {
      target_position_index: oddItem?.id ?? 0,
      click_position_index: index,
      is_correct: correct,
      reaction_time_ms: reactionTime,
    }]);

    setReactionTimes(rt => [...rt, reactionTime]);

    if (correct) {
      // Play success sound
      playSound("correct");

      const pointsEarned = calculateScore(level, reactionTime);
      setCorrectCount(c => c + 1);
      setScore(s => s + pointsEarned);
      setTimeLeft(t => Math.min(t + 1, GAME_DURATION)); // +1 sec bonus
      setShowSuccess(true);

      // Check for level up sound
      if ((level + 1) % 3 === 0) {
        addTimeout(() => playSound("levelUp"), 200);
      }

      // Next level
      addTimeout(() => {
        setShowSuccess(false);
        setClickedIndex(null);
        setLevel(l => l + 1);
        generateGrid(level + 1);
      }, 400);
    } else {
      // Play wrong sound and haptic
      playSound("wrong");
      triggerHaptic(200);

      setWrongCount(c => c + 1);
      setShakeGrid(true);

      // Reset after shake
      addTimeout(() => {
        setShakeGrid(false);
        setClickedIndex(null);
      }, 500);
    }
  };

  // Finish the game
  const finishGame = async () => {
    if (!sessionId) return;

    const totalAttempts = correctCount + wrongCount;
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
    const avgReaction = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    await saveTelemetry(sessionId, telemetryBuffer);
    await completeSession(sessionId, score, accuracy, avgReaction, level);

    // Redirect to result page with session ID
    navigate(`/assessment/result?session=${sessionId}`);
  };

  // Get tier display info
  const getTierDisplayInfo = (lvl: number) => {
    const tier = getDifficultyTier(lvl);
    switch (tier) {
      case "oriented":
        return { label: "Tìm góc xoay khác biệt", emoji: "🎯", color: "text-violet-500" };
      case "mirror":
        return { label: "Tìm hình bị lật ngược", emoji: "🪞", color: "text-indigo-500" };
      case "conjunction":
        return { label: "Tìm tổ hợp duy nhất (đỏ + tròn)", emoji: "🧠", color: "text-purple-500" };
    }
  };

  // Render grid cell
  const renderCell = (item: GridItem, index: number) => {
    const IconComponent = item.icon;
    const isClicked = clickedIndex === index;
    const showCorrectFeedback = isClicked && item.isOdd;
    const showWrongFeedback = isClicked && !item.isOdd;

    // Calculate icon size based on grid size
    const iconSizeClass = gridSize <= 4
      ? "w-8 h-8 sm:w-10 sm:h-10"
      : gridSize <= 6
        ? "w-6 h-6 sm:w-8 sm:h-8"
        : "w-5 h-5 sm:w-6 sm:h-6";

    return (
      <motion.button
        key={item.id}
        onClick={() => handleCellClick(index)}
        disabled={clickedIndex !== null}
        className={cn(
          "aspect-square rounded-xl transition-colors duration-200 border-2",
          "flex items-center justify-center bg-card hover:bg-muted/50",
          "border-border hover:border-primary/50",
          showCorrectFeedback && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
          showWrongFeedback && "border-red-500 bg-red-50 dark:bg-red-950/30"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02 }}
        style={{
          transform: `translate(${item.offsetX || 0}px, ${item.offsetY || 0}px)`,
        }}
      >
        <motion.div
          style={{
            rotate: item.rotation,
            scaleX: item.scaleX,
          }}
          animate={showCorrectFeedback ? { scale: [1, 1.2, 1] } : {}}
        >
          <IconComponent
            className={iconSizeClass}
            style={{ color: item.color }}
            strokeWidth={2.5}
          />
        </motion.div>

        {/* Success particles */}
        <AnimatePresence>
          {showCorrectFeedback && showSuccess && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-emerald-400"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(i * 60 * Math.PI / 180) * 40,
                    y: Math.sin(i * 60 * Math.PI / 180) * 40,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  const tierInfo = getTierDisplayInfo(level);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
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
              <Card className="border-violet-200 dark:border-violet-800/50">
                <CardHeader className="text-center pb-2">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 mx-auto mb-4 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Eye className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl">Thợ Săn Chi Tiết</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Tìm vật thể khác biệt nhanh nhất có thể
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* 3-Tier Difficulty Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <p className="font-medium text-sm">Cấp 1-3: Tìm góc xoay</p>
                        <p className="text-xs text-muted-foreground">Một icon xoay khác góc</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                      <div className="text-2xl">🪞</div>
                      <div>
                        <p className="font-medium text-sm">Cấp 4-7: Tìm hình lật ngược</p>
                        <p className="text-xs text-muted-foreground">Một icon bị lật gương</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <div className="text-2xl">🧠</div>
                      <div>
                        <p className="font-medium text-sm">Cấp 8+: Tìm tổ hợp duy nhất</p>
                        <p className="text-xs text-muted-foreground">Vòng tròn đỏ giữa vuông đỏ & tròn xanh</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats preview */}
                  <div className="grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                      <div className="font-bold text-xl text-violet-600">60s</div>
                      <div className="text-muted-foreground text-xs">Thời gian</div>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                      <div className="font-bold text-xl text-indigo-600">8×8</div>
                      <div className="text-muted-foreground text-xs">Lưới tối đa</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 h-12 text-lg"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Bắt đầu
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
                className="text-9xl font-bold text-violet-500"
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
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Stats Bar */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1 px-3 py-1">
                  <Sparkles className="w-3 h-3" />
                  Level {level}
                </Badge>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span className={cn(
                    "font-mono text-lg font-bold",
                    timeLeft <= 10 && "text-red-500 animate-pulse"
                  )}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-1 px-2 py-1 font-mono text-xs">
                    ⚡ {reactionTimes.length > 0 ? Math.round(reactionTimes[reactionTimes.length - 1]) : 0}ms
                  </Badge>
                  <Badge className="gap-1 bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1">
                    <Trophy className="w-3 h-3" />
                    VPI: {score}
                  </Badge>
                </div>
              </div>

              {/* Time Progress */}
              <Progress
                value={(timeLeft / GAME_DURATION) * 100}
                className="h-2"
              />

              {/* Difficulty indicator */}
              <div className="text-center">
                <span className={cn("text-sm font-medium", tierInfo.color)}>
                  {tierInfo.emoji} {tierInfo.label}
                </span>
                <div className="text-xs text-muted-foreground mt-1">
                  Lưới {gridSize}×{gridSize}
                </div>
              </div>

              {/* Game Grid */}
              <motion.div
                animate={shakeGrid ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-3 sm:p-4 bg-card">
                  <div
                    className="grid gap-1.5 sm:gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    }}
                  >
                    {gridItems.map((item, i) => renderCell(item, i))}
                  </div>
                </Card>
              </motion.div>

              {/* Score feedback */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-emerald-500 font-bold">
                      +{calculateScore(level, reactionTimes[reactionTimes.length - 1] || 1000)} điểm +1s
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default DetailSpotter;
