
import { supabase } from "@/integrations/supabase/client";

export const seedDashboardData = async (userId: string) => {
    console.log("🌱 Starting seed data injection for:", userId);

    // 1. Seed Exercises
    const exercises = [
        {
            user_id: userId,
            title: "Thiền buông thư",
            doctor_name: "Dr. An AI",
            is_completed: true,
            assigned_at: new Date().toISOString()
        },
        {
            user_id: userId,
            title: "Viết nhật ký cảm xúc",
            doctor_name: "Dr. Nguyễn Minh",
            is_completed: false,
            assigned_at: new Date().toISOString()
        },
        {
            user_id: userId,
            title: "Đi bộ 15 phút",
            doctor_name: "Coach Hùng",
            is_completed: false,
            assigned_at: new Date().toISOString()
        }
    ];

    const { error: exerciseError } = await supabase
        .from("exercises")
        .insert(exercises);

    if (exerciseError) console.error("Error seeding exercises:", exerciseError);
    else console.log("✅ Exercises seeded");

    // 2. Seed Behavior Log (Mood)
    const { error: moodError } = await supabase
        .from("behavior_logs")
        .insert({
            user_id: userId,
            mood: "happy",
            note: "Cảm thấy tích cực sau khi thiền",
            logged_at: new Date().toISOString()
        });

    if (moodError) console.error("Error seeding mood:", moodError);
    else console.log("✅ Mood seeded");

    // 3. Seed Appointment
    // First find any therapist
    const { data: therapists } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "therapist")
        .limit(1);

    const therapistId = therapists && therapists.length > 0 ? therapists[0].id : userId; // Fallback to self if no therapist

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(14, 0, 0, 0);

    const endTime = new Date(nextDay);
    endTime.setHours(15, 0, 0, 0);

    const { error: aptError } = await supabase
        .from("appointments")
        .insert({
            parent_id: userId,
            therapist_id: therapistId,
            start_time: nextDay.toISOString(),
            end_time: endTime.toISOString(),
            status: "booked",
            title: "Buổi tư vấn định kỳ"
        });

    if (aptError) console.error("Error seeding appointment:", aptError);
    else console.log("✅ Appointment seeded");

    return true;
};
