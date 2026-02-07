import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video, FileText, AlertCircle } from "lucide-react";

interface AssignExerciseModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientIds: string[]; // Can be one or multiple
    patientNames: string; // For display, e.g., "Bé Minh Anh" or "3 bệnh nhân"
}

export function AssignExerciseModal({
    isOpen,
    onOpenChange,
    patientIds,
    patientNames,
}: AssignExerciseModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        notes: "",
        video_url: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || patientIds.length === 0) return;

        setLoading(true);
        try {
            const exercisesToInsert = patientIds.map((patientId) => ({
                user_id: patientId,
                therapist_id: user.id,
                doctor_name: user.email || "Therapist", // Fallback if name not in user object
                title: formData.title,
                description: formData.description,
                notes: formData.notes,
                video_url: formData.video_url,
                assigned_at: new Date().toISOString(),
                is_completed: false,
            }));

            const { error } = await supabase.from("exercises").insert(exercisesToInsert);

            if (error) throw error;

            toast({
                title: "Thành công! 🎉",
                description: `Đã giao bài tập cho ${patientNames}.`,
            });

            setFormData({ title: "", description: "", notes: "", video_url: "" });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Assign Exercise Error:", error);
            toast({
                title: "Lỗi",
                description: error.message || "Không thể giao bài tập. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-teal-600" />
                        Giao bài tập mới
                    </DialogTitle>
                    <DialogDescription>
                        Giao bài tập cho: <span className="font-semibold text-slate-900">{patientNames}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold">Tên bài tập</Label>
                        <Input
                            id="title"
                            placeholder="VD: Tập tương tác ánh mắt hằng ngày"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">Hướng dẫn chi tiết</Label>
                        <Textarea
                            id="description"
                            placeholder="Các bước thực hiện bài tập..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            className="min-h-[100px] rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            Lưu ý quan trọng
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Những điều cần tránh hoặc mẹo nhỏ..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[60px] rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="video" className="text-sm font-semibold flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-blue-500" />
                            Video mẫu (Link YouTube)
                        </Label>
                        <Input
                            id="video"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            className="rounded-xl border-slate-200"
                        />
                        <p className="text-[10px] text-slate-400">Dán link YouTube để phụ huynh có thể xem video mẫu trực tiếp.</p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl"
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Giao bài tập"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
