
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Eye, Zap, ArrowRight } from "lucide-react";

export default function MatrixAssessment() {
  const navigate = useNavigate();

  const games = [
    {
      id: "visual",
      name: "Detail Spotter",
      desc: "Kiểm tra độ tinh mắt & sự chú ý chi tiết.",
      icon: <Eye className="w-8 h-8 text-teal-400" />,
      path: "/assessment/detail-spotter",
      color: "border-teal-500/50"
    },
    {
      id: "logic",
      name: "Rule Switcher",
      desc: "Kiểm tra tư duy logic & độ linh hoạt.",
      icon: <Brain className="w-8 h-8 text-primary" />,
      path: "/assessment/rule-switcher",
      color: "border-primary/50"
    },
    {
      id: "memory",
      name: "Sequence Memory",
      desc: "Kiểm tra trí nhớ ngắn hạn & quy trình.",
      icon: <Zap className="w-8 h-8 text-secondary" />,
      path: "/assessment/sequence-memory",
      color: "border-secondary/50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand font-heading">
            MATRIX ASSESSMENT
          </h1>
          <p className="text-slate-400 font-sans">Chọn một bài kiểm tra năng lực để bắt đầu</p>
        </div>

        {/* Game List */}
        <div className="grid gap-4">
          {games.map((game) => (
            <Card
              key={game.id}
              className={`p-6 bg-slate-900 border ${game.color} hover:bg-slate-800 transition-all cursor-pointer group rounded-2xl`}
              onClick={() => navigate(game.path)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-slate-950 border border-slate-800">
                  {game.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-white font-heading">{game.name}</h3>
                  <p className="text-slate-400 text-sm font-sans">{game.desc}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          ))}
        </div>

        {/* Emergency Link */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm mb-2 font-sans">Đã hoàn thành bài test?</p>
          <Button variant="outline" className="font-heading" onClick={() => navigate("/assessment/result")}>
            Xem Kết Quả Phân Tích
          </Button>
        </div>

      </div>
    </div>
  );
}
