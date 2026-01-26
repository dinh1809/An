import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ModeSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleModeSelect = async (mode: "connect" | "assessment") => {
    if (!user) return;

    setIsLoading(mode);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active_mode: mode })
        .eq("user_id", user.id);

      if (error) throw error;

      if (mode === "connect") {
        navigate("/parent/home");
      } else {
        navigate("/assessment");
      }
    } catch (error: any) {
      console.error("Error updating mode:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật chế độ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Chào mừng đến với <span className="text-primary">An.</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Hôm nay bạn muốn làm gì?
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* An Connect Card */}
          <Card
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-teal-100 hover:border-teal-500 bg-card ${isLoading === "connect" ? "opacity-70 pointer-events-none" : ""
              }`}
            onClick={() => handleModeSelect("connect")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center shadow-sm group-hover:bg-teal-500 group-hover:text-white transition-all">
                <HeartHandshake className="w-10 h-10 text-teal-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-2xl text-teal-700">
                An Connect
              </CardTitle>
              <div className="text-sm font-medium text-teal-600/80">
                Liên lạc & Quản lý
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                Theo dõi lịch trình, nhật ký can thiệp và trao đổi với chuyên gia.
              </CardDescription>
              <div className="mt-6 py-3 px-6 bg-teal-50 rounded-full inline-block group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <span className="text-sm font-medium text-teal-700 group-hover:text-white">
                  {isLoading === "connect" ? "Đang chuyển..." : "Bắt đầu →"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* An Career Card - DEPRECATED */}
          <Card
            className="relative overflow-hidden border-2 border-slate-200 bg-slate-50 opacity-60 pointer-events-none"
          >
            {/* Overlay Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                ĐANG PHÁT TRIỂN
              </div>
            </div>

            {/* Diagonal Stripe Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-slate-300/40 pointer-events-none z-[5]"></div>

            <CardHeader className="text-center pb-4 relative z-0">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
                <BrainCircuit className="w-10 h-10 text-slate-400" />
              </div>
              <CardTitle className="text-2xl text-slate-500">
                An Career
              </CardTitle>
              <div className="text-sm font-medium text-slate-400">
                Đánh giá Năng lực
              </div>
            </CardHeader>
            <CardContent className="text-center relative z-0">
              <CardDescription className="text-base leading-relaxed text-slate-400">
                Bài kiểm tra tiềm năng nghề nghiệp qua trò chơi khoa học.
              </CardDescription>
              <div className="mt-6 py-3 px-6 bg-slate-200 rounded-full inline-block">
                <span className="text-sm font-medium text-slate-500">
                  Sắp ra mắt
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer hint */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          Bạn có thể chuyển đổi giữa hai chế độ bất cứ lúc nào
        </p>
      </div>
    </div>
  );
};

export default ModeSelection;
