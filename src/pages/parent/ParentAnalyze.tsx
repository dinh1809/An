
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  Video,
  Lightbulb,
  AlertTriangle,
  Calendar,
  ArrowRight,
  PlayCircle,
  MessageSquare,
  Bot,
  ChevronRight,
  TrendingDown,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const progressData = [
  { week: "Tuần 1", completion: 65, skills: 45, sessions: 4 },
  { week: "Tuần 2", completion: 80, skills: 50, sessions: 5 },
  { week: "Tuần 3", completion: 40, skills: 48, sessions: 2 }, // Red trend
  { week: "Tuần 4", completion: 90, skills: 65, sessions: 6 }, // Improvement
];

const videoFeedback = [
  {
    id: "v1",
    title: "Bài tập Giao tiếp mắt",
    date: "22/01/2024",
    analyst: "BS. Nguyễn Văn An",
    timestamps: [
      { time: "0:45", text: "Bé đã bắt đầu có sự chú ý vào mẹ, rất tốt!", type: "praise" },
      { time: "1:20", text: "Chỗ này mẹ nên hạ thấp tầm mắt xuống chút nữa.", type: "correction" },
      { time: "2:10", text: "Bé duy trì mắt được 3 giây, tiến bộ vượt bậc.", type: "observation" }
    ]
  },
  {
    id: "v2",
    title: "Kỹ năng Bắt chước",
    date: "15/01/2024",
    analyst: "BS. Trần Thanh Bình",
    timestamps: [
      { time: "1:10", text: "Bé bắt chước động tác vỗ tay rất chính xác.", type: "praise" },
    ]
  }
];

const comparisonData = {
  start: { date: "01/01", communication: 40, behavior: 55, physical: 30 },
  end: { date: "15/01", communication: 65, behavior: 60, physical: 45 }
};

