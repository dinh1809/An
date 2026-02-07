import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Shuffle,
  Music,
  CheckCircle2,
  Circle,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface GameCompletionStatusProps {
  detailSpotter: boolean;
  chaosSwitcher: boolean;
  sequenceMaster: boolean;
  total: number;
  className?: string;
}

export function GameCompletionStatus({
  detailSpotter,
  chaosSwitcher,
  sequenceMaster,
  total,
  className
}: GameCompletionStatusProps) {
  const navigate = useNavigate();

  const games = [
    {
      name: "Detail Spotter",
      nameVi: "Tìm chi tiết",
      completed: detailSpotter,
      icon: Eye,
      route: "/assessment/detail-spotter"
    },
    {
      name: "Chaos Switcher",
      nameVi: "Stroop Chaos",
      completed: chaosSwitcher,
      icon: Shuffle,
      route: "/assessment/rule-switcher/tutorial"
    },
    {
      name: "Sequence Master",
      nameVi: "Trí nhớ chuỗi",
      completed: sequenceMaster,
      icon: Music,
      route: "/assessment/sequence-memory"
    },
  ];

  if (total === 3) return null; // All games completed, don't show this card

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={`glass-card border-secondary/30 bg-secondary/5 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-secondary font-bold text-sm">{total}/3</span>
            </div>
            <div>
              <h3 className="font-semibold">Hoàn thành đánh giá</h3>
              <p className="text-xs text-muted-foreground">
                Chơi đủ 3 game để có kết quả chính xác nhất
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.name}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-3">
                  {game.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex items-center gap-2">
                    <game.icon className="h-4 w-4 text-primary" />
                    <span className={game.completed ? "text-muted-foreground" : "font-medium"}>
                      {game.nameVi}
                    </span>
                  </div>
                </div>
                {!game.completed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(game.route)}
                    className="text-primary"
                  >
                    Chơi <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
