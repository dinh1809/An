
// Neurodiversity Career Passport - Vocational Training Mode
// Pivot: Young Adults (18+) - Work Ready
// Focus: Job Simulation, Industrial Habits, Digital Literacy

export type TrainingCategory = "Workplace Simulation" | "Industrial Habits" | "Digital Literacy";

export type TrainingTask = {
    id: string;
    title: string;
    category: TrainingCategory;
    duration: string; // e.g. "15 mins"
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    description: string;
    professionalContext: string; // Why this matters for a job (Transferable Skill)
    icon: "Briefcase" | "ClipboardCheck" | "Clock" | "Laptop";
};

export type VocationalPlan = {
    summary: string;
    focusArea: string;
    dailyTasks: TrainingTask[];
};

export type UserMetrics = {
    visual: number; // 0-100
    logic: number;
    memory: number;
    speed: number;
    focus: number;
};

// --- TRAINING DATABASE (KHO BÀI TẬP NGHỀ) ---
const TRAINING_DATABASE: Record<string, TrainingTask[]> = {
    visual_strengthening: [
        {
            id: "qc_doc_check",
            title: "Thử Thách Soát Lỗi (QC Challenge)",
            category: "Workplace Simulation",
            duration: "10 phút",
            difficulty: "Intermediate",
            description: "In một văn bản mẫu và một bản có lỗi sai chính tả/định dạng. Yêu cầu tìm ra 10 lỗi sai.",
            professionalContext: "Mô phỏng chân thực công việc của nhân viên Kiểm soát chất lượng (QC) và Tester.",
            icon: "ClipboardCheck"
        },
        {
            id: "visual_sorting",
            title: "Phân Loại Linh Kiện",
            category: "Workplace Simulation",
            duration: "15 phút",
            difficulty: "Beginner",
            description: "Trộn lẫn 3 loại hạt/ốc vít khác màu. Yêu cầu phân loại vào 3 hộp riêng biệt với tốc độ cao.",
            professionalContext: "Rèn luyện tốc độ tay và mắt cho dây chuyền lắp ráp công nghiệp.",
            icon: "Briefcase"
        }
    ],
    memory_compensation: [
        {
            id: "sop_compliance",
            title: "Tuân Thủ Quy Trình (SOP)",
            category: "Industrial Habits",
            duration: "20 phút",
            difficulty: "Beginner",
            description: "Dán quy trình 5 bước (ví dụ: Vệ sinh bàn làm việc) lên tường. Yêu cầu thực hiện ĐÚNG thứ tự. Không bỏ bước.",
            professionalContext: "Trong nhà máy, tuân thủ SOP (Standard Operating Procedure) là yêu cầu sống còn.",
            icon: "ClipboardCheck"
        },
        {
            id: "digital_memo",
            title: "Ghi Chú Kỹ Thuật Số",
            category: "Digital Literacy",
            duration: "Suốt ngày",
            difficulty: "Intermediate",
            description: "Sử dụng Note trên điện thoại để ghi lại ngay lập tức mọi hướng dẫn. Không dựa vào trí nhớ.",
            professionalContext: "Kỹ năng quản lý thông tin cơ bản cho mọi nhân viên văn phòng.",
            icon: "Laptop"
        }
    ],
    focus_training: [
        {
            id: "pomodoro_work",
            title: "Deep Work 25'",
            category: "Industrial Habits",
            duration: "25 phút",
            difficulty: "Intermediate",
            description: "Đặt đồng hồ 25 phút. Hoàn thành một việc (chép sách/nhập liệu) mà KHÔNG đụng vào điện thoại.",
            professionalContext: "Rèn luyện tác phong công nghiệp và khả năng tập trung liên tục.",
            icon: "Clock"
        },
        {
            id: "data_entry_sim",
            title: "Nhập Liệu Hóa Đơn",
            category: "Workplace Simulation",
            duration: "20 phút",
            difficulty: "Advanced",
            description: "Lấy 5 hóa đơn siêu thị. Mở Excel và nhập lại: Tên hàng, Số lượng, Giá tiền. Phải chính xác 100%.",
            professionalContext: "Mô phỏng trực tiếp công việc Data Entry Clerk (Nhập liệu).",
            icon: "Laptop"
        }
    ],
    logic_development: [
        {
            id: "excel_sorting",
            title: "Sắp Xếp Dữ Liệu Excel",
            category: "Digital Literacy",
            duration: "15 phút",
            difficulty: "Intermediate",
            description: "Tạo danh sách 20 món đồ. Thực hành chức năng Sort & Filter để lọc ra món đồ theo màu hoặc giá.",
            professionalContext: "Làm quen với tư duy Logic và công cụ quản lý kho vận (Logistics).",
            icon: "Laptop"
        },
        {
            id: "categorize_physical",
            title: "Phân Loại Hồ Sơ",
            category: "Workplace Simulation",
            duration: "20 phút",
            difficulty: "Beginner",
            description: "Tập hợp các giấy tờ cũ trong nhà. Phân loại theo: Hóa đơn điện, Nước, Giấy bảo hành.",
            professionalContext: "Kỹ năng sắp xếp (Organizing) cần thiết cho nhân viên lưu trữ/hành chính.",
            icon: "Briefcase"
        }
    ]
};

