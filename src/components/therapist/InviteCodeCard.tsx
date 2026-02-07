import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeCardProps {
    onCodeGenerated?: (code: string) => void;
}

export const InviteCodeCard = ({ onCodeGenerated }: InviteCodeCardProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const generateRandomCode = () => {
        // Generate e.g., "K9X-2M4"
        const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code.match(/.{1,3}/g)?.join('-') || code;
    };

    const fetchActiveInvite = async () => {
        if (!user) return;
        try {
            const { data, error } = await (supabase as any)
                .from('invitations')
                .select('*')
                .eq('therapist_id', user.id)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setInviteCode(data.code);
                setExpiresAt(data.expires_at);
                if (onCodeGenerated) onCodeGenerated(data.code);
            } else {
                setInviteCode(null);
            }
        } catch (err) {
            console.error("Error fetching invite:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveInvite();
    }, [user]);

    const copyToClipboard = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            toast({
                title: "Đã chép!",
                description: "Mã mời đã được lưu vào bộ nhớ tạm.",
            });
        }
    };

    const createNewInvite = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const newCode = generateRandomCode();

            // Invalidate old active invites first (optional but cleaner)
            await (supabase as any)
                .from('invitations')
                .update({ status: 'expired' })
                .eq('therapist_id', user.id)
                .eq('status', 'active');

            // Create new invite
            const { error } = await (supabase as any)
                .from('invitations')
                .insert({
                    code: newCode,
                    therapist_id: user.id
                });

            if (error) throw error;

            toast({
                title: "Thành công!",
                description: "Đã tạo mã mời mới. Hiệu lực trong 48 giờ.",
            });

            await fetchActiveInvite();

        } catch (err: any) {
            console.error("Error creating invite:", err);
            toast({
                title: "Lỗi tạo mã",
                description: err.message || "Không thể tạo mã mời mới.",
                variant: "destructive"
            });
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
                <CardTitle className="text-lg text-purple-900 dark:text-purple-300 font-bold">Mã mời phụ huynh</CardTitle>
                <CardDescription>Mã dùng một lần để kết nối với phụ huynh. Hiệu lực 48h.</CardDescription>
            </CardHeader>
            <CardContent>
                {inviteCode ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white dark:bg-black border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center relative">
                                <span className="text-3xl font-mono font-black tracking-widest text-purple-600 dark:text-purple-400 select-all">
                                    {inviteCode}
                                </span>
                                {expiresAt && (
                                    <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                        <Clock size={10} />
                                        <span>48h</span>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl shrink-0 border-purple-100 hover:bg-purple-50 hover:text-purple-600 transition-all" onClick={copyToClipboard}>
                                <Copy size={20} />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={createNewInvite}
                            className="w-full text-xs text-muted-foreground hover:text-purple-600"
                        >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Tạo mã khác
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                            <RefreshCw size={18} className="shrink-0" />
                            <p className="font-medium">Chưa có mã đang hoạt động. Hãy tạo mã mới để gửi cho phụ huynh.</p>
                        </div>
                        <Button
                            onClick={createNewInvite}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 dark:shadow-none transition-all gap-2"
                        >
                            <RefreshCw size={18} />
                            Tạo mã mời mới
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
