/**
 * Therapist Mock Data
 * Realistic data for populating therapist portal screens
 */

export interface Patient {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    level: 1 | 2 | 3;
    status: 'active' | 'maintenance' | 'hold';
    lastSession: string;
    nextSession: string | null;
    progressPercentage: number;
}

export interface Mission {
    id: string;
    type: 'video_review' | 'plan_update' | 'parent_meeting' | 'report_due';
    priority: 'urgent' | 'medium' | 'low';
    title: string;
    description: string;
    badge?: string;
    time?: string;
    patientId?: string;
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    target?: string;
}

// Mock Patients
export const mockPatients: Patient[] = [
    {
        id: '1',
        name: 'Bé Nam',
        age: 5,
        diagnosis: 'ASD Level 2',
        level: 2,
        status: 'active',
        lastSession: '2026-01-24',
        nextSession: '2026-01-27',
        progressPercentage: 65,
    },
    {
        id: '2',
        name: 'Bé Bi',
        age: 4,
        diagnosis: 'ASD Level 1',
        level: 1,
        status: 'active',
        lastSession: '2026-01-23',
        nextSession: '2026-01-26',
        progressPercentage: 80,
    },
    {
        id: '3',
        name: 'Bé Hoa',
        age: 6,
        diagnosis: 'ASD Level 2 + ADHD',
        level: 2,
        status: 'active',
        lastSession: '2026-01-22',
        nextSession: '2026-01-25 14:00',
        progressPercentage: 45,
    },
];

// Mock Missions for Dashboard
export const mockMissions: Mission[] = [
    {
        id: '1',
        type: 'video_review',
        priority: 'urgent',
        title: 'Duyệt Video - Bé Nam',
        description: 'Phụ huynh đã nộp 3 video bài tập giao tiếp',
        badge: '3 clip chờ',
        patientId: '1',
    },
    {
        id: '2',
        type: 'plan_update',
        priority: 'medium',
        title: 'Cập nhật kế hoạch - Bé Bi',
        description: 'Kế hoạch tháng 2 cần được điều chỉnh',
        badge: 'Hết hạn ngày mai',
        patientId: '2',
    },
    {
        id: '3',
        type: 'parent_meeting',
        priority: 'medium',
        title: 'Họp phụ huynh - Bé Hoa',
        description: 'Buổi họp định kỳ tháng',
        time: '14:00',
        patientId: '3',
    },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
    {
        id: '1',
        timestamp: '10 phút trước',
        actor: 'Cô Lan',
        action: 'đã thêm bài tập mới',
        target: 'cho Bé Nam',
    },
    {
        id: '2',
        timestamp: '1 giờ trước',
        actor: 'Mẹ Bi',
        action: 'đã nộp video',
        target: 'Bài tập giao tiếp',
    },
    {
        id: '3',
        timestamp: '2 giờ trước',
        actor: 'Thầy Hùng',
        action: 'đã cập nhật ghi chú',
        target: 'cho Bé Hoa',
    },
    {
        id: '4',
        timestamp: 'Hôm qua',
        actor: 'BS. Minh',
        action: 'đã phê duyệt kế hoạch',
        target: 'cho Bé Lan',
    },
];

// Mock Schedule
export interface ScheduleItem {
    id: string;
    time: string;
    patient: string;
    type: string;
    status: 'completed' | 'upcoming' | 'in-progress';
}

export const mockSchedule: ScheduleItem[] = [
    {
        id: '1',
        time: '09:00 - 10:00',
        patient: 'Bé An',
        type: 'Can thiệp cá nhân',
        status: 'completed',
    },
    {
        id: '2',
        time: '10:30 - 11:30',
        patient: 'Bé Bình',
        type: 'Đánh giá tháng',
        status: 'completed',
    },
    {
        id: '3',
        time: '14:00 - 15:00',
        patient: 'Bé Hoa',
        type: 'Họp phụ huynh',
        status: 'upcoming',
    },
    {
        id: '4',
        time: '15:30 - 16:30',
        patient: 'Bé Diệu',
        type: 'Can thiệp cá nhân',
        status: 'upcoming',
    },
];
