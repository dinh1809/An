import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Heart, Timer, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
type GamePhase = "watching" | "playing" | "success" | "fail";

interface MatrixSequenceMemoryProps {
  difficulty: Difficulty;
  durationSeconds: number;
  onComplete: (result: { score: number; accuracy: number; completed: boolean }) => void;
}

// Musical notes for each pad
const PAD_NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];

// Pad colors
const PAD_COLORS = [
  { base: "bg-gray-700/30", active: "bg-rose-500", glow: "shadow-rose-500/50" },
  { base: "bg-gray-700/30", active: "bg-orange-500", glow: "shadow-orange-500/50" },
  { base: "bg-gray-700/30", active: "bg-amber-500", glow: "shadow-amber-500/50" },
  { base: "bg-gray-700/30", active: "bg-lime-500", glow: "shadow-lime-500/50" },
  { base: "bg-gray-700/30", active: "bg-emerald-500", glow: "shadow-emerald-500/50" },
  { base: "bg-gray-700/30", active: "bg-cyan-500", glow: "shadow-cyan-500/50" },
  { base: "bg-gray-700/30", active: "bg-blue-500", glow: "shadow-blue-500/50" },
  { base: "bg-gray-700/30", active: "bg-violet-500", glow: "shadow-violet-500/50" },
  { base: "bg-gray-700/30", active: "bg-fuchsia-500", glow: "shadow-fuchsia-500/50" },
];

// Starting span based on difficulty
const STARTING_SPAN: Record<Difficulty, number> = {
  easy: 3,
  medium: 4,
  hard: 5,
};

export function MatrixSequenceMemory({ difficulty, durationSeconds, onComplete }: MatrixSequenceMemoryProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [phase, setPhase] = useState<GamePhase>("watching");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [currentSpan, setCurrentSpan] = useState(STARTING_SPAN[difficulty]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const roundsCompleted = useRef(0);
  const isGameOver = useRef(false);

  const isMounted = useRef(true);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Initialize audio
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Play note
  const playNote = useCallback((padIndex: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(PAD_NOTES[padIndex], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, []);

  // Generate sequence
  const generateSequence = useCallback((span: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < span; i++) {
      let next = Math.floor(Math.random() * 9);
      // Avoid repeating last pad
      if (seq.length > 0 && next === seq[seq.length - 1]) {
        next = (next + 1) % 9;
      }
      seq.push(next);
    }
    return seq;
  }, []);

  // Play sequence to user
  const playSequence = useCallback(async (seq: number[]) => {
    if (!isMounted.current) return;
    setPhase("watching");

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => {
        const t = setTimeout(resolve, 400);
        timeoutsRef.current.push(t);
      });
      if (!isMounted.current) return;

      const padIndex = seq[i];
      setActivePad(padIndex);
      playNote(padIndex);

      await new Promise(resolve => {
        const t = setTimeout(resolve, 500);
        timeoutsRef.current.push(t);
      });
      if (!isMounted.current) return;

      setActivePad(null);
    }

    await new Promise(resolve => {
      const t = setTimeout(resolve, 300);
      timeoutsRef.current.push(t);
    });
    if (!isMounted.current) return;

    setPhase("playing");
  }, [playNote]);

  // Start round
  const startRound = useCallback((span: number) => {
    if (!isMounted.current) return;
    const newSeq = generateSequence(span);
    setSequence(newSeq);
    setUserSequence([]);
    playSequence(newSeq);
  }, [generateSequence, playSequence]);

  // Handle pad click
  const handlePadClick = (padIndex: number) => {
    if (phase !== "playing" || isGameOver.current) return;

    playNote(padIndex);
    setActivePad(padIndex);
    const padTimeout = setTimeout(() => {
      if (isMounted.current) setActivePad(null);
    }, 150);
    timeoutsRef.current.push(padTimeout);

    const newUserSeq = [...userSequence, padIndex];
    const currentIdx = newUserSeq.length - 1;

    // Check if correct
    if (sequence[currentIdx] !== padIndex) {
      // Wrong!
      setPhase("fail");
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        isGameOver.current = true;
        const accuracy = roundsCompleted.current > 0
          ? (roundsCompleted.current / (roundsCompleted.current + 1)) * 100
          : 0;
        const completeTimeout = setTimeout(() => {
          if (isMounted.current) onComplete({ score, accuracy, completed: true });
        }, 800);
        timeoutsRef.current.push(completeTimeout);
      } else {
        const retryTimeout = setTimeout(() => {
          if (isMounted.current) startRound(currentSpan);
        }, 1000);
        timeoutsRef.current.push(retryTimeout);
      }
      return;
    }

    setUserSequence(newUserSeq);

    // Check if sequence complete
    if (newUserSeq.length === sequence.length) {
      setPhase("success");
      roundsCompleted.current += 1;
      setScore(s => s + currentSpan * 20);

      const nextRoundTimeout = setTimeout(() => {
        if (isMounted.current) {
          setCurrentSpan(s => s + 1);
          startRound(currentSpan + 1);
        }
      }, 800);
      timeoutsRef.current.push(nextRoundTimeout);
    }
  };

  // Initialize
  useEffect(() => {
    initAudio();
    startRound(currentSpan);
  }, []);

  // Timer
  useEffect(() => {
    if (isGameOver.current) return;

    if (timeLeft <= 0) {
      isGameOver.current = true;
      const accuracy = roundsCompleted.current > 0 ? 100 : 0;
      onComplete({ score, accuracy, completed: true });
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, onComplete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: lives }).map((_, i) => (
            <Heart key={i} className="w-4 h-4 text-red-500 fill-red-500" />
          ))}
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

      {/* Phase indicator */}
      <div className="text-center">
        {phase === "watching" && (
          <span className="text-secondary font-medium animate-pulse">Quan sát...</span>
        )}
        {phase === "playing" && (
          <span className="text-emerald-500 font-medium">Lượt của bạn!</span>
        )}
        {phase === "success" && (
          <span className="text-emerald-500 font-bold">Đúng rồi! +{currentSpan * 20}</span>
        )}
        {phase === "fail" && (
          <span className="text-red-500 font-bold">Sai rồi!</span>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-gray-900/50 border border-gray-700">
        {Array.from({ length: 9 }).map((_, index) => {
          const isActive = activePad === index;
          const colors = PAD_COLORS[index];

          return (
            <motion.button
              key={index}
              onClick={() => handlePadClick(index)}
              disabled={phase !== "playing"}
              className={cn(
                "aspect-square rounded-xl transition-all duration-150",
                "border-2 border-gray-600",
                isActive ? colors.active : colors.base,
                isActive && `shadow-lg ${colors.glow}`,
                phase !== "playing" && "cursor-not-allowed opacity-70"
              )}
              whileHover={phase === "playing" ? { scale: 1.05 } : {}}
              whileTap={phase === "playing" ? { scale: 0.95 } : {}}
            />
          );
        })}
      </div>

      {/* Span indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Chuỗi: {currentSpan} nốt
      </div>
    </div>
  );
}
