import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Briefcase } from "lucide-react";
import { TopStrength } from "@/utils/neuroProfile";
import { motion } from "framer-motion";

interface TopStrengthCardProps {
  strength: TopStrength;
  className?: string;
}

export function TopStrengthCard({ strength, className }: TopStrengthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className={`glass-card border-primary/20 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">Điểm mạnh nhất</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {strength.score}/100
                </Badge>
              </div>
              <p className="text-xl font-bold text-gradient mb-2">
                {strength.nameVi}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {strength.recommendation}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>Nghề nghiệp phù hợp:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strength.careers.map((career, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-muted/50"
                    >
                      {career}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
