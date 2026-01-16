import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play, Zap, Brain, AlertTriangle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useGameSoundContext } from "@/hooks/useGameSound";

// Musical notes for each pad (frequencies in Hz)
const PAD_NOTES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
];

// Pad colors - Sci-fi neon style
const PAD_COLORS = [
  { base: "bg-gray-700/30", active: "bg-rose-500", ring: "ring-rose-400", glow: "shadow-rose-500/50" },
  { base: "bg-gray-700/30", active: "bg-orange-500", ring: "ring-orange-400", glow: "shadow-orange-500/50" },
  { base: "bg-gray-700/30", active: "bg-amber-500", ring: "ring-amber-400", glow: "shadow-amber-500/50" },
  { base: "bg-gray-700/30", active: "bg-lime-500", ring: "ring-lime-400", glow: "shadow-lime-500/50" },
  { base: "bg-gray-700/30", active: "bg-emerald-500", ring: "ring-emerald-400", glow: "shadow-emerald-500/50" },
  { base: "bg-gray-700/30", active: "bg-cyan-500", ring: "ring-cyan-400", glow: "shadow-cyan-500/50" },
  { base: "bg-gray-700/30", active: "bg-blue-500", ring: "ring-blue-400", glow: "shadow-blue-500/50" },
  { base: "bg-gray-700/30", active: "bg-violet-500", ring: "ring-violet-400", glow: "shadow-violet-500/50" },
  { base: "bg-gray-700/30", active: "bg-fuchsia-500", ring: "ring-fuchsia-400", glow: "shadow-fuchsia-500/50" },
];

type GamePhase = "ready" | "watching" | "playing" | "success" | "fail" | "gameover";
type GameMode = "forward" | "reverse" | "distraction";

interface GameState {
  sequence: number[];
  phantomLights: number[]; // For distraction mode
  userSequence: number[];
  lives: number;
  level: number;
  currentSpan: number;
  maxForwardSpan: number;
  maxReverseSpan: number;
  totalErrors: number;
  phantomClicks: number; // Did user click phantom lights?
  activePad: number | null;
  phantomActivePad: number | null; // Phantom light (faint, no sound)
  mode: GameMode;
}

