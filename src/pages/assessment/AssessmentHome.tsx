import { useNavigate } from "react-router-dom";
import { BrainCircuit, Gamepad2, Target, Trophy, Eye, Brain, Lightbulb, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const AssessmentHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gradient mb-4 shadow-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-heading">
            An Career
          </h1>
          <p className="text-muted-foreground">
            Khám phá tiềm năng qua trò chơi khoa học
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6 border-primary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-heading">
              <Target className="w-5 h-5 text-primary" />
              Tiến độ của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-sans">Hoàn thành</span>
                <span className="font-medium text-foreground">0 / 5 bài</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 font-heading">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Các bài đánh giá
          </h2>

          <div className="grid gap-4">
            {/* Game 1 - Detail Spotter */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary hover:scale-[1.02] bg-card"
              onClick={() => navigate("/assessment/detail-spotter")}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">Detail Spotter</CardTitle>
                      <CardDescription className="font-sans">Đánh giá khả năng quan sát chi tiết</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-heading">
                    Chơi ngay
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Game 2 - Stroop Chaos */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-secondary hover:scale-[1.02] bg-card"
              onClick={() => navigate("/assessment/rule-switcher/tutorial")}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">Stroop Chaos</CardTitle>
                      <CardDescription className="font-sans">Đánh giá khả năng kiềm chế xung động</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-heading">
                    Chơi ngay
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Game 3 - Sequence Memory */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-primary/60 hover:scale-[1.02] bg-card"
              onClick={() => navigate("/assessment/sequence-memory")}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">Sequence Master</CardTitle>
                      <CardDescription className="font-sans">Đánh giá trí nhớ tuần tự</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary/80 hover:bg-primary text-white font-heading">
                    Chơi ngay
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Matrix Mode - Special */}
            <Card
              className="cursor-pointer hover:shadow-md transition-all border-2 border-dashed border-primary/30 hover:border-primary hover:scale-[1.02] bg-card"
              onClick={() => navigate("/assessment/matrix")}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">Matrix Mode</CardTitle>
                      <CardDescription className="font-sans">Đánh giá Cognitive Agility tổng hợp</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" className="bg-brand-gradient hover:opacity-90 text-white font-heading border-0">
                    Thử ngay
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Achievement hint */}
        <div className="mt-8 p-4 bg-muted/20 rounded-xl text-center">
          <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-sans">
            Hoàn thành tất cả bài đánh giá để nhận báo cáo chi tiết
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHome;
