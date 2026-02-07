import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Volume2, ArrowRight, CheckCircle2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useGameSoundContext } from "@/hooks/useGameSound";
import { useAudioSynth } from "@/hooks/useAudioSynth";
import { PianoKey } from "@/components/PianoKey";
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

// ----------------------------------------------------------------------
// 1. CONFIGURATION: 2 OCTAVES (C3 - B4)
// ----------------------------------------------------------------------
const NOTES = [
  // Octave 3 (Indices 0-11)
  { note: 'C3', freq: 130.81, type: 'white', octave: 3 },
  { note: 'C#3', freq: 138.59, type: 'black', octave: 3, pos: 1 },
  { note: 'D3', freq: 146.83, type: 'white', octave: 3 },
  { note: 'D#3', freq: 155.56, type: 'black', octave: 3, pos: 2 },
  { note: 'E3', freq: 164.81, type: 'white', octave: 3 },
  { note: 'F3', freq: 174.61, type: 'white', octave: 3 },
  { note: 'F#3', freq: 185.00, type: 'black', octave: 3, pos: 4 },
  { note: 'G3', freq: 196.00, type: 'white', octave: 3 },
  { note: 'G#3', freq: 207.65, type: 'black', octave: 3, pos: 5 },
  { note: 'A3', freq: 220.00, type: 'white', octave: 3 },
  { note: 'A#3', freq: 233.08, type: 'black', octave: 3, pos: 6 },
  { note: 'B3', freq: 246.94, type: 'white', octave: 3 },

  // Octave 4 (Indices 12-23)
  { note: 'C4', freq: 261.63, type: 'white', octave: 4 },
  { note: 'C#4', freq: 277.18, type: 'black', octave: 4, pos: 1 },
  { note: 'D4', freq: 293.66, type: 'white', octave: 4 },
  { note: 'D#4', freq: 311.13, type: 'black', octave: 4, pos: 2 },
  { note: 'E4', freq: 329.63, type: 'white', octave: 4 },
  { note: 'F4', freq: 349.23, type: 'white', octave: 4 },
  { note: 'F#4', freq: 369.99, type: 'black', octave: 4, pos: 4 },
  { note: 'G4', freq: 392.00, type: 'white', octave: 4 },
  { note: 'G#4', freq: 415.30, type: 'black', octave: 4, pos: 5 },
  { note: 'A4', freq: 440.00, type: 'white', octave: 4 },
  { note: 'A#4', freq: 466.16, type: 'black', octave: 4, pos: 6 },
  { note: 'B4', freq: 493.88, type: 'white', octave: 4 },
];

const MAX_ROUNDS = 5;

type GamePhase = "intro" | "watching" | "playing" | "round_summary" | "completed";

interface MistakeLog {
  round: number;
  expected: string;
  actual: string;
  interval_direction_match: boolean;
}

