import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanEye, Music, Radio, ArrowRight, BrainCircuit,
  ShieldCheck, Zap, Briefcase, GraduationCap, Target, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AssessmentHome = () => {
  const navigate = useNavigate();

  const trainingModules = [
    {
      id: "detail-spotter",
      title: "Detail Spotter",
      icon: ScanEye,
      path: "/assessment/detail-spotter",
      color: "text-emerald-400",
      desc: "Visual search & pattern recognition."
    },
    {
      id: "stroop-chaos",
      title: "Stroop Chaos",
      icon: Target,
      path: "/assessment/rule-switcher/tutorial",
      color: "text-sky-400",
      desc: "Cognitive flexibility & inhibition."
    },
    {
      id: "seq-memory",
      title: "Sequence Master",
      icon: BrainCircuit,
      path: "/assessment/sequence-memory",
      color: "text-purple-400",
      desc: "Working memory capacity test."
    },
    {
      id: "visual-logic",
      title: "Visual Logic",
      icon: Zap,
      path: "/assessment/matrix",
      color: "text-amber-400",
      desc: "Raven's Progressive Matrices analysis."
    },
    {
      id: "dispatcher",
      title: "Dispatcher Console",
      icon: Radio,
      path: "/assessment/dispatcher",
      color: "text-rose-400",
      desc: "Multi-tasking & cognitive endurance."
    },
    {
      id: "piano-sonic",
      title: "Sonic Conservatory",
      icon: Music,
      path: "/assessment/piano",
      color: "text-indigo-400",
      desc: "Auditory processing & melodic memory."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <BrainCircuit className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
                Career <span className="text-indigo-500">Gateway</span>
              </h1>
            </div>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
              Duy trì phong độ não bộ qua tập luyện và bắt đầu kiếm thu nhập tại Nhà máy số.
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 border-slate-700 bg-slate-900/50 text-slate-400 font-mono">
            VPI STATUS: CALIBRATED
          </Badge>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* COLUMN 1: TRAINING CENTER */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Trung tâm Đào tạo</h2>
            </div>

            <div className="grid gap-4">
              {trainingModules.map((module) => (
                <Card
                  key={module.id}
                  className="bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  onClick={() => navigate(module.path)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-slate-950/50 border border-slate-800 group-hover:scale-110 transition-transform`}>
                        <module.icon className={`w-6 h-6 ${module.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-xs text-slate-500">{module.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 h-14 text-base"
              onClick={() => navigate('/assessment/matrix?mode=campaign')}
            >
              <Zap className="w-4 h-4 mr-2 text-indigo-400 fill-indigo-400" />
              Bắt đầu Chiến dịch Đánh giá Toàn diện
            </Button>
          </div>

          {/* COLUMN 2: DIGITAL FACTORY */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Nhà máy số (Work)</h2>
            </div>

            <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border-slate-700/50 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase className="w-48 h-48 -mr-12 -mt-12 text-indigo-500" />
              </div>

              <CardHeader className="p-8 pb-4 relative z-10">
                <Badge className="w-fit bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4 animate-pulse">
                  SYSTEM ACTIVE
                </Badge>
                <CardTitle className="text-3xl font-bold text-white mb-2">Neuro-Inclusive Digital Factory</CardTitle>
                <CardDescription className="text-slate-400 text-lg leading-relaxed">
                  Tận dụng khả năng tập trung cao độ của bạn để xử lý dữ liệu thực tế cho các đối tác AI. Kiếm thu nhập dựa trên độ chính xác.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4 relative z-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase font-mono mb-1">Available Tasks</p>
                    <p className="text-2xl font-bold text-white">450+</p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase font-mono mb-1">Avg Pay/Task</p>
                    <p className="text-2xl font-bold text-white">2.5 AN</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] group-hover:scale-[1.02] transition-transform"
                  onClick={() => navigate('/workspace/task')}
                >
                  VÀO LÀM VIỆC NGAY
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>

                <p className="text-center text-xs text-slate-600 font-mono pt-4">
                  SECURE WORKSPACE PROTOCOLO v4.1 ACTIVATED
                </p>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="pt-12 flex flex-col items-center gap-4 opacity-30">
          <ShieldCheck className="w-6 h-6 text-slate-400" />
          <p className="text-xs font-mono text-slate-500 tracking-widest text-center">
            CORE BRAIN: AN-AI-v4 • NODE: HANOI_01 • ENCRYPTION: AES-256
          </p>
        </footer>

      </div>
    </div>
  );
};

export default AssessmentHome;
