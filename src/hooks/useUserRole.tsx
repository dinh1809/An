import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "parent" | "therapist";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
      }

      setRole((data?.role as AppRole) || "parent");
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const updateRole = async (newRole: AppRole) => {
    if (!user) return { error: new Error("Not authenticated") };

    // First try to update (in case trigger already created a row)
    const { error: updateError, data: updateData } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", user.id)
      .select();

    if (!updateError && updateData && updateData.length > 0) {
      setRole(newRole);
      return { error: null };
    }

    // If update didn't affect any rows, try insert
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: newRole });

    if (!insertError) {
      setRole(newRole);
    } else {
      console.error("Role update failed:", { updateError, insertError });
    }
    return { error: insertError };
  };

  return { role, loading, updateRole, isTherapist: role === "therapist", isParent: role === "parent" };
}