const SequenceMemory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { triggerHaptic } = useGameSoundContext();
  const { initAudio, playTone } = useAudioSynth();
  const sessionIdRef = useRef<string | null>(null);

  // STATE MANAGEMENT
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<number[]>([]);

  // Feedback state
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const [keyStatus, setKeyStatus] = useState<"correct" | "wrong" | null>(null);

  // Scoring
  const [totalNotes, setTotalNotes] = useState(0);
  const [correctNotes, setCorrectNotes] = useState(0);
  const [mistakesLog, setMistakesLog] = useState<MistakeLog[]>([]);

  // --------------------------------------------------------------------
  // GAME LOGIC
  // --------------------------------------------------------------------

  const createSession = async () => {
    if (!user) {
      console.warn("User not logged in, using mock session");
      sessionIdRef.current = "mock-session-" + Date.now();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          game_type: "sonic_conservatory",
          started_at: new Date().toISOString(),
          final_score: 0, // Default to 0 instead of null
          difficulty_level_reached: 1
        })
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Failed to create session:", error);
        sessionIdRef.current = "mock-session-" + Date.now();
      } else if (data) {
        sessionIdRef.current = data.id;
      } else {
        sessionIdRef.current = "mock-session-" + Date.now();
      }
    } catch (e) {
      console.error("Exception in createSession:", e);
      sessionIdRef.current = "mock-session-" + Date.now();
    }
  };

  const generateSequence = (roundNum: number) => {
    const length = 2 + roundNum;
    const newSeq: number[] = [];

    let currentNote = Math.floor(Math.random() * NOTES.length);
    newSeq.push(currentNote);

    const range = roundNum === 1 ? 5 : roundNum === 2 ? 7 : 12;

    for (let i = 1; i < length; i++) {
      const jump = Math.floor(Math.random() * range) * (Math.random() > 0.5 ? 1 : -1);
      let nextNote = currentNote + jump;

      if (nextNote < 0) nextNote = 0;
      if (nextNote >= NOTES.length) nextNote = NOTES.length - 1;

      newSeq.push(nextNote);
      currentNote = nextNote;
    }
    return newSeq;
  };

  const startRound = async (r: number) => {
    setRound(r);
    setPhase("watching");
    setUserInputs([]);
    setKeyStatus(null);

    const newSeq = generateSequence(r);
    setSequence(newSeq);

    await new Promise(res => setTimeout(res, 1000));
    for (let i = 0; i < newSeq.length; i++) {
      const idx = newSeq[i];
      setActiveKey(idx);
      playTone(NOTES[idx].freq, 0.4, "triangle");
      await new Promise(res => setTimeout(res, 600));
      setActiveKey(null);
      await new Promise(res => setTimeout(res, 200));
    }
    setPhase("playing");
  };

  const handleKeyPress = (idx: number) => {
    if (phase !== "playing") return;

    initAudio();
    triggerHaptic(50);
    playTone(NOTES[idx].freq, 0.3, "sine");

    setPressedKey(idx);

    const currentStep = userInputs.length;
    const expectedIdx = sequence[currentStep];
    const isCorrect = idx === expectedIdx;

    setKeyStatus(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setCorrectNotes(prev => prev + 1);
    } else {
      const expectedNote = NOTES[expectedIdx].note;
      const actualNote = NOTES[idx].note;

      // Contour Match logic
      let contourCorrect = false;
      if (currentStep > 0) {
        const prevExp = sequence[currentStep - 1];
        const prevUser = userInputs[currentStep - 1] ?? prevExp;

        const expDir = expectedIdx - prevExp;
        const actDir = idx - prevUser;

        if ((expDir > 0 && actDir > 0) || (expDir < 0 && actDir < 0) || (expDir === 0 && actDir === 0)) {
          contourCorrect = true;
        }
      }

      setMistakesLog(prev => [...prev, {
        round: round,
        expected: expectedNote,
        actual: actualNote,
        interval_direction_match: contourCorrect
      }]);
    }
    setTotalNotes(prev => prev + 1);

    const newUserInputs = [...userInputs, idx];
    setUserInputs(newUserInputs);

    setTimeout(() => {
      setPressedKey(null);
      setKeyStatus(null);
    }, 250);

    if (newUserInputs.length === sequence.length) {
      if (round >= MAX_ROUNDS) {
        endGame();
      } else {
        setPhase("round_summary");
        setTimeout(() => {
          startRound(round + 1);
        }, 1500);
      }
    }
  };

  const endGame = async () => {
    setPhase("completed");

    if (!sessionIdRef.current || !user) return;

    const pitchAccuracy = Math.round((correctNotes / totalNotes) * 100) || 0;

    const metrics = {
      pitch_accuracy: pitchAccuracy,
      total_notes: totalNotes,
      mistakes_count: mistakesLog.length,
      contour_accuracy_on_mistakes: mistakesLog.filter(m => m.interval_direction_match).length,
      mistakes_detail: mistakesLog.slice(0, 5).map(m => ({
        round: m.round,
        expected: m.expected,
        actual: m.actual,
        interval_direction_match: m.interval_direction_match
      }))
    } as unknown as Record<string, never>;

    // --- NEURO-LOGIC ANALYSIS ---
    // 1. Digit Span: Max sequence length achieved (Round + 2)
    // 2. Working Memory Capacity: Weighted score of accuracy * span

    // Calculate span based on max round passed. If they failed this round, span is round + 2 - 1?
    // Actually, max difficulty reached is passed as round.
    const maxSpan = (round > 1) ? (2 + round) : 3;

    // Advanced Metrics
    const advancedMetrics = {
      digit_span: maxSpan,
      working_memory_score: Math.round(pitchAccuracy * maxSpan / 10), // Simple weight
      mistakes_count: mistakesLog.length,
      neuro_trait: "Working Memory"
    };

    // Save Telemetry (Full Mistake Log + Round History would be better, but log is good start)
    await supabase.from("game_sessions").update({
      completed_at: new Date().toISOString(),
      final_score: pitchAccuracy,
      difficulty_level_reached: MAX_ROUNDS,
      metrics: metrics as unknown as typeof metrics,
      advanced_metrics: advancedMetrics as unknown as typeof metrics, // Cast to avoid TS error until types update propagates
      telemetry: mistakesLog as unknown as typeof metrics // Saving mistakes log as telemetry
    }).eq("id", sessionIdRef.current);

    const query = new URLSearchParams(window.location.search);
    const mode = query.get('mode');

    if (mode === 'campaign') {
      const prevScores = location.state?.previousScores || [];
      navigate(`/assessment/dispatcher?mode=campaign`, {
        state: {
          score: pitchAccuracy,
          previousScores: [...prevScores, { type: 'sonic_conservatory', score: pitchAccuracy }]
        }
      });
    } else {
      navigate(`/assessment/result?session=${sessionIdRef.current}`, {
        state: {
          score: pitchAccuracy,
          type: 'sonic_conservatory',
          mistakes: mistakesLog
        }
      });
    }
  };

  const handleStart = async () => {
    await createSession();
    initAudio();
    setTotalNotes(0);
    setCorrectNotes(0);
    setMistakesLog([]);
    startRound(1);
  };

  // Helper to render an Octave
  const renderOctave = (octave: number, startIndex: number, label?: string) => {
    const octaveNotes = NOTES.slice(startIndex, startIndex + 12);
    const whiteKeys = octaveNotes.filter(n => n.type === 'white');
    const blackKeys = octaveNotes.filter(n => n.type === 'black');

    return (
      <div className="relative w-full md:flex-1 h-32 md:h-48 select-none">
        {/* Label (Mobile Only) */}
        {label && <div className="text-xs text-slate-500 mb-1 pl-1 md:hidden">{label}</div>}

        <div className="relative flex h-full">
          {/* White Keys Layer */}
          {whiteKeys.map((n, i) => {
            const originalIndex = startIndex + octaveNotes.findIndex(on => on.note === n.note);
            return (
              <PianoKey
                key={n.note}
                note={n.note}
                isBlack={false}
                isActive={activeKey === originalIndex}
                isPressed={pressedKey === originalIndex}
                status={pressedKey === originalIndex ? keyStatus : null}
                onClick={() => handleKeyPress(originalIndex)}
                disabled={phase !== "playing"}
                className="flex-1 w-auto border-r border-slate-300 last:border-r-0 md:last:border-r"
              />
            );
          })}

          {/* Black Keys Layer */}
          {blackKeys.map((n) => {
            const originalIndex = startIndex + octaveNotes.findIndex(on => on.note === n.note);
            const leftPercent = (n.pos || 0) * 14.2857;

            return (
              <PianoKey
                key={n.note}
                note={n.note}
                isBlack={true}
                isActive={activeKey === originalIndex}
                isPressed={pressedKey === originalIndex}
                status={pressedKey === originalIndex ? keyStatus : null}
                onClick={() => handleKeyPress(originalIndex)}
                disabled={phase !== "playing"}
                style={{
                  left: `${leftPercent}%`,
                  transform: 'translateX(-50%)',
                  width: '8%', // Slightly narrower than pure half
                  height: '60%'
                }}
                className="absolute top-0"
              />
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <GameLayout className="bg-slate-950">
      {/* Header - show during gameplay */}
      {phase !== "intro" && phase !== "completed" && (
        <GameHeader
          title="Nhà Soạn Nhạc"
          subtitle={`Vòng ${round}/${MAX_ROUNDS}`}
          icon={<Music className="w-5 h-5" />}
          accuracy={totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 100}
          gradient="from-indigo-500 to-purple-500"
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* MAIN AREA */}
        <div className="w-full max-w-5xl">
          {phase === "intro" ? (
            <Card className="bg-slate-900/80 border-slate-700/50 p-12 text-center max-w-2xl mx-auto backdrop-blur-xl shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30"
              >
                <Music className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl text-white font-bold mb-4">Nhà Soạn Nhạc</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Đánh giá khả năng xử lý thính giác và trí nhớ giai điệu.
                <br />
                <b>Hướng dẫn:</b> Lắng nghe giai điệu, sau đó chơi lại.
                <br />
                <span className="text-teal-400 text-sm mt-2 block">
                  *Có thể sai. Tiếp tục chơi cho đến khi hoàn thành cả chuỗi.
                </span>
              </p>
              <Button
                onClick={handleStart}
                disabled={authLoading}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-14 text-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                {authLoading ? "Synchronizing..." : <><Play className="w-5 h-5 mr-2" /> Bắt Đầu Đánh Giá</>}
              </Button>
            </Card>
          ) : (
            <div className="space-y-8 w-full">
              {/* VISUAL FEEDBACK */}
              <div className="h-24 bg-slate-900 border-y border-slate-800 flex items-center justify-center gap-2 overflow-hidden relative">
                {/* Progress Dots */}
                <div className="flex gap-3">
                  {Array.from({ length: sequence.length || 0 }).map((_, i) => {
                    const status = i < userInputs.length
                      ? (userInputs[i] === sequence[i] ? "correct" : "wrong")
                      : "pending";

                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "w-4 h-4 rounded-full transition-colors",
                          status === "pending" && "bg-slate-700",
                          status === "correct" && "bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]",
                          status === "wrong" && "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                          i === userInputs.length && phase === "playing" && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                        )}
                      />
                    )
                  })}
                </div>
                <div className="absolute top-2 right-4 text-xs font-mono uppercase tracking-widest text-slate-500">
                  STATUS: {phase === "watching" ? "LISTENING..." : "RECORDING..."}
                </div>
              </div>

              {/* PIANO ROLL - RESPONSIVE LAYOUT */}
              <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 md:gap-0 md:bg-white md:p-1 md:rounded-lg">
                {/* Octave 3 (Low) */}
                {renderOctave(3, 0, "Low Octave (C3-B3)")}

                {/* Octave 4 (High) */}
                {renderOctave(4, 12, "High Octave (C4-B4)")}
              </div>

              {/* INSTRUCTION TEXT */}
              <div className="text-center text-slate-500 text-sm min-h-[20px]">
                {phase === "watching" && "Listen carefully..."}
                {phase === "playing" && "Replay the melody..."}
                {phase === "round_summary" && <span className="text-teal-400 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sequence Complete</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <GameFooter />
    </GameLayout>
  );
};

export default SequenceMemory;
