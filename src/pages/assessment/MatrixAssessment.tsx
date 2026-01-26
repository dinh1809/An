import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateHardRavenProblem, RavenProblem } from '@/lib/raven-logic';
import { RavenCell } from '@/components/matrix/RavenCell';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">

      {/* 1. HEADER: Minimalist */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-teal-500 uppercase tracking-widest">Visual Logic</span>
          <span className="text-sm font-bold text-slate-200">Unit {currentRound} / 10</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Progress Bar - Chạy ngang màn hình */}
      <Progress value={(currentRound / 10) * 100} className="h-0.5 rounded-none bg-slate-900" indicatorClassName="bg-teal-500" />

      {/* 2. MAIN CONTENT */}
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
          <h3 className="text-slate-400 text-sm font-medium">Select the missing piece</h3>
          <p className="text-slate-600 text-xs">Analyze the pattern sequence</p>
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
    </div>
  );
};

export default MatrixAssessment;
