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
  ScanEye,
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
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

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
  const { user, loading: authLoading } = useAuth();
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
    // We already check for loading in handleStart, but extra safety here
    if (!user) {
      console.warn("User not logged in, using mock session");
      return "mock-session-" + Date.now();
    }

    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          game_type: "detail_spotter",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle(); // Better than .single() if we're not sure

      if (error) {
        console.error("Failed to create session:", error);
        toast.error("Chơi chế độ Guest (không lưu kết quả)");
        return "mock-session-" + Date.now();
      }

      return data?.id || "mock-session-" + Date.now();
    } catch (e) {
      console.error("Exception in startSession:", e);
      return "mock-session-" + Date.now();
    }
  };

  // Save telemetry data (Improved for Neuro-Logic)
  const saveTelemetry = async (sid: string, telemetry: TelemetryData[]) => {
    if (sid.startsWith("mock-session") || telemetry.length === 0) return;

    // We now save raw telemetry to the JSONB column in game_sessions
    // instead of the separate relational table, for better flexibility.
    const { error } = await supabase
      .from("game_sessions")
      .update({
        telemetry: telemetry as any // Cast to any for JSONB compatibility
      })
      .eq("id", sid);

    if (error) {
      console.error("Failed to save telemetry:", error);
    }
  };

  // Complete session with final scores and Neuro-Logic metrics
  const completeSession = async (
    sid: string,
    finalScore: number,
    accuracy: number,
    avgReaction: number,
    maxLevel: number
  ) => {
    if (sid.startsWith("mock-session")) return;

    // --- NEURO-LOGIC ANALYSIS ---
    // 1. Scan Efficiency: How fast per item (grid size)?
    // 2. Impulsivity: Wrong clicks under < 500ms?
    // 3. Resilience: Did they speed up or slow down after error?

    // We calculate these from the buffer *before* clearing it
    const impulsivityCount = telemetryBuffer.filter(t => !t.is_correct && t.reaction_time_ms < 500).length;
    const scanEfficiencyScore = Math.max(0, 100 - (avgReaction / 50)); // Crude approx for now

    const advancedMetrics = {
      scan_efficiency: scanEfficiencyScore,
      impulsivity_count: impulsivityCount,
      neuro_trait: "Visual Attention"
    };

    const { error } = await supabase
      .from("game_sessions")
      .update({
        completed_at: new Date().toISOString(),
        final_score: finalScore,
        accuracy_percentage: accuracy,
        avg_reaction_time_ms: avgReaction,
        difficulty_level_reached: maxLevel,
        advanced_metrics: advancedMetrics as any
      })
      .eq("id", sid);

    if (error) {
      console.error("Failed to complete session:", error);
    }
  };

  // Start the game
  const handleStart = async () => {
    if (authLoading) return;
    // If auth is still loading, we should probably wait or show a message
    // But usually this is called via a button click which is disabled IF loading is true

    console.log("Starting game...");
    try {
      await initAudio(); // Initialize sound context
    } catch (e) {
      console.error("Audio init failed", e);
    }

    const newSessionId = await startSession();
    console.log("Session ID:", newSessionId);

    if (!newSessionId) {
      toast.error("Không thể khởi tạo game");
      return;
    }

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

  // Finish the game - Memoized to prevent stale closures in useEffect
  const finishGame = useCallback(async () => {
    if (!sessionId) return;

    const totalAttempts = correctCount + wrongCount;
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
    const avgReaction = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    console.log("Finishing game...", { score, accuracy, avgReaction });

    try {
      await saveTelemetry(sessionId, telemetryBuffer);
      await completeSession(sessionId, score, accuracy, avgReaction, level);

      // Redirect to result page with session ID
      navigate(`/assessment/result?session=${sessionId}`);
    } catch (err) {
      console.error("Error finishing game:", err);
      toast.error("Lỗi lưu kết quả. Vui lòng thử lại.");
      // Redirect anyway to show what we have
      navigate(`/assessment/result?session=${sessionId}`);
    }
  }, [sessionId, correctCount, wrongCount, reactionTimes, telemetryBuffer, score, level, navigate]);

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
  }, [phase, timeLeft, finishGame]);

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

    setReactionTimes(prev => [...prev, reactionTime]);

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

  // Calculate stats for UI
  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const lastReactionTime = reactionTimes.length > 0 ? reactionTimes[reactionTimes.length - 1] : 0;
  const lastScoreGain = calculateScore(level, lastReactionTime || 1000);



  return (
    <GameLayout className="bg-slate-50 min-h-screen font-sans">
      {/* Header - only show during gameplay */}
      {phase === "playing" && (
        <GameHeader
          title="Thợ Săn Chi Tiết"
          subtitle={tierInfo.label}
          icon={<ScanEye className="w-6 h-6 text-violet-600" />}
          timer={timeLeft}
          score={score}
          level={level}
          maxLevel={12}
          gradient="from-violet-600 to-indigo-600"
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        <div className="w-full max-w-2xl mx-auto">
          {/* Intro Screen */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <Card className="bg-white border-slate-200 shadow-xl overflow-hidden ring-1 ring-slate-100">
                  <div className="bg-gradient-to-br from-white to-slate-50 p-8 text-center border-b border-slate-100">
                    <motion.div
                      className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-xl mx-auto mb-6 border border-slate-100"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <ScanEye className="w-12 h-12 text-violet-600" />
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                      Thợ Săn Chi Tiết
                    </h2>
                    <p className="text-lg text-slate-600 font-medium">
                      Đo lường năng lực xử lý hình ảnh (Visual Processing)
                    </p>
                  </div>

                  <CardContent className="p-8 space-y-8 bg-white">
                    {/* Stats preview */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-center">
                        <div className="text-3xl font-bold text-violet-700 mb-1">60s</div>
                        <div className="text-sm font-bold text-violet-900/70">Thời gian</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                        <div className="text-3xl font-bold text-indigo-700 mb-1">12</div>
                        <div className="text-sm font-bold text-indigo-900/70">Cấp độ</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 text-center">
                        <div className="text-3xl font-bold text-fuchsia-700 mb-1">∞</div>
                        <div className="text-sm font-bold text-fuchsia-900/70">Điểm số</div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Eye className="w-6 h-6 text-violet-600" />
                        Nhiệm vụ của bạn
                      </h3>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">🎯</div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">Cấp 1-3: Tìm góc xoay</p>
                            <p className="text-slate-600">Chọn hình có góc xoay khác biệt</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">🪞</div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">Cấp 4-7: Tìm hình lật ngược</p>
                            <p className="text-slate-600">Chọn hình bị lật như soi gương</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">🧠</div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">Cấp 8+: Tìm tổ hợp duy nhất</p>
                            <p className="text-slate-600">Kết hợp màu sắc + hình dạng</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleStart}
                      disabled={authLoading}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white h-16 text-xl font-bold rounded-2xl shadow-xl shadow-violet-200 transition-all hover:scale-[1.01] active:scale-[0.99] border-b-4 border-violet-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {authLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>ĐANG TẢI...</span>
                        </div>
                      ) : (
                        <>
                          <Play className="w-6 h-6 mr-2 fill-current" />
                          BẮT ĐẦU NGAY
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Countdown Screen */}
            {phase === "countdown" && (
              <motion.div
                key="countdown"
                className="text-center w-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
              >
                <div className="w-48 h-48 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center border-8 border-violet-50 mb-8">
                  <motion.div
                    className="text-9xl font-black text-violet-600 tabular-nums"
                    key={countdown}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {countdown}
                  </motion.div>
                </div>
                <p className="text-slate-500 text-3xl font-bold tracking-widest uppercase">Sẵn sàng...</p>
              </motion.div>
            )}

            {/* Playing Screen */}
            {phase === "playing" && (
              <motion.div
                key="playing"
                className="space-y-6 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Stats Bar */}
                <Card className="bg-white p-4 shadow-sm border-slate-200 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="h-9 px-3 text-sm font-bold border-violet-200 text-violet-700 bg-violet-50">
                        Level {level}
                      </Badge>
                      <span className={cn("text-base font-bold flex items-center gap-2", tierInfo.color)}>
                        <span className="text-2xl">{tierInfo.emoji}</span> {tierInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-slate-400" />
                        <span className={cn(
                          "font-mono text-2xl font-black tabular-nums",
                          timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-slate-800"
                        )}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 mx-2"></div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-400 uppercase">Điểm số</span>
                        <span className="text-xl font-black text-violet-600 tabular-nums">{score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </Card>


                {/* Game Grid */}
                <motion.div
                  animate={shakeGrid ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="p-4 sm:p-8 bg-white shadow-xl border-slate-200 ring-4 ring-slate-50">
                    <div
                      className="grid gap-3 sm:gap-4"
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
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 fixed inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border-4 border-emerald-100 text-center">
                        <span className="text-6xl font-black text-emerald-500 drop-shadow-sm block mb-2">
                          +{lastScoreGain}
                        </span>
                        <span className="text-xl font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          Xuất sắc!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <GameFooter />
    </GameLayout>
  );
};

export default DetailSpotter;

