
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, UserPlus } from "lucide-react";

interface AddPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const AddPatientDialog = ({ open, onOpenChange, onSuccess }: AddPatientDialogProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !email) return;

        setLoading(true);
        try {
            // 1. Fetch parent's user_id from profiles using email
            // Note: We need a policy that allows therapists to read parent profiles by email
            const { data: parentProfile, error: profileError } = await (supabase
                .from("profiles")
                .select("user_id, full_name, role, email") as any)
                .ilike("email", email.toLowerCase().trim())
                .maybeSingle();

            if (profileError) {
                console.error("Error fetching parent profile:", profileError);
                throw new Error("Lỗi khi tìm kiếm email phụ huynh.");
            }

            if (!parentProfile) {
                toast({
                    title: "Không tìm thấy",
                    description: "Email này chưa được đăng ký trong hệ thống An.",
                    variant: "destructive",
                });
                return;
            }

            // 2. Check if connection already exists
            const { data: existingConnection } = await supabase
                .from("connections")
                .select("id")
                .eq("therapist_id", user.id)
                .eq("parent_id", parentProfile.user_id)
                .maybeSingle();

            if (existingConnection) {
                toast({
                    title: "Thông báo",
                    description: `Bạn đã kết nối với ${parentProfile.full_name || "phụ huynh này"} rồi.`,
                });
                onOpenChange(false);
                return;
            }

            // 3. Insert into connections table
            const { error: insertError } = await supabase
                .from("connections")
                .insert({
                    therapist_id: user.id,
                    parent_id: parentProfile.user_id,
                    status: "accepted", // Auto-accepted when therapist adds by email? Or 'pending'?
                    // Requirement says "Ensure the therapist_patient_connections table (or equivalent) has RLS policies that allow Therapists to INSERT a connection."
                });

            if (insertError) {
                console.error("Error inserting connection:", insertError);
                throw new Error("Không thể tạo kết nối. Vui lòng thử lại.");
            }

            toast({
                title: "Thành công!",
                description: `Đã kết nối với ${parentProfile.full_name || "phụ huynh"}.`,
            });

            setEmail("");
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Đã có lỗi xảy ra.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl overflow-hidden border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-2">
                        <UserPlus className="w-6 h-6 text-[#00695C]" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Thêm bệnh nhân mới</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Nhập email của phụ huynh để kết nối và quản lý hồ sơ của trẻ.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddPatient} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email phụ huynh</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                className="pl-10 h-12 border-slate-200 focus:ring-[#00695C] transition-all rounded-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl font-bold"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !email}
                            className="bg-[#00695C] hover:bg-[#004D40] text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#00695C]/20 transition-all shrink-0"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận kết nối"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
