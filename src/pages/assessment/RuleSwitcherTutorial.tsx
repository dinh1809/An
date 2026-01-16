import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Check,
  X,
  ArrowRight,
  Zap,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

type TutorialPhase = "intro" | "color_rule" | "text_rule" | "shape_rule" | "switch_demo" | "ready";
type ColorKey = "red" | "blue" | "yellow" | "green";

interface TutorialCard {
  textContent: ColorKey;
  fontColor: ColorKey;
  correctAnswerForColor: ColorKey;
  correctAnswerForText: ColorKey;
}

const COLORS: Record<ColorKey, { hex: string; bgClass: string; textVi: string }> = {
  red: { hex: "#EF4444", bgClass: "bg-red-500", textVi: "ĐỎ" },
  blue: { hex: "#3B82F6", bgClass: "bg-blue-500", textVi: "XANH DƯƠNG" },
  yellow: { hex: "#EAB308", bgClass: "bg-yellow-500", textVi: "VÀNG" },
  green: { hex: "#22C55E", bgClass: "bg-green-500", textVi: "XANH LÁ" },
};

const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

// Tutorial cards for each phase
const TUTORIAL_CARDS: Record<string, TutorialCard> = {
  color_rule: {
    textContent: "blue", // Word says "XANH DƯƠNG"
    fontColor: "red",    // But it's colored RED
    correctAnswerForColor: "red",
    correctAnswerForText: "blue",
  },
  text_rule: {
    textContent: "green", // Word says "XANH LÁ"
    fontColor: "yellow",  // But it's colored YELLOW
    correctAnswerForColor: "yellow",
    correctAnswerForText: "green",
  },
  switch_demo: {
    textContent: "yellow", // Word says "VÀNG"
    fontColor: "blue",     // But it's colored BLUE
    correctAnswerForColor: "blue",
    correctAnswerForText: "yellow",
  },
};

