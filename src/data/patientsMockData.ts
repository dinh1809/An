/**
 * Patient Mock Data
 * Realistic Vietnamese patient profiles for Patient Management
 */

export interface Patient {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    level: 1 | 2 | 3; // Support level (1 = High, 2 = Medium, 3 = Low)
    status: 'intake' | 'active' | 'maintenance' | 'discharge';
    guardian: string;
    guardianPhone: string;
    lastSession: Date;
    nextSession: Date | null;
    progress: number; // Percentage
    videosPending: number;
    alertLevel: 'none' | 'low' | 'high';
    notes: string;
}

export const mockPatients: Patient[] = [
    {
        id: '1',
        name: 'Bé Nam',
        age: 5,
        diagnosis: 'ASD Level 1 (Nhẹ)',
        level: 1,
        status: 'active',
        guardian: 'Mẹ Lan',
        guardianPhone: '0912 345 678',
        lastSession: new Date('2026-01-24'),
        nextSession: new Date('2026-01-26'),
        progress: 75,
        videosPending: 2,
        alertLevel: 'none',
        notes: 'Tiến bộ tốt về giao tiếp mắt. Cần tăng cường kỹ năng xã hội.',
    },
    {
        id: '2',
        name: 'Bé Bi',
        age: 4,
        diagnosis: 'ASD Level 2 (Trung bình)',
        level: 2,
        status: 'active',
        guardian: 'Bố Tuấn',
        guardianPhone: '0987 654 321',
        lastSession: new Date('2026-01-23'),
        nextSession: new Date('2026-01-27'),
        progress: 60,
        videosPending: 1,
        alertLevel: 'low',
        notes: 'Phụ huynh cần hỗ trợ thêm về kỹ thuật làm bài tập.',
    },
    {
        id: '3',
        name: 'Bé Hoa',
        age: 6,
        diagnosis: 'ASD Level 1 + ADHD',
        level: 1,
        status: 'active',
        guardian: 'Mẹ Tâm',
        guardianPhone: '0901 234 567',
        lastSession: new Date('2026-01-22'),
        nextSession: new Date('2026-01-28'),
        progress: 85,
        videosPending: 0,
        alertLevel: 'none',
        notes: 'Xuất sắc! Sẵn sàng chuyển sang giai đoạn maintenance.',
    },
    {
        id: '4',
        name: 'Bé Minh',
        age: 7,
        diagnosis: 'ASD Level 3 (Nặng)',
        level: 3,
        status: 'active',
        guardian: 'Bà nội Hương',
        guardianPhone: '0909 876 543',
        lastSession: new Date('2026-01-20'),
        nextSession: new Date('2026-01-25'),
        progress: 40,
        videosPending: 3,
        alertLevel: 'high',
        notes: 'CẢNH BÁO: Thất bại 3 lần liên tiếp bài tập giao tiếp. Cần điều chỉnh kế hoạch.',
    },
    {
        id: '5',
        name: 'Bé An',
        age: 3,
        diagnosis: 'Suspected ASD (Đang đánh giá)',
        level: 2,
        status: 'intake',
        guardian: 'Mẹ Hằng',
        guardianPhone: '0912 111 222',
        lastSession: new Date('2026-01-15'),
        nextSession: new Date('2026-01-29'),
        progress: 20,
        videosPending: 0,
        alertLevel: 'none',
        notes: 'Bệnh nhân mới. Đang trong giai đoạn đánh giá ban đầu.',
    },
    {
        id: '6',
        name: 'Bé Khang',
        age: 8,
        diagnosis: 'ASD Level 1',
        level: 1,
        status: 'maintenance',
        guardian: 'Bố Hải',
        guardianPhone: '0898 765 432',
        lastSession: new Date('2026-01-18'),
        nextSession: new Date('2026-02-01'),
        progress: 95,
        videosPending: 0,
        alertLevel: 'none',
        notes: 'Duy trì tốt. Phiên 1 tháng/lần.',
    },
    {
        id: '7',
        name: 'Bé Thảo',
        age: 5,
        diagnosis: 'ASD Level 2',
        level: 2,
        status: 'active',
        guardian: 'Mẹ Linh',
        guardianPhone: '0933 444 555',
        lastSession: new Date('2026-01-21'),
        nextSession: new Date('2026-01-26'),
        progress: 55,
        videosPending: 1,
        alertLevel: 'low',
        notes: 'Hành vi ăn vạt tăng nhẹ tuần này. Theo dõi thêm.',
    },
];

// Helper functions
export function getPatientsByStatus(status: Patient['status']): Patient[] {
    return mockPatients.filter((p) => p.status === status);
}

export function getPatientsByLevel(level: Patient['level']): Patient[] {
    return mockPatients.filter((p) => p.level === level);
}

export function getHighAlertPatients(): Patient[] {
    return mockPatients.filter((p) => p.alertLevel === 'high');
}

export function getPendingVideoCount(): number {
    return mockPatients.reduce((sum, p) => sum + p.videosPending, 0);
}
