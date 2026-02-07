
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeCardProps {
    onCodeGenerated?: (code: string) => void;
}

export const InviteCodeCard = ({ onCodeGenerated }: InviteCodeCardProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Generate a fixed, deterministic code based on user ID
    const getFixedCode = (uid: string) => {
        // Use early part of UUID for stability, or a hash
        // Using the same logic as the DB migration
        return 'DR-' + uid.substring(0, 6).toUpperCase();
    };

    useEffect(() => {
        const fetchCode = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('therapist_code')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) throw error;

                if (data?.therapist_code) {
                    setCode(data.therapist_code);
                    if (onCodeGenerated) onCodeGenerated(data.therapist_code);
                } else {
                    // Fallback to deterministic code if not in DB yet
                    const deterministic = getFixedCode(user.id);
                    setCode(deterministic);

                    // PROACTIVE SYNC: Update DB if code is missing to ensure parents can find it
                    console.log("[InviteCodeCard] Proactively syncing code to DB:", deterministic);
                    await supabase
                        .from('profiles')
                        .update({ therapist_code: deterministic })
                        .eq('user_id', user.id);
                }
            } catch (err) {
                console.error("Error fetching code:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCode();
    }, [user]);

    const copyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            toast({
                title: "Đã chép!",
                description: "Mã kết nối đã được lưu vào bộ nhớ tạm.",
            });
        }
    };

    const generateCode = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // We use the fixed code strategy to ensure permanence
            const fixedCode = getFixedCode(user.id);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ therapist_code: fixedCode })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // Re-fetch to be absolutely sure
            const { data: verified } = await supabase
                .from('profiles')
                .select('therapist_code')
                .eq('user_id', user.id)
                .maybeSingle();

            const finalCode = verified?.therapist_code || fixedCode;
            setCode(finalCode);
            if (onCodeGenerated) onCodeGenerated(finalCode);

            toast({
                title: "Thành công!",
                description: "Mã kết nối cố định của bạn đã được kích hoạt.",
            });
        } catch (err: any) {
            console.error("Error saving code:", err);
            toast({
                title: "Lỗi lưu trữ",
                description: "Không thể lưu mã vào hệ thống. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800">
            <CardContent className="p-8 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
            </CardContent>
        </Card>
    );

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 border-purple-100 dark:border-purple-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-900 dark:text-purple-300 font-bold">Mã kết nối của bạn</CardTitle>
                <CardDescription>Chia sẻ mã này với phụ huynh để bắt đầu theo dõi bệnh nhân.</CardDescription>
            </CardHeader>
            <CardContent>
                {code ? (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white dark:bg-black border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
                            <span className="text-3xl font-mono font-black tracking-widest text-purple-600 dark:text-purple-400 select-all">
                                {code}
                            </span>
                        </div>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl shrink-0 border-purple-100 hover:bg-purple-50 hover:text-purple-600 transition-all" onClick={copyToClipboard}>
                            <Copy size={20} />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-purple-600 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-100 dark:border-purple-800 flex items-center gap-3">
                            <RefreshCw size={18} className="shrink-0" />
                            <p className="font-medium">Chưa tìm thấy mã kết nối. Bạn cần tạo mã để có thể kết nối với phụ huynh.</p>
                        </div>
                        <Button
                            onClick={generateCode}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 dark:shadow-none transition-all gap-2"
                        >
                            <RefreshCw size={18} />
                            Tạo mã ngay
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