export default function ParentAnalyze() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(videoFeedback[0]);
  const [timeRange, setTimeRange] = useState("week");

  // Logic for color coding
  const getTrendColor = (current: number, previous: number) => {
    if (current > previous * 1.1) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (current < previous * 0.9) return "text-red-500 bg-red-50 border-red-100";
    return "text-amber-500 bg-amber-50 border-amber-100";
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous * 1.1) return <TrendingUp className="h-4 w-4" />;
    if (current < previous * 0.9) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <ParentLayout>
      <div className="space-y-8 pb-12">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-black text-[#00695C] tracking-tight">Phân tích Tiến trình</h1>
            <p className="text-muted-foreground font-medium">Theo dõi sự trưởng thành của con từng ngày</p>
          </motion.div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-4 py-1.5 rounded-xl border-primary/20 bg-primary/5 text-primary font-bold">
              Bản tin tháng 1/2024
            </Badge>
          </div>
        </div>

        {/* 1. Early Warning Banner */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm"
          >
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">Cảnh báo sớm</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                Tuần 3 vừa rồi bé Minh Anh luyện tập <strong>ít hơn 50%</strong> so với bình thường. Điều này có thể ảnh hưởng đến đà thăng tiến của kỹ năng giao tiếp. Hãy cố gắng duy trì 15 phút mỗi ngày mẹ nhé!
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 font-bold">
              Xem lịch tập
            </Button>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* 2. Progress Overview Section */}
            <Card className="border-none shadow-xl shadow-[#00695C]/5 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-[#00695C]" /> Tổng quan tiến độ
                  </CardTitle>
                  <CardDescription>Mức độ hoàn thành bài tập và cải thiện kỹ năng</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 rounded-xl bg-muted/50 border-none font-bold">
                    <SelectValue placeholder="Chọn mốc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Theo tuần</SelectItem>
                    <SelectItem value="month">Theo tháng</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00695C" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#00695C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="completion" stroke="#00695C" strokeWidth={3} fillOpacity={1} fill="url(#colorProg)" name="Hoàn thành (%)" />
                      <Area type="monotone" dataKey="skills" stroke="#10b981" strokeWidth={3} fillOpacity={0} name="Kỹ năng (Điểm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { label: "Số buổi tập", value: "17", trend: "+12%", prev: 15, current: 17 },
                    { label: "Hoàn thành", value: "85%", trend: "+5%", prev: 80, current: 85 },
                    { label: "Hành vi kỹ năng", value: "Khá", trend: "Ổn định", prev: 50, current: 52 }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-foreground">{stat.value}</span>
                        <div className={cn(
                          "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border mb-1",
                          getTrendColor(stat.current, stat.prev)
                        )}>
                          {getTrendIcon(stat.current, stat.prev)}
                          <span>{stat.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. Video Practice Analysis */}
            <Card className="border-none shadow-xl shadow-[#00695C]/5 rounded-3xl overflow-hidden bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Video className="text-[#00695C]" /> Phân tích Video thực hành
                </CardTitle>
                <CardDescription>Bấm vào từng mốc thời gian để xem nhận xét của bác sĩ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {videoFeedback.map((v) => (
                    <Button
                      key={v.id}
                      onClick={() => setSelectedVideo(v)}
                      variant={selectedVideo.id === v.id ? "default" : "outline"}
                      className={cn(
                        "rounded-xl h-fit py-3 px-5 flex flex-col items-start gap-1 min-w-[200px]",
                        selectedVideo.id === v.id ? "bg-[#00695C] text-white shadow-lg shadow-[#00695C]/20" : "border-muted text-muted-foreground"
                      )}
                    >
                      <span className="font-bold text-sm">{v.title}</span>
                      <span className="text-[10px] opacity-70">{v.date}</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-video bg-black rounded-2xl relative overflow-hidden group shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&h=450&fit=crop"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-white/80 group-hover:scale-110 transition-transform cursor-pointer" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                      <div className="h-full bg-primary w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Dòng thời gian nhận xét
                    </h4>
                    <div className="space-y-2">
                      {selectedVideo.timestamps.map((ts, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all group"
                        >
                          <div className="flex gap-3">
                            <span className="font-black text-primary text-xs tabular-nums bg-primary/10 px-2 py-1 rounded h-fit">
                              {ts.time}
                            </span>
                            <p className="text-sm font-medium leading-relaxed">
                              {ts.text}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Comparison Section */}
            <Card className="border-none shadow-xl shadow-[#00695C]/5 rounded-3xl overflow-hidden bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="text-[#00695C]" /> So sánh Trước và Sau
                </CardTitle>
                <CardDescription>Chọn mốc thời gian để thấy sự thay đổi rõ rệt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-muted">
                      <p className="text-[10px] font-extrabold text-[#00695C] uppercase mb-1">Thời điểm A (Bắt đầu)</p>
                      <p className="font-bold">01/01/2024</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="h-12 w-px bg-muted-foreground/20 border-dashed border-l" />
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <p className="text-[10px] font-extrabold text-[#00695C] uppercase mb-1">Thời điểm B (Hôm nay)</p>
                      <p className="font-bold">15/01/2024</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Giao tiếp", A: comparisonData.start.communication, B: comparisonData.end.communication },
                        { name: "Hành vi", A: comparisonData.start.behavior, B: comparisonData.end.behavior },
                        { name: "Vận động", A: comparisonData.start.physical, B: comparisonData.end.physical }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="A" fill="#cbd5e1" radius={[10, 10, 0, 0]} name="Bắt đầu" />
                        <Bar dataKey="B" fill="#00695C" radius={[10, 10, 0, 0]} name="Hiện tại" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex justify-center gap-6">
                      <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><div className="h-3 w-3 bg-slate-300 rounded" /> Bắt đầu</span>
                      <span className="flex items-center gap-2 text-xs font-bold text-[#00695C]"><div className="h-3 w-3 bg-[#00695C] rounded" /> Hiện tại</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-900">Chiến thắng của con!</h4>
                    <p className="text-sm text-emerald-700">Kỹ năng giao tiếp tăng từ <strong>40% lên 65%</strong> chỉ sau 2 tuần.</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none font-black text-sm px-4 py-1.5">+25%</Badge>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: AI & Summary */}
          <div className="space-y-8">

            {/* 5. AI Insight Section */}
            <Card className="border-none shadow-2xl shadow-[#00695C]/10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#00695C] to-[#004D40] text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Bot className="h-5 w-5" /> Tóm tắt Thông thái
                </CardTitle>
                <CardDescription className="text-white/60">AI diễn giải dữ liệu chuyên môn sang ngôn ngữ gần gũi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {[
                    "Khả năng bắt chước động tác tay của con đã ổn định và chủ động hơn.",
                    "Sự chú ý vào người đối diện (Joint Attention) có xu hướng tăng đều.",
                    "Con vẫn còn chút lúng túng khi có tiếng ồn lớn xung quanh, cần môi trường yên tĩnh hơn."
                  ].map((insight, i) => (
                    <div key={i} className="flex gap-3 group">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform shrink-0" />
                      <p className="text-sm font-medium leading-relaxed text-white/90 italic">"{insight}"</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">Gợi ý cho cha mẹ</p>
                  <div className="space-y-3">
                    <Card className="bg-white/10 border-none rounded-2xl p-4 group hover:bg-white/20 transition-all cursor-pointer text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Khen ngợi ngay lập tức</span>
                        <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                      </div>
                    </Card>
                    <Card className="bg-white/10 border-none rounded-2xl p-4 group hover:bg-white/20 transition-all cursor-pointer text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Thực hành nơi yên tĩnh</span>
                        <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision Support Widget */}
            <Card className="border-none shadow-xl shadow-[#00695C]/5 rounded-3xl overflow-hidden bg-white p-6">
              <h3 className="font-bold text-lg mb-4">Bạn cần hỗ trợ thêm?</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Dựa trên dữ liệu tuần này, nếu bạn cảm thấy con quá căng thẳng, tốt nhất hãy đặt một buổi tư vấn nhanh với chuyên gia.
              </p>
              <div className="space-y-3">
                <Button className="w-full rounded-2xl bg-white border border-primary text-primary hover:bg-primary/5 font-bold h-12">
                  Nhắn tin cho chuyên gia
                </Button>
                <Button className="w-full rounded-2xl bg-[#00695C] hover:bg-[#004D40] text-white font-black h-12 shadow-lg shadow-[#00695C]/20">
                  Đặt lịch tư vấn 1:1
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
