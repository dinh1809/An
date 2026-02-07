/**
 * Dashboard Mock Data
 * Following react:components skill - Data decoupling pattern
 */

export interface DashboardMetrics {
    completedExercises: number;
    totalExercises: number;
    currentMood: 'happy' | 'neutral' | 'sad';
    streakDays: number;
    weeklyCompletionRate: number;
}

export interface ActionCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    timeEstimate: string;
    priority: 'primary' | 'secondary';
    action: string;
}

export interface TherapistInfo {
    id: string;
    name: string;
    credentials: string;
    avatar: string;
    isOnline: boolean;
    lastMessage: string;
    lastMessageTime: string;
}

export interface UpcomingAppointment {
    id: string;
    date: string;
    time: string;
    therapistName: string;
    type: string;
}

// Mock data
export const mockDashboardMetrics: DashboardMetrics = {
    completedExercises: 8,
    totalExercises: 10,
    currentMood: 'happy',
    streakDays: 5,
    weeklyCompletionRate: 85,
};

export const mockActionCards: ActionCard[] = [
    {
        id: 'log-activities',
        title: 'Log Today\'s Activities',
        description: 'Record your child\'s progress and behaviors',
        icon: 'clipboard-list',
        timeEstimate: '5 min',
        priority: 'primary',
        action: '/parent/track',
    },
    {
        id: 'review-notes',
        title: 'Review Therapist Notes',
        description: 'Check latest feedback from your care team',
        icon: 'message-square',
        timeEstimate: '3 min',
        priority: 'secondary',
        action: '/messages',
    },
    {
        id: 'schedule-session',
        title: 'Schedule Next Session',
        description: 'Book your upcoming therapy appointment',
        icon: 'calendar',
        timeEstimate: '2 min',
        priority: 'secondary',
        action: '/parent/map',
    },
];

export const mockTherapist: TherapistInfo = {
    id: 'therapist-1',
    name: 'Dr. Nguyễn Minh',
    credentials: 'Chuyên gia Can thiệp Tự kỷ',
    avatar: '/avatars/therapist-1.jpg',
    isOnline: true,
    lastMessage: 'Bé đã có tiến bộ rõ rệt tuần này!',
    lastMessageTime: '2 hours ago',
};

export const mockUpcomingAppointments: UpcomingAppointment[] = [
    {
        id: 'apt-1',
        date: '2026-01-26',
        time: '14:00',
        therapistName: 'Dr. Nguyễn Minh',
        type: 'Speech Therapy',
    },
    {
        id: 'apt-2',
        date: '2026-01-28',
        time: '10:00',
        therapistName: 'Dr. Trần Hà',
        type: 'Behavioral Assessment',
    },
];

export const emergencyContact = {
    hotline: '1900-xxxx',
    description: 'Hỗ trợ khẩn cấp 24/7',
};
