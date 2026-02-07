/**
 * 🎮 TRUNG TÂM HUẤN LUYỆN - ASSESSMENT HOME
 * ==========================================
 * Vietnamese Mission Control Dashboard
 * 
 * REDESIGNED: Based on Stitch UI design
 * Features: Hero Banner, Glassmorphism Cards, Progress Stats
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanEye,
  Music,
  Radio,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Rocket,
  Target,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  Package,
  Shuffle,
  CheckCircle2,
  Circle,
  Play,
  Lock,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface GameModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  gradient: string;
  iconColor: string;
  bgColor: string;
  status: "completed" | "in-progress" | "not-started" | "locked";
  duration: string;
  tag?: string;
}

// ============================================================================
// DATA
// ============================================================================

const BASIC_MODULES: GameModule[] = [
  {
    id: "detail-spotter",
    title: "Thợ Săn Chi Tiết",
    description: "Rèn luyện khả năng quan sát và nhận diện mẫu",
    icon: ScanEye,
    path: "/assessment/detail-spotter",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    status: "not-started",
    duration: "5 phút"
  },
  {
    id: "stroop-chaos",
    title: "Hỗn Loạn Stroop",
    description: "Kiểm tra độ linh hoạt tư duy và ức chế xung động",
    icon: Target,
    path: "/assessment/rule-switcher/tutorial",
    gradient: "from-sky-500 to-cyan-500",
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-500",
    status: "not-started",
    duration: "4 phút"
  },
  {
    id: "sequence-memory",
    title: "Bậc Thầy Chuỗi Số",
    description: "Đo lường dung lượng trí nhớ làm việc",
    icon: BrainCircuit,
    path: "/assessment/sequence-memory",
    gradient: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
    status: "not-started",
    duration: "6 phút"
  },
  {
    id: "visual-logic",
    title: "Logic Hình Ảnh",
    description: "Phân tích Ma trận Raven - Tư duy logic",
    icon: Zap,
    path: "/assessment/matrix_logic",
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    status: "not-started",
    duration: "8 phút"
  },
  {
    id: "dispatcher",
    title: "Điều Phối Viên",
    description: "Quản lý đa nhiệm và độ bền nhận thức",
    icon: Radio,
    path: "/assessment/dispatcher",
    gradient: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-500",
    status: "not-started",
    duration: "7 phút"
  },
  {
    id: "sonic",
    title: "Nhà Soạn Nhạc",
    description: "Xử lý thính giác và trí nhớ giai điệu",
    icon: Music,
    path: "/assessment/piano",
    gradient: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    status: "not-started",
    duration: "5 phút"
  }
];

const ADVANCED_MODULES: GameModule[] = [
  {
    id: "time-warp-cargo",
    title: "Kho Thời Gian",
    description: "Trí nhớ làm việc N-Back thích ứng",
    icon: Package,
    path: "/assessment/advanced/time-warp-cargo",
    gradient: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
    status: "not-started",
    duration: "8 phút",
    tag: "N-BACK"
  },
  {
    id: "command-override",
    title: "Vượt Qua Lệnh",
    description: "Kiểm soát xung động - Stroop nâng cao",
    icon: ShieldCheck,
    path: "/assessment/advanced/command-override",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    status: "not-started",
    duration: "6 phút",
    tag: "STROOP"
  },
  {
    id: "flux-matrix",
    title: "Ma Trận Biến Đổi",
    description: "Tư duy linh hoạt - Đổi quy tắc ẩn",
    icon: Shuffle,
    path: "/assessment/advanced/flux-matrix",
    gradient: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    status: "not-started",
    duration: "10 phút",
    tag: "WCST"
  }
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface GameCardProps {
  module: GameModule;
  onClick: () => void;
  index: number;
}

const GameCard = ({ module, onClick, index }: GameCardProps) => {
  const StatusIcon = module.status === "completed" ? CheckCircle2
    : module.status === "locked" ? Lock
      : Circle;

  const statusConfig = {
    completed: { color: "text-emerald-500", bg: "bg-emerald-500/10", text: "Hoàn thành" },
    "in-progress": { color: "text-amber-500", bg: "bg-amber-500/10", text: "Đang làm" },
    "not-started": { color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-500/10", text: "Chưa làm" },
    locked: { color: "text-slate-400", bg: "bg-slate-500/10", text: "Khóa" }
  };

  const status = statusConfig[module.status];
  const isLocked = module.status === "locked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={cn(
          "group h-full overflow-hidden transition-all duration-300",
          "bg-white border border-slate-200",
          isLocked
            ? "opacity-50 cursor-not-allowed bg-slate-50"
            : "cursor-pointer hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10"
        )}
        onClick={isLocked ? undefined : onClick}
      >
        <CardContent className="p-5 h-full flex flex-col justify-center">
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div className={cn(
              "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br shadow-sm",
              module.gradient,
              "group-hover:scale-105 transition-transform duration-300"
            )}>
              <module.icon className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">
                  {module.title}
                </h3>
                {module.tag && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 border-purple-200 text-purple-700 bg-purple-50 font-bold shrink-0 mt-0.5"
                  >
                    {module.tag}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {module.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{module.duration}</span>
                </div>
                <div className={cn("flex items-center gap-1.5 text-xs font-bold", status.color)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{status.text}</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 self-center">
              <ChevronRight className={cn(
                "w-6 h-6 transition-all",
                isLocked
                  ? "text-slate-300"
                  : "text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AssessmentHome = () => {
  const navigate = useNavigate();

  // TODO: Fetch real user data from Supabase
  const userData = {
    name: "Học viên",
    completedGames: 0,
    totalGames: 9,
    level: "Khởi đầu"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ============ STICKY HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate('/parent/hub')}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 rotate-180" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              Trung Tâm Huấn Luyện
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="hidden sm:flex bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-0 gap-1">
              <TrendingUp className="w-3 h-3" />
              {userData.completedGames}/{userData.totalGames}
            </Badge>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO BANNER ============ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-teal-500 to-purple-500 py-10 sm:py-16 text-white text-center"
      >
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-6"
          >
            <Rocket className="w-8 h-8" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-4xl font-bold mb-3"
          >
            Khám phá tiềm năng não bộ của bạn
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-teal-100 mb-6"
          >
            Mỗi thử thách là một bước tiến!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {userData.completedGames}/{userData.totalGames} hoàn thành
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Cấp độ: {userData.level}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">

        {/* SECTION 1: BASIC GAMES */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-500/30">
              1
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Khởi Động
            </h2>
            <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-0">
              CƠ BẢN
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {BASIC_MODULES.map((module, index) => (
              <GameCard
                key={module.id}
                module={module}
                index={index}
                onClick={() => navigate(module.path)}
              />
            ))}
          </div>
        </section>

        {/* SECTION 2: ADVANCED GAMES */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30">
              2
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Chuyên Sâu
            </h2>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-0">
              NÂNG CAO
            </Badge>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 pl-11">
            Bài test thích ứng - Độ khó tự động tăng theo năng lực.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {ADVANCED_MODULES.map((module, index) => (
              <GameCard
                key={module.id}
                module={module}
                index={index + BASIC_MODULES.length}
                onClick={() => navigate(module.path)}
              />
            ))}
          </div>
        </section>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            className={cn(
              "w-full h-14 text-base font-semibold",
              "bg-gradient-to-r from-teal-500 to-purple-500",
              "hover:from-teal-600 hover:to-purple-600",
              "text-white shadow-lg shadow-teal-500/30",
              "transition-all duration-300 hover:scale-[1.02]"
            )}
            onClick={() => navigate("/assessment/matrix?mode=campaign")}
          >
            <Play className="w-5 h-5 mr-2" />
            Bắt Đầu Đánh Giá Toàn Diện
          </Button>
        </motion.div>

      </div>

      {/* ============ FOOTER ============ */}
      <motion.footer
        className="py-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-xs font-mono tracking-wider">
            AN PLATFORM • PHIÊN BẢN 4.0 • BẢO MẬT AES-256
          </p>
        </div>
      </motion.footer>

    </div>
  );
};

export default AssessmentHome;
