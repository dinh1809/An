
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "parent" | "therapist";

export const useUserRole = () => {
    const { user, session } = useAuth();
    const [role, setRole] = useState<AppRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) {
                console.log("[useUserRole] No user found");
                setRole(null);
                setLoading(false);
                return;
            }

            console.log("[useUserRole] User ID:", user.id);
            console.log("[useUserRole] User metadata:", user.user_metadata);

            // CÁCH 1: Lấy ngay từ Metadata (Tin cậy nhất cho user mới)
            const metaRole = user.user_metadata?.role || user.app_metadata?.role;
            if (metaRole === "parent" || metaRole === "therapist") {
                console.log("[useUserRole] ✅ Role from metadata:", metaRole);
                setRole(metaRole as AppRole);
                setLoading(false);
                return;
            }

            // CÁCH 2: Query từ profiles table
            console.log("[useUserRole] Metadata không có role, query DB...");
            try {
                // Thêm một chút delay nhỏ để trigger DB hoàn tất (nếu vừa signup)
                const { data, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("user_id", user.id)
                    .maybeSingle();

                console.log("[useUserRole] DB response:", { data, error });

                if (data?.role === "parent" || data?.role === "therapist") {
                    console.log("[useUserRole] ✅ Role from DB:", data.role);
                    setRole(data.role as AppRole);
                    setLoading(false);
                    return;
                }

                if (error) {
                    console.error("[useUserRole] DB Error:", error);
                }
            } catch (e) {
                console.error("[useUserRole] Exception:", e);
            }

            // CÁCH 3: Kiểm tra user_roles table (nếu có)
            try {
                const { data: roleData } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (roleData?.role) {
                    console.log("[useUserRole] ✅ Role from user_roles:", roleData.role);
                    setRole(roleData.role as AppRole);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Ignore
            }

            // CÁCH 4: Fallback - mặc định là parent nếu đã thử mọi cách
            // Nhưng khoan, hãy thử lại một lần cuối sau 1.5s (dành cho user mới đăng ký)
            console.log("[useUserRole] ⚠️ Chưa tìm thấy role, thử lại lần cuối sau 1.5s...");
            await new Promise(resolve => setTimeout(resolve, 1500));

            try {
                const { data: finalCheck } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (finalCheck?.role === "therapist" || finalCheck?.role === "parent") {
                    console.log("[useUserRole] ✅ Role found after retry:", finalCheck.role);
                    setRole(finalCheck.role as AppRole);
                    setLoading(false);
                    return;
                }
            } catch (e) { }

            console.log("[useUserRole] ⚠️ Final role check failed. Returning null role.");
            setRole(null);
            setLoading(false);
        };

        fetchRole();
    }, [user]);

    return { role, loading };
};
