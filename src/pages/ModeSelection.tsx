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
        navigate("/parent/hub");
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

          {/* An Hướng Nghiệp Card - Career Assessment */}
          <Card
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-purple-100 hover:border-purple-500 bg-card ${isLoading === "assessment" ? "opacity-70 pointer-events-none" : ""
              }`}
            onClick={() => handleModeSelect("assessment")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all">
                <BrainCircuit className="w-10 h-10 text-purple-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-2xl text-purple-700">
                An Hướng Nghiệp
              </CardTitle>
              <div className="text-sm font-medium text-purple-600/80">
                Đánh giá Năng lực
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                Khám phá tiềm năng não bộ qua các trò chơi khoa học. Nhận hồ sơ năng lực cá nhân.
              </CardDescription>
              <div className="mt-6 py-3 px-6 bg-purple-50 rounded-full inline-block group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <span className="text-sm font-medium text-purple-700 group-hover:text-white">
                  {isLoading === "assessment" ? "Đang chuyển..." : "Bắt đầu →"}
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
