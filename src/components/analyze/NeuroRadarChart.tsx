import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { IntelligenceData } from "@/utils/neuroProfile";

interface NeuroRadarChartProps {
  data: IntelligenceData[];
  className?: string;
}

export function NeuroRadarChart({ data, className }: NeuroRadarChartProps) {
  return (
    <Card className={`glass-card overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Neuro-Radar Profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bản đồ trí thông minh đa chiều (Gardner)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <defs>
                <linearGradient id="neuroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <PolarAngleAxis 
                dataKey="subjectVi" 
                tick={{ 
                  fill: "hsl(var(--foreground))", 
                  fontSize: 12,
                  fontWeight: 500
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                formatter={(value: number, name: string, props: any) => {
                  const item = data.find(d => d.subjectVi === props.payload.subjectVi);
                  return [
                    <div key="tooltip" className="space-y-1">
                      <p className="font-semibold">{value}/100</p>
                      <p className="text-xs text-muted-foreground max-w-48">
                        {item?.description}
                      </p>
                    </div>,
                    item?.subject
                  ];
                }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#neuroGradient)"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