const SequenceMemory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSound, triggerHaptic, initAudio: initGameSound } = useGameSoundContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [gamePhase, setGamePhase] = useState<GamePhase>("ready");
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    phantomLights: [],
    userSequence: [],
    lives: 3,
    level: 1,
    currentSpan: 3,
    maxForwardSpan: 0,
    maxReverseSpan: 0,
    totalErrors: 0,
    phantomClicks: 0,
    activePad: null,
    phantomActivePad: null,
    mode: "forward",
  });

  const [showFlash, setShowFlash] = useState<"success" | "fail" | null>(null);
  const [showReverseWarning, setShowReverseWarning] = useState(false);

  // Get mode and span for a given level
  const getLevelConfig = useCallback((level: number): { mode: GameMode; span: number } => {
    if (level <= 4) {
      // Levels 1-4: Forward Span (3, 4, 5, 6)
      return { mode: "forward", span: 2 + level };
    } else if (level <= 8) {
      // Levels 5-8: Reverse Span (3, 4, 5, 6)
      return { mode: "reverse", span: level - 2 };
    } else {
      // Levels 9+: Distraction Mode with Reverse (span continues increasing)
      return { mode: "distraction", span: Math.min(level - 2, 9) };
    }
  }, []);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Play a note
  const playNote = useCallback((padIndex: number, isSuccess: boolean = false) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (isSuccess) {
      // Special "tech success" sound - ascending chord
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else {
      oscillator.type = "sine";
      oscillator.frequency.value = PAD_NOTES[padIndex];
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  }, []);

  // Generate a new sequence
  const generateSequence = useCallback((length: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 9));
    }
    return seq;
  }, []);

  // Generate phantom lights for distraction mode
  const generatePhantomLights = useCallback((sequenceLength: number): number[] => {
    const numPhantoms = Math.floor(sequenceLength / 3) + 1;
    const phantoms: number[] = [];
    for (let i = 0; i < numPhantoms; i++) {
      phantoms.push(Math.floor(Math.random() * 9));
    }
    return phantoms;
  }, []);

  // Create game session
  const createSession = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        game_type: "sequence_memory",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      return null;
    }
    return data.id;
  }, [user]);

  // Save game result
  const saveResult = useCallback(async () => {
    if (!sessionIdRef.current || !user) return;

    const maxSpan = Math.max(gameState.maxForwardSpan, gameState.maxReverseSpan);
    const distractionResistance = gameState.phantomClicks === 0
      ? "High"
      : gameState.phantomClicks <= 2
        ? "Medium"
        : "Low";

    // Metrics for the Neuro-Radar profile
    const metrics = {
      max_forward_span: gameState.maxForwardSpan,
      max_reverse_span: gameState.maxReverseSpan,
      max_span_reached: maxSpan,
      total_errors: gameState.totalErrors,
      distraction_resistance: distractionResistance,
      memory_type: "visual_sequential",
    };

    const { error } = await supabase
      .from("game_sessions")
      .update({
        completed_at: new Date().toISOString(),
        final_score: (gameState.maxForwardSpan * 10) + (gameState.maxReverseSpan * 20),
        accuracy_percentage: Math.round(
          (maxSpan / (maxSpan + gameState.totalErrors)) * 100
        ),
        difficulty_level_reached: gameState.level,
        avg_reaction_time_ms: 0, // Not tracking reaction time for this game
        metrics: metrics,
      })
      .eq("id", sessionIdRef.current);

    if (error) {
      console.error("Failed to save result:", error);
    }

    navigate(`/assessment/result?session=${sessionIdRef.current}`);
  }, [user, gameState, navigate]);

  // Play the sequence to the user
  const playSequence = useCallback(async (
    sequence: number[],
    phantomLights: number[] = [],
    mode: GameMode
  ) => {
    setGamePhase("watching");

    // Show reverse warning
    if (mode === "reverse" || mode === "distraction") {
      setShowReverseWarning(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowReverseWarning(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Interleave phantom lights in distraction mode
    const phantomPositions = phantomLights.map(() =>
      Math.floor(Math.random() * (sequence.length + 1))
    );

    let phantomIndex = 0;

    for (let i = 0; i <= sequence.length; i++) {
      // Play any phantom lights at this position
      while (phantomIndex < phantomPositions.length && phantomPositions[phantomIndex] === i) {
        const phantomPad = phantomLights[phantomIndex];
        // Show phantom light (faint, NO SOUND)
        setGameState(prev => ({ ...prev, phantomActivePad: phantomPad }));
        await new Promise(resolve => setTimeout(resolve, 300));
        setGameState(prev => ({ ...prev, phantomActivePad: null }));
        await new Promise(resolve => setTimeout(resolve, 200));
        phantomIndex++;
      }

      // Play actual sequence
      if (i < sequence.length) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const padIndex = sequence[i];
        setGameState(prev => ({ ...prev, activePad: padIndex }));
        playNote(padIndex);
        await new Promise(resolve => setTimeout(resolve, 600));
        setGameState(prev => ({ ...prev, activePad: null }));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setGamePhase("playing");
  }, [playNote]);

  // Start a new round
  const startRound = useCallback(async (level: number) => {
    const config = getLevelConfig(level);
    const newSequence = generateSequence(config.span);
    const phantomLights = config.mode === "distraction"
      ? generatePhantomLights(config.span)
      : [];

    setGameState(prev => ({
      ...prev,
      sequence: newSequence,
      phantomLights,
      userSequence: [],
      level,
      currentSpan: config.span,
      mode: config.mode,
    }));

    await playSequence(newSequence, phantomLights, config.mode);
  }, [getLevelConfig, generateSequence, generatePhantomLights, playSequence]);

  // Start game
  const startGame = useCallback(async () => {
    initAudio();
    initGameSound(); // Initialize game sound context

    const id = await createSession();
    if (id) sessionIdRef.current = id;

    setGameState({
      sequence: [],
      phantomLights: [],
      userSequence: [],
      lives: 3,
      level: 1,
      currentSpan: 3,
      maxForwardSpan: 0,
      maxReverseSpan: 0,
      totalErrors: 0,
      phantomClicks: 0,
      activePad: null,
      phantomActivePad: null,
      mode: "forward",
    });

    startRound(1);
  }, [initAudio, initGameSound, createSession, startRound]);

  // Get expected sequence (reversed for reverse/distraction modes)
  const getExpectedSequence = useCallback(() => {
    if (gameState.mode === "forward") {
      return gameState.sequence;
    }
    return [...gameState.sequence].reverse();
  }, [gameState.sequence, gameState.mode]);

  // Handle pad click
  const handlePadClick = useCallback((padIndex: number) => {
    if (gamePhase !== "playing") return;

    // Check if this was a phantom light click
    if (gameState.phantomLights.includes(padIndex) && gameState.mode === "distraction") {
      setGameState(prev => ({
        ...prev,
        phantomClicks: prev.phantomClicks + 1,
      }));
    }

    playNote(padIndex);
    setGameState(prev => ({ ...prev, activePad: padIndex }));
    setTimeout(() => setGameState(prev => ({ ...prev, activePad: null })), 150);

    const expectedSequence = getExpectedSequence();
    const newUserSequence = [...gameState.userSequence, padIndex];
    const currentIndex = newUserSequence.length - 1;

    // Check if the input is correct
    if (expectedSequence[currentIndex] !== padIndex) {
      // Wrong! Play wrong sound and haptic
      playSound("wrong");
      triggerHaptic(200);

      setShowFlash("fail");
      setTimeout(() => setShowFlash(null), 300);

      const newLives = gameState.lives - 1;
      const newTotalErrors = gameState.totalErrors + 1;

      setGameState(prev => ({
        ...prev,
        userSequence: [],
        lives: newLives,
        totalErrors: newTotalErrors,
      }));

      if (newLives <= 0) {
        // Game Over
        playSound("gameOver");
        setGamePhase("gameover");
      } else if (gameState.level === 5 && gameState.mode === "reverse") {
        // Checkpoint: Failed at Level 5 (first reverse level)
        // Downgrade to Level 4 to measure forward capacity
        setGamePhase("fail");
        setTimeout(() => {
          startRound(4);
        }, 1500);
      } else {
        // Replay same sequence
        setGamePhase("fail");
        setTimeout(() => {
          playSequence(gameState.sequence, gameState.phantomLights, gameState.mode);
        }, 1500);
      }
      return;
    }

    // Correct input - play correct sound
    playSound("correct");

    setGameState(prev => ({ ...prev, userSequence: newUserSequence }));

    // Check if sequence is complete
    if (newUserSequence.length === expectedSequence.length) {
      // Success! Play level up sound
      playSound("levelUp");
      const isReverseMode = gameState.mode === "reverse" || gameState.mode === "distraction";

      if (isReverseMode) {
        playNote(0, true); // Special success sound for reverse
      }

      setShowFlash("success");
      setTimeout(() => setShowFlash(null), 300);

      // Update max spans
      setGameState(prev => ({
        ...prev,
        maxForwardSpan: prev.mode === "forward"
          ? Math.max(prev.maxForwardSpan, prev.currentSpan)
          : prev.maxForwardSpan,
        maxReverseSpan: (prev.mode === "reverse" || prev.mode === "distraction")
          ? Math.max(prev.maxReverseSpan, prev.currentSpan)
          : prev.maxReverseSpan,
      }));

      setGamePhase("success");

      setTimeout(() => {
        startRound(gameState.level + 1);
      }, 1000);
    }
  }, [
    gamePhase,
    gameState,
    playNote,
    getExpectedSequence,
    playSequence,
    startRound,
    playSound,
    triggerHaptic
  ]);

  // Save result when game is over
  useEffect(() => {
    if (gamePhase === "gameover") {
      const timer = setTimeout(() => {
        saveResult();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, saveResult]);

  // Get progress bar color based on mode
  const getProgressColor = () => {
    if (gameState.mode === "forward") return "bg-primary";
    if (gameState.mode === "reverse") return "bg-secondary";
    return "bg-destructive";
  };

  // Calculate progress percentage
  const progressPercent = Math.min(100, (gameState.level / 12) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 pointer-events-none",
              showFlash === "success" ? "bg-emerald-500" : "bg-red-500"
            )}
          />
        )}
      </AnimatePresence>

      {/* Reverse Mode Warning */}
      <AnimatePresence>
        {showReverseWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              animate={{
                opacity: [1, 0.5, 1],
                scale: [1, 1.05, 1]
              }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 shadow-2xl"
            >
              <RotateCcw className="w-12 h-12 mx-auto mb-3 text-white" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {gameState.mode === "distraction"
                  ? "CHẾ ĐỘ NHIỄU LOẠN"
                  : "CHẾ ĐỘ ĐẢO NGƯỢC"}
              </h2>
              <p className="text-white/90 text-lg">
                {gameState.mode === "distraction"
                  ? "Bỏ qua đèn không có tiếng!"
                  : "Nhấn theo thứ tự NGƯỢC LẠI!"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gradient mb-3 shadow-lg shadow-primary/30">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Sequence Master Pro</h1>
          <p className="text-slate-400 text-sm">Trí nhớ làm việc & Thao tác thông tin</p>
        </div>

        {/* Ready State */}
        {gamePhase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
              <Zap className="w-12 h-12 mx-auto text-secondary mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Cách chơi</h2>
              <div className="text-slate-400 text-sm mb-4 space-y-2 text-left">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1-4:</span>
                  <span>Nhấn đúng thứ tự bạn thấy</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">5-8:</span>
                  <span>Nhấn theo thứ tự <strong className="text-orange-400">NGƯỢC LẠI</strong></span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">9+:</span>
                  <span>Ngược lại + <strong className="text-red-400">Bỏ qua đèn không có tiếng</strong></span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" /> 3 mạng
                </span>
              </div>
            </Card>

            <Button
              size="lg"
              className="w-full bg-brand-gradient hover:opacity-90 text-lg text-white"
              onClick={startGame}
            >
              <Play className="w-5 h-5 mr-2" />
              Bắt đầu
            </Button>
          </motion.div>
        )}

        {/* Game State */}
        {gamePhase !== "ready" && (
          <>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">
                  Level {gameState.level}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    gameState.mode === "forward" && "border-emerald-500 text-emerald-400",
                    gameState.mode === "reverse" && "border-orange-500 text-orange-400",
                    gameState.mode === "distraction" && "border-red-500 text-red-400"
                  )}
                >
                  {gameState.mode === "forward" && "Forward"}
                  {gameState.mode === "reverse" && "Reverse"}
                  {gameState.mode === "distraction" && "Distraction"}
                </Badge>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", getProgressColor())}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="border-slate-600 text-slate-300 px-3 py-1">
                Chuỗi: <span className="font-bold text-white ml-1">{gameState.currentSpan}</span>
              </Badge>

              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      "w-5 h-5 transition-all",
                      i < gameState.lives ? "text-red-500 fill-red-500" : "text-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Mode Warning Badge */}
            {(gameState.mode === "reverse" || gameState.mode === "distraction") && gamePhase === "playing" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Badge
                  className={cn(
                    "w-full justify-center py-2 text-sm",
                    gameState.mode === "distraction"
                      ? "bg-red-500/20 text-red-400 border-red-500/50"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/50"
                  )}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {gameState.mode === "distraction"
                    ? "NGƯỢC + BỎ QUA ĐÈN KHÔNG TIẾNG"
                    : "REVERSE: Nhấn NGƯỢC thứ tự!"}
                </Badge>
              </motion.div>
            )}

            {/* Phase indicator */}
            <AnimatePresence mode="wait">
              {gamePhase === "watching" && !showReverseWarning && (
                <motion.div
                  key="watching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mb-4"
                >
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    👀 Quan sát...
                  </Badge>
                </motion.div>
              )}
              {gamePhase === "playing" && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mb-4"
                >
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    🎯 Đến lượt bạn!
                  </Badge>
                </motion.div>
              )}
              {gamePhase === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mb-4"
                >
                  <Badge className="bg-emerald-500 text-white text-lg py-1 px-4">
                    ✨ Tuyệt vời!
                  </Badge>
                </motion.div>
              )}
              {gamePhase === "fail" && (
                <motion.div
                  key="fail"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  className="text-center mb-4"
                >
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                    ❌ Sai rồi! Thử lại...
                  </Badge>
                </motion.div>
              )}
              {gamePhase === "gameover" && (
                <motion.div
                  key="gameover"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-4"
                >
                  <Badge className="bg-slate-700 text-white text-lg py-2 px-6">
                    🏆 Forward: {gameState.maxForwardSpan} | Reverse: {gameState.maxReverseSpan}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: showFlash === "fail" ? [0, -5, 5, -5, 5, 0] : 0
              }}
              className={cn(
                "grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700",
                gamePhase === "watching" && "pointer-events-none"
              )}
            >
              {Array.from({ length: 9 }).map((_, index) => {
                const isActive = gameState.activePad === index;
                const isPhantom = gameState.phantomActivePad === index;
                const color = PAD_COLORS[index];

                return (
                  <motion.button
                    key={index}
                    onClick={() => handlePadClick(index)}
                    disabled={gamePhase !== "playing"}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                      isActive
                        ? `${color.active} border-white shadow-lg ${color.glow} ${color.ring}`
                        : isPhantom
                          ? `${color.active} border-slate-500 opacity-30` // Phantom: faint, no glow
                          : `${color.base} border-slate-600 hover:border-slate-500`,
                      gamePhase === "watching" && "cursor-not-allowed",
                      gamePhase !== "playing" && gamePhase !== "watching" && "opacity-50"
                    )}
                    whileTap={gamePhase === "playing" ? { scale: 0.95 } : undefined}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  >
                    {isActive && (
                      <motion.div
                        className="w-full h-full rounded-lg flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-3 h-3 rounded-full bg-white shadow-lg" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Stats hint */}
            {(gameState.maxForwardSpan > 0 || gameState.maxReverseSpan > 0) && gamePhase !== "gameover" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-500 mt-4 space-x-4"
              >
                <span>Forward Max: {gameState.maxForwardSpan}</span>
                <span>Reverse Max: {gameState.maxReverseSpan}</span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SequenceMemory;