const normalize = (val: number) => Math.min(100, Math.max(0, val));

export const generateVocationalPlan = (metrics: UserMetrics): VocationalPlan => {
    const dailyTasks: TrainingTask[] = [];
    let summary = "";
    let focusArea = "";

    // 1. Analyze Weaknesses First (To fix foundation)
    // Low Focus (< 60) -> Industrial Habits (Discipline)
    if (metrics.focus < 60) {
        focusArea = "Rèn Luyện Tác Phong Công Nghiệp";
        summary = "Kết quả cho thấy sự tập trung còn dao động. Để đi làm, chúng ta cần ưu tiên rèn luyện kỷ luật và khả năng làm việc liên tục (Deep Work).";
        dailyTasks.push(...TRAINING_DATABASE.focus_training);
    }
    // Low Memory (< 50) -> Process Compliance (SOP)
    else if (metrics.memory < 50) {
        focusArea = "Tuân Thủ Quy Trình (SOP)";
        summary = "Trí nhớ ngắn hạn không phải rào cản nếu biết cách dùng công cụ. Chúng ta sẽ tập thói quen dùng Checklist văn bản thay vì cố nhớ.";
        dailyTasks.push(...TRAINING_DATABASE.memory_compensation);
    }
    // High Visual (> 80) -> Capitalize on Strength (Visual Works)
    else if (metrics.visual > 80) {
        focusArea = "Phát Triển Kỹ Năng Kiểm Soát Chất Lượng (QC)";
        summary = "Bạn có đôi mắt của một chuyên gia QC. Hãy biến tiềm năng này thành kỹ năng nghề nghiệp thực tế thông qua các bài tập giả lập.";
        dailyTasks.push(...TRAINING_DATABASE.visual_strengthening);
    }
    // Default: General Logic & Digital Skills
    else {
        focusArea = "Kỹ Năng Văn Phòng Cơ Bản";
        summary = "Năng lực của bạn khá đồng đều. Hãy bắt đầu làm quen với các kỹ năng số và sắp xếp công việc logic.";
        dailyTasks.push(...TRAINING_DATABASE.logic_development);
    }

    // Always add one complementary task if list is short
    if (dailyTasks.length < 2) {
        if (metrics.visual > 60) dailyTasks.push(TRAINING_DATABASE.visual_strengthening[1]);
        else dailyTasks.push(TRAINING_DATABASE.focus_training[0]);
    }

    return {
        summary,
        focusArea,
        dailyTasks: dailyTasks.slice(0, 3) // Max 3 tasks/day
    };
};
