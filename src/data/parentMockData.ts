/**
 * Parent Mock Data
 * Realistic data for populating parent portal screens
 */

export interface DailyQuest {
    id: string;
    title: string;
    description: string;
    type: 'exercise' | 'video' | 'journal' | 'reading';
    duration: number; // minutes
    status: 'pending' | 'completed' | 'locked';
    icon: string;
}

export interface ChildProgress {
    childName: string;
    age: number;
    weeklyProgress: number; // percentage
    streakDays: number;
    totalExercises: number;
    completedExercises: number;
}

export interface VideoMemory {
    id: string;
    date: string;
    title: string;
    thumbnail: string;
    category: 'communication' | 'motor' | 'emotion' | 'social';
    therapistComments: TherapistComment[];
}

export interface TherapistComment {
    timestamp: string; // "0:15"
    text: string;
    type: 'praise' | 'correction' | 'note';
}

export interface Activity {
    id: string;
    time: string;
    actor: string;
    action: string;
}

// Mock Child Progress
export const mockChildProgress: ChildProgress = {
    childName: 'Bi',
    age: 5,
    weeklyProgress: 80,
    streakDays: 5,
    totalExercises: 15,
    completedExercises: 12,
};

// Mock Daily Quests
export const mockDailyQuests: DailyQuest[] = [
    {
        id: '1',
        title: 'Bài tập: Giao tiếp mắt',
        description: 'Chơi với đồ chơi và gọi tên bé',
        type: 'exercise',
        duration: 15,
        status: 'pending',
        icon: '👁️',
    },
    {
        id: '2',
        title: 'Quay video chơi cùng con',
        description: 'Ghi lại khoảnh khắc bé tương tác',
        type: 'video',
        duration: 10,
        status: 'completed',
        icon: '📹',
    },
    {
        id: '3',
        title: 'Điền nhật ký cảm xúc',
        description: 'Ghi lại tâm trạng của bé hôm nay',
        type: 'journal',
        duration: 5,
        status: 'completed',
        icon: '📝',
    },
    {
        id: '4',
        title: 'Đọc truyện ngủ',
        description: 'Đọc sách về cảm xúc',
        type: 'reading',
        duration: 20,
        status: 'locked',
        icon: '📚',
    },
];

// Mock Video Memories
export const mockVideoMemories: VideoMemory[] = [
    {
        id: '1',
        date: '2026-01-20',
        title: 'Kỹ năng Xin chào',
        thumbnail: '/placeholder-video.jpg',
        category: 'communication',
        therapistComments: [
            {
                timestamp: '0:15',
                text: 'Con làm rất tốt! Giọng nói rõ ràng.',
                type: 'praise',
            },
            {
                timestamp: '0:43',
                text: 'Mẹ cần chờ con phản hồi lâu hơn một chút.',
                type: 'correction',
            },
        ],
    },
    {
        id: '2',
        date: '2026-01-15',
        title: 'Bài tập Chỉ tay',
        thumbnail: '/placeholder-video.jpg',
        category: 'motor',
        therapistComments: [
            {
                timestamp: '0:25',
                text: 'Tuyệt vời! Con đã chỉ đúng đồ vật.',
                type: 'praise',
            },
        ],
    },
];

// Mock Activities
export const mockParentActivities: Activity[] = [
    {
        id: '1',
        time: '1 giờ trước',
        actor: 'BS. Minh',
        action: 'đã nhận xét video "Giao tiếp mắt"',
    },
    {
        id: '2',
        time: 'Hôm qua',
        actor: 'Cô Lan',
        action: 'đã thêm bài tập mới',
    },
    {
        id: '3',
        time: '2 ngày trước',
        actor: 'Bạn',
        action: 'đã hoàn thành bài tập "Xin chào"',
    },
];
