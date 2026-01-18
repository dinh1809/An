import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanEye, Music, Radio, ArrowRight, BrainCircuit, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardActionArea } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AssessmentHome = () => {
  const navigate = useNavigate();

  const jobs = [
    {
      id: "visual-analyst",
      title: "Visual Pattern Analyst",
      subtitle: "IQ Logic Focus",
      icon: ScanEye,
      path: "/assessment/matrix",
      color: "text-teal-400",
      bgGradient: "from-teal-500/10 to-transparent",
      border: "border-teal-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]",
      desc: "Analyze visual data patterns. Detect anomalies in production lines."
    },
    {
      id: "sonic-architect",
      title: "Sonic Architecture Intern",
      subtitle: "Musical Intelligence",
      icon: Music,
      path: "/assessment/piano",
      color: "text-pink-400",
      bgGradient: "from-pink-500/10 to-transparent",
      border: "border-pink-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(232,121,249,0.3)]",
      desc: "Reconstruct auditory sequences. Pitch perfect sensitivity required."
    },
    {
      id: "logistics-officer",
      title: "Logistics Dispatch Officer",
      subtitle: "Working Memory",
      icon: Radio,
      path: "/assessment/dispatcher",
      color: "text-amber-400",
      bgGradient: "from-amber-500/10 to-transparent",
      border: "border-amber-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      desc: "High-speed code entry under pressure. Zero latency tolerance."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-12 font-sans selection:bg-teal-500/30">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <BrainCircuit className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                An Career <span className="text-slate-600 font-light">Hub</span>
              </h1>
            </div>
            <p className="text-slate-400 max-w-lg text-lg">
              Select a specialized role simulation to begin your cognitive evaluation.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/assessment/matrix?mode=campaign')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/50"
            >
              <Zap className="w-4 h-4 mr-2 fill-current" />
              Initialize Full Campaign
            </Button>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">System Operational</span>
          </div>
        </div>

        {/* JOB GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {jobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <Card
                className={`group relative overflow-hidden bg-slate-900 border ${job.border} h-full transition-all duration-300 hover:scale-[1.02] ${job.glow} cursor-pointer`}
                onClick={() => navigate(job.path)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${job.bgGradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                <CardContent className="p-8 relative z-10 flex flex-col h-full">

                  {/* Icon & Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl bg-slate-950/50 border border-slate-800 backdrop-blur-sm group-hover:bg-slate-950/80 transition-colors`}>
                      <job.icon className={`w-8 h-8 ${job.color}`} />
                    </div>
                    <Badge variant="outline" className="bg-slate-950/50 backdrop-blur-md border-slate-700 text-slate-400">
                      OPEN POSITION
                    </Badge>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90">
                      {job.title}
                    </h3>
                    <p className={`text-sm font-medium ${job.color} uppercase tracking-wider`}>
                      {job.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 leading-relaxed mb-8 flex-grow">
                    {job.desc}
                  </p>

                  {/* Action */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:translate-x-1 transition-transform duration-300">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FOOTER STATUS */}
        <div className="flex justify-center pt-12 opacity-50">
          <div className="flex flex-col items-center gap-2 text-xs text-slate-600 font-mono text-center">
            <ShieldCheck className="w-5 h-5 mb-1" />
            <p>SECURE CONNECTION ESTABLISHED</p>
            <p>ID: AN-CB-2026-X9</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssessmentHome;