const RuleSwitcherTutorial = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<TutorialPhase>("intro");
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleBinClick = (binId: ColorKey, correctAnswer: ColorKey) => {
    if (binId === correctAnswer) {
      setShowSuccess(true);
      setShowHint(false);
      setTimeout(() => {
        setShowSuccess(false);
        advancePhase();
      }, 1000);
    } else {
      setShowHint(true);
      setAttempts(a => a + 1);
    }
  };

  const advancePhase = () => {
    setAttempts(0);
    switch (phase) {
      case "intro":
        setPhase("color_rule");
        break;
      case "color_rule":
        setPhase("text_rule");
        break;
      case "text_rule":
        setPhase("switch_demo");
        break;
      case "switch_demo":
        setPhase("ready");
        break;
      case "ready":
        navigate("/assessment/rule-switcher?tutorial=done");
        break;
    }
  };

  const renderCard = (card: TutorialCard) => {
    const textContent = COLORS[card.textContent].textVi;
    const colorHex = COLORS[card.fontColor].hex;

    return (
      <motion.div
        className="w-40 h-52 rounded-2xl bg-card border-2 border-border shadow-xl flex items-center justify-center mx-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span
          className="text-2xl font-black tracking-tight text-center px-3"
          style={{ color: colorHex }}
        >
          {textContent}
        </span>
      </motion.div>
    );
  };

  const renderColorBins = (onClickHandler: (binId: ColorKey) => void, highlightBin?: ColorKey) => {
    return (
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-8">
        {COLOR_KEYS.map((color) => (
          <motion.button
            key={color}
            onClick={() => onClickHandler(color)}
            className={cn(
              "h-16 sm:h-20 rounded-xl flex items-center justify-center text-white font-bold transition-all",
              COLORS[color].bgClass,
              "hover:scale-105 active:scale-95 shadow-lg border-2",
              highlightBin === color ? "border-white ring-4 ring-white/50" : "border-white/20"
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xs sm:text-sm">{COLORS[color].textVi}</span>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* INTRO PHASE */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-slate-800/80 border-orange-500/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-gradient mx-auto mb-6 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>

                  <h1 className="text-2xl font-bold text-white mb-4">
                    Hướng dẫn Stroop Chaos
                  </h1>

                  <p className="text-slate-300 mb-6">
                    Trước khi bắt đầu, hãy làm quen với cách chơi qua vài bước đơn giản.
                  </p>

                  {/* Visual Demo */}
                  <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
                    <p className="text-lg font-black mb-2" style={{ color: COLORS.red.hex }}>
                      XANH DƯƠNG
                    </p>
                    <p className="text-sm text-slate-400">
                      Chữ viết "XANH DƯƠNG" nhưng được tô màu <span className="text-red-400 font-bold">ĐỎ</span>
                    </p>
                  </div>

                  <div className="flex items-start gap-3 text-left bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">
                      Đây là <strong>Hiệu ứng Stroop</strong> - não bạn sẽ bị "xung đột" giữa đọc chữ và nhìn màu. Game này đo khả năng kiểm soát xung đột đó!
                    </p>
                  </div>

                  <Button
                    onClick={advancePhase}
                    className="w-full bg-brand-gradient hover:opacity-90 h-12 text-lg text-white font-heading"
                  >
                    Bắt đầu học <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* COLOR RULE PHASE */}
          {phase === "color_rule" && (
            <motion.div
              key="color_rule"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-slate-800/80 border-red-500/30">
                <CardContent className="pt-6 pb-6">
                  {/* Rule indicator */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Luật 1</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Chọn theo MÀU CHỮ
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Nhìn màu sắc của chữ, <strong>không đọc</strong> nội dung!
                    </p>
                  </div>

                  {/* The card */}
                  {renderCard(TUTORIAL_CARDS.color_rule)}

                  {/* Instruction */}
                  <div className="text-center mt-4 mb-2">
                    <p className="text-white font-medium">
                      Chữ này được tô màu gì? Hãy chọn!
                    </p>
                  </div>

                  {/* Hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 justify-center text-amber-400 text-sm mb-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Không phải! Hãy nhìn <strong>màu sắc</strong> của chữ, không phải nghĩa của nó.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success overlay */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl"
                      >
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-8 h-8" />
                          <span className="text-2xl font-bold">Chính xác!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bins */}
                  {renderColorBins(
                    (binId) => handleBinClick(binId, TUTORIAL_CARDS.color_rule.correctAnswerForColor),
                    showHint ? TUTORIAL_CARDS.color_rule.correctAnswerForColor : undefined
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TEXT RULE PHASE */}
          {phase === "text_rule" && (
            <motion.div
              key="text_rule"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-slate-800/80 border-blue-500/30">
                <CardContent className="pt-6 pb-6">
                  {/* Rule indicator */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Luật 2</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Chọn theo NỘI DUNG CHỮ
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Đọc nghĩa của từ, <strong>bỏ qua</strong> màu sắc!
                    </p>
                  </div>

                  {/* The card */}
                  {renderCard(TUTORIAL_CARDS.text_rule)}

                  {/* Instruction */}
                  <div className="text-center mt-4 mb-2">
                    <p className="text-white font-medium">
                      Chữ này viết gì? Hãy chọn!
                    </p>
                  </div>

                  {/* Hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 justify-center text-amber-400 text-sm mb-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Không phải! Hãy đọc <strong>nội dung</strong> của chữ, không nhìn màu.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success overlay */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl"
                      >
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-8 h-8" />
                          <span className="text-2xl font-bold">Tuyệt vời!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bins */}
                  {renderColorBins(
                    (binId) => handleBinClick(binId, TUTORIAL_CARDS.text_rule.correctAnswerForText),
                    showHint ? TUTORIAL_CARDS.text_rule.correctAnswerForText : undefined
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SWITCH DEMO PHASE */}
          {phase === "switch_demo" && (
            <motion.div
              key="switch_demo"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-slate-800/80 border-purple-500/30">
                <CardContent className="pt-6 pb-6">
                  {/* Switch warning */}
                  <motion.div
                    className="text-center mb-4 p-3 rounded-xl bg-brand-gradient"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: 3, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-white">
                      <Zap className="w-5 h-5" />
                      <span className="font-bold">ĐỔI LUẬT!</span>
                    </div>
                  </motion.div>

                  {/* Rule indicator */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 mb-2">
                      <span className="text-sm font-medium">Bây giờ: Luật MÀU CHỮ</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Luật vừa đổi! Thích nghi ngay!
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Trong game thật, luật sẽ đổi bất ngờ như thế này.
                    </p>
                  </div>

                  {/* The card */}
                  {renderCard(TUTORIAL_CARDS.switch_demo)}

                  {/* Instruction */}
                  <div className="text-center mt-4 mb-2">
                    <p className="text-white font-medium">
                      Luật là MÀU CHỮ - chữ này tô màu gì?
                    </p>
                  </div>

                  {/* Hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 justify-center text-amber-400 text-sm mb-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Luật đã đổi! Bây giờ phải nhìn <strong>màu sắc</strong>, không đọc chữ.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success overlay */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl"
                      >
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-8 h-8" />
                          <span className="text-2xl font-bold">Xuất sắc!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bins */}
                  {renderColorBins(
                    (binId) => handleBinClick(binId, TUTORIAL_CARDS.switch_demo.correctAnswerForColor),
                    showHint ? TUTORIAL_CARDS.switch_demo.correctAnswerForColor : undefined
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* READY PHASE */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-slate-800/80 border-green-500/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-6 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>

                  <h1 className="text-2xl font-bold text-white mb-4">
                    Bạn đã sẵn sàng!
                  </h1>

                  <div className="space-y-3 text-left bg-slate-700/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">Đã hiểu luật MÀU CHỮ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">Đã hiểu luật NỘI DUNG CHỮ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">Đã biết cách xử lý khi đổi luật</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left bg-secondary/5 border border-secondary/20 rounded-lg p-4 mb-6">
                    <AlertTriangle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/80">
                      <p className="font-bold mb-1 text-secondary">Lưu ý khi chơi:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Game kéo dài <strong>90 giây</strong></li>
                        <li>Mỗi lượt có <strong>3 giây</strong> để trả lời</li>
                        <li>Luật đổi <strong>ngẫu nhiên</strong>, không báo trước!</li>
                        <li>Còn có luật <strong>HÌNH DẠNG</strong> trong game thật</li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={advancePhase}
                    className="w-full bg-brand-gradient hover:opacity-90 h-14 text-lg font-bold text-white shadow-lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    BẮT ĐẦU ĐÁNH GIÁ (90s)
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/assessment")}
                    className="w-full mt-3 text-slate-400 hover:text-white"
                  >
                    Quay lại sau
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        {phase !== "intro" && phase !== "ready" && (
          <div className="flex justify-center gap-2 mt-6">
            {["color_rule", "text_rule", "switch_demo"].map((p, i) => (
              <div
                key={p}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  phase === p ? "bg-orange-500 scale-125" :
                    ["color_rule", "text_rule", "switch_demo"].indexOf(phase) > i
                      ? "bg-green-500"
                      : "bg-slate-600"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleSwitcherTutorial;
