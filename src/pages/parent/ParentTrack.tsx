import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Smile,
  Meh,
  Frown,
  Upload,
  Video,
  Calendar,
  Plus,
  Sparkles,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BehaviorLog {
  id: string;
  mood: string;
  note: string | null;
  logged_at: string;
}

interface VideoUpload {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
  duration_seconds: number | null;
}

interface ClinicalReport {
  id: string;
  content: string;
  status: string;
  created_at: string;
  therapist_id: string;
}

const moodOptions = [
  { value: "happy", icon: Smile, label: "Vui vẻ", color: "text-green-500" },
  { value: "neutral", icon: Meh, label: "Bình thường", color: "text-gray-500" },
  { value: "sad", icon: Frown, label: "Buồn", color: "text-red-500" },
];

export default function ParentTrack() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [videos, setVideos] = useState<VideoUpload[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    const [logsRes, videosRes, reportsRes] = await Promise.all([
      supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
      supabase
        .from("video_uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("clinical_reports" as any)
        .select("*")
        .eq("patient_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

    if (logsRes.data) setLogs(logsRes.data);
    if (videosRes.data) setVideos(videosRes.data);
    if (reportsRes.data) setReports(reportsRes.data as ClinicalReport[]);
    setLoading(false);
  };

  const handleLogMood = async () => {
    if (!selectedMood || !user) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("behavior_logs").insert({
      user_id: user.id,
      mood: selectedMood,
      note: note || null,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lưu cảm xúc. Vui lòng thử lại.",
      });
    } else {
      toast({
        title: "Thành công!",
        description: "Nhật ký cảm xúc đã được lưu.",
      });
      setSelectedMood(null);
      setNote("");
      fetchData();
    }

    setIsSubmitting(false);
  };

  if (authLoading || loading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">The dõi Tiến độ</h1>
          <p className="text-muted-foreground">Nhật ký cảm xúc và phản hồi từ chuyên gia.</p>
        </div>

        {/* AI Reports Section (NEW) */}
        {reports.length > 0 && (
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Sparkles className="h-5 w-5" />
                Nhận xét từ Chuyên gia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-black/20 border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">
                      Báo cáo Tiến độ
                    </h4>
                    <p className="text-xs text-gray-500">
                      {format(new Date(report.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-purple-600">Xem chi tiết</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mood Logger */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Cảm xúc hôm nay thế nào?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMood === mood.value
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <mood.icon className={`h-10 w-10 ${mood.color}`} />
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="note"
                placeholder="Chia sẻ thêm về ngày hôm nay của bé..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleLogMood}
              disabled={!selectedMood || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Nhật Ký"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Logs & Videos */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Lịch sử Cảm xúc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có nhật ký nào.
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const moodData = moodOptions.find((m) => m.value === log.mood);
                    const MoodIcon = moodData?.icon || Meh;
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <MoodIcon className={`h-6 w-6 flex-shrink-0 ${moodData?.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {format(new Date(log.logged_at), "dd/MM, HH:mm")}
                          </p>
                          {log.note && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {log.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video Đã Tải Lên
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Chưa có video nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <Video className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{video.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(video.created_at), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-700">Chi tiết Báo cáo</DialogTitle>
              <DialogDescription>
                {selectedReport && format(new Date(selectedReport.created_at), "'Ngày' dd 'tháng' MM, yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{selectedReport?.content || ""}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ParentLayout>
  );
}
