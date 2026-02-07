import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateHardRavenProblem, RavenProblem } from '@/lib/raven-logic';
import { RavenCell } from '@/components/matrix/RavenCell';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameLayout, GameHeader, GameFooter } from '@/components/game';

const MatrixAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [problem, setProblem] = useState<RavenProblem | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [history, setHistory] = useState<{ problemId: string, isCorrect: boolean, explanation: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Init
  useEffect(() => {
    const startSession = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          game_type: "matrix_assessment",
        })
        .select("id")
        .single();

      if (data) setSessionId(data.id);
    };

    startSession();
    loadProblem();
  }, [user]);

  const loadProblem = () => {
    // MVP: Random level, sau này sẽ Adaptive
    setProblem(generateHardRavenProblem());
    setIsTransitioning(false);
  };

  const handleAnswer = (index: number) => {
    if (!problem || isTransitioning) return;

    const isCorrect = index === problem.correctIndex;
    setIsTransitioning(true);

    if (isCorrect) {
      setScore(s => s + 10);
      toast({
        title: "Pattern Matched",
        description: "Logic integrity confirmed.",
        className: "bg-teal-950 border-teal-500 text-teal-100"
      });
    } else {
      toast({
        title: "Mismatch Detected",
        description: "Moving to next sequence.",
        variant: "destructive",
      });
    }

    setHistory(prev => [...prev, { problemId: problem.id, isCorrect, explanation: problem.explanation }]);

    setTimeout(async () => {
      if (currentRound < 10) {
        setCurrentRound(r => r + 1);
        loadProblem();
      } else {
        const finalScore = score + (isCorrect ? 10 : 0);

        // Save Session
        if (sessionId) {
          const accuracy = (history.filter(h => h.isCorrect).length + (isCorrect ? 1 : 0)) * 10;
          await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: finalScore,
            accuracy_percentage: accuracy,
            difficulty_level_reached: 1
          }).eq("id", sessionId);
        }

        const query = new URLSearchParams(window.location.search);
        const mode = query.get('mode');

        if (mode === 'campaign') {
          navigate('/assessment/piano?mode=campaign', {
            state: {
              score: finalScore,
              previousScores: [{ type: 'matrix', score: finalScore }],
              matrixHistory: [...history, { problemId: problem!.id, isCorrect, explanation: problem!.explanation }]
            }
          });
        } else {
          const resultPath = sessionId ? `/assessment/result?session=${sessionId}` : `/assessment/result`;
          navigate(resultPath, {
            state: {
              score: finalScore,
              type: 'matrix',
              matrixHistory: [...history, { problemId: problem!.id, isCorrect, explanation: problem!.explanation }]
            }
          });
        }
      }
    }, 800);
  };

  if (!problem) return null;

  return (
    <GameLayout className="bg-[#020617]">
      <GameHeader
        title="Ma Trận Logic"
        subtitle={`Câu ${currentRound}/10`}
        icon={<BrainCircuit className="w-5 h-5" />}
        score={score}
        gradient="from-teal-500 to-cyan-500"
        onBack={() => navigate(-1)}
      />

      {/* Progress Bar */}
      <Progress value={(currentRound / 10) * 100} className="h-0.5 rounded-none bg-slate-900" />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8 max-w-lg mx-auto w-full">

        {/* THE MATRIX (Inspector View) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={problem.id}
          className="w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 pointer-events-none" />

          <div className="grid grid-cols-3 gap-3 relative z-10">
            {problem.grid.map((row, rIdx) => (
              row.map((cell, cIdx) => (
                <RavenCell key={`${rIdx}-${cIdx}`} data={cell} />
              ))
            ))}
          </div>
        </motion.div>

        {/* INSTRUCTION */}
        <div className="text-center space-y-1">
          <h3 className="text-slate-300 text-sm font-medium">Chọn mảnh ghép còn thiếu</h3>
          <p className="text-slate-500 text-xs">Phân tích quy luật của các hình</p>
        </div>

        {/* THE OPTIONS (Control Panel) */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 w-full">
          {problem.options.map((opt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <RavenCell
                data={opt}
                onClick={() => handleAnswer(idx)}
                className="hover:-translate-y-1 transition-transform"
              />
            </motion.div>
          ))}
        </div>

      </main>

      <GameFooter />
    </GameLayout>
  );
};

export default MatrixAssessment;
