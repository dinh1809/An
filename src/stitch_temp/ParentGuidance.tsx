import React, { useState } from 'react';
import {
    Eye, Brain, Zap, ChevronDown, ChevronRight, Check,
    Puzzle, Pencil, Phone, Mail, ArrowLeft
} from 'lucide-react';
import { colors, typography, borderRadius } from './designTokens';
import { Card, Button, Badge, ProgressBar } from './components/ui';
import { userData, parentGuidance } from './mockData';

export interface ParentGuidanceProps {
    readonly viewMode?: 'parent' | 'child';
    readonly onViewModeChange?: (mode: 'parent' | 'child') => void;
    readonly onActivityStart?: (activityName: string) => void;
    readonly onContactSupport?: () => void;
    readonly onBack?: () => void;
}

// Strength Card Component
const StrengthCard: React.FC<{
    strength: typeof parentGuidance.childStrengths[0];
}> = ({ strength }) => {
    const iconMap: Record<string, React.ReactNode> = {
        eye: <Eye size={24} />,
        brain: <Brain size={24} />,
        zap: <Zap size={24} />,
    };

    return (
        <Card padding="md" hoverable>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: borderRadius.lg,
                        background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary[600],
                        flexShrink: 0,
                    }}
                >
                    {iconMap[strength.icon]}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4
                            style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            {strength.name}
                        </h4>
                        <Badge variant="primary" size="sm">
                            {strength.percentile}
                        </Badge>
                    </div>
                    <p
                        style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[500],
                            margin: 0,
                        }}
                    >
                        {strength.description}
                    </p>
                </div>
            </div>
        </Card>
    );
};

// Timeline Step Component
const TimelineStep: React.FC<{
    step: typeof parentGuidance.nextSteps[0];
    index: number;
    isLast: boolean;
}> = ({ step, index, isLast }) => {
    const statusStyles = {
        completed: {
            bg: colors.success,
            border: colors.success,
            icon: <Check size={16} color="white" />,
        },
        current: {
            bg: 'white',
            border: colors.primary[500],
            icon: <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.primary[500],
            }} />,
        },
        upcoming: {
            bg: colors.gray[100],
            border: colors.gray[300],
            icon: null,
        },
    };

    const style = statusStyles[step.status as keyof typeof statusStyles];

    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Timeline indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: borderRadius.full,
                        background: style.bg,
                        border: `2px solid ${style.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {style.icon}
                </div>
                {!isLast && (
                    <div
                        style={{
                            width: '2px',
                            height: '40px',
                            background: step.status === 'completed' ? colors.success : colors.gray[200],
                        }}
                    />
                )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : '1.5rem' }}>
                <p
                    style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: step.status === 'current' ? typography.fontWeight.semibold : typography.fontWeight.normal,
                        color: step.status === 'upcoming' ? colors.gray[400] : colors.gray[900],
                        margin: 0,
                        paddingTop: '0.25rem',
                    }}
                >
                    {step.title}
                </p>
                {step.status === 'current' && (
                    <Badge variant="primary" size="sm">
                        Đang thực hiện
                    </Badge>
                )}
            </div>
        </div>
    );
};

// Activity Card Component
const ActivityCard: React.FC<{
    activity: typeof parentGuidance.suggestedActivities[0];
    onStart?: () => void;
}> = ({ activity, onStart }) => {
    const iconMap: Record<string, React.ReactNode> = {
        puzzle: <Puzzle size={20} />,
        brain: <Brain size={20} />,
        pencil: <Pencil size={20} />,
    };

    return (
        <Card padding="md" hoverable>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: borderRadius.md,
                            background: colors.secondary[50],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.secondary[600],
                        }}
                    >
                        {iconMap[activity.icon]}
                    </div>
                    <div>
                        <h4
                            style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            {activity.name}
                        </h4>
                        <Badge variant="secondary" size="sm">
                            {activity.duration}
                        </Badge>
                    </div>
                </div>
                <Button variant="primary" size="sm" onClick={onStart}>
                    Bắt đầu
                </Button>
            </div>
        </Card>
    );
};

// FAQ Accordion Component
const FAQAccordion: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: 'Làm thế nào để hiểu kết quả đánh giá?',
            answer: 'Kết quả đánh giá được trình bày dưới dạng biểu đồ radar, cho thấy điểm mạnh của con bạn trong các lĩnh vực khác nhau.',
        },
        {
            question: 'Tôi nên làm gì tiếp theo?',
            answer: 'Bạn nên đọc báo cáo chi tiết và liên hệ với chuyên gia để được tư vấn cụ thể về lộ trình phát triển.',
        },
        {
            question: 'Làm sao để kết nối với chuyên gia?',
            answer: 'Sử dụng tính năng "Kết nối Partner" để tìm và liên hệ với các chuyên gia phù hợp trong khu vực của bạn.',
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    style={{
                        background: 'white',
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: borderRadius.lg,
                        overflow: 'hidden',
                    }}
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: typography.fontFamily.primary,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.gray[900],
                            textAlign: 'left',
                        }}
                    >
                        {faq.question}
                        {openIndex === index ? (
                            <ChevronDown size={20} style={{ color: colors.gray[400] }} />
                        ) : (
                            <ChevronRight size={20} style={{ color: colors.gray[400] }} />
                        )}
                    </button>
                    {openIndex === index && (
                        <div
                            style={{
                                padding: '0 1rem 1rem 1rem',
                                fontSize: typography.fontSize.sm,
                                color: colors.gray[600],
                                lineHeight: 1.6,
                            }}
                        >
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const ParentGuidance: React.FC<ParentGuidanceProps> = ({
    viewMode = 'parent',
    onViewModeChange,
    onActivityStart,
    onContactSupport,
    onBack,
}) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: colors.gray[50],
                fontFamily: typography.fontFamily.primary,
            }}
        >
            {/* Top Navigation */}
            <nav
                style={{
                    height: '60px',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${colors.gray[200]}`,
                    background: 'white',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            color: colors.gray[600],
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[500] }}>
                        Trang chủ {'>'} Kết quả {'>'} Lộ trình phát triển
                    </span>
                </div>

                {/* View Toggle */}
                <div
                    style={{
                        display: 'flex',
                        background: colors.gray[100],
                        borderRadius: borderRadius.full,
                        padding: '4px',
                    }}
                >
                    {(['parent', 'child'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange?.(mode)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: borderRadius.full,
                                border: 'none',
                                background: viewMode === mode ? 'white' : 'transparent',
                                color: viewMode === mode ? colors.primary[700] : colors.gray[500],
                                fontFamily: typography.fontFamily.primary,
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            {mode === 'parent' ? 'Phụ huynh' : 'Trẻ'}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Hero Section */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
                    padding: '2rem',
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <img
                        src={userData.avatar}
                        alt={userData.name}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: borderRadius.full,
                            border: `3px solid white`,
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1
                            style={{
                                fontSize: typography.fontSize['2xl'],
                                fontWeight: typography.fontWeight.bold,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            {userData.name}
                        </h1>
                        <p style={{ fontSize: typography.fontSize.base, color: colors.gray[600], margin: '0.25rem 0' }}>
                            {userData.age} tuổi
                        </p>
                        <Badge variant="primary">
                            Điểm mạnh: Tư duy Logic (Top 15%)
                        </Badge>
                    </div>
                    <Button variant="primary">
                        Xem chiến lược giáo dục →
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                }}
            >
                {/* Column 1: Strengths */}
                <div>
                    <h2
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: '0 0 1rem 0',
                        }}
                    >
                        Điểm mạnh của con
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {parentGuidance.childStrengths.map((strength, index) => (
                            <StrengthCard key={index} strength={strength} />
                        ))}
                    </div>
                </div>

                {/* Column 2: Next Steps */}
                <div>
                    <h2
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: '0 0 1rem 0',
                        }}
                    >
                        Các bước tiếp theo
                    </h2>
                    <Card padding="lg">
                        {parentGuidance.nextSteps.map((step, index) => (
                            <TimelineStep
                                key={index}
                                step={step}
                                index={index}
                                isLast={index === parentGuidance.nextSteps.length - 1}
                            />
                        ))}
                    </Card>
                </div>

                {/* Column 3: Activities */}
                <div>
                    <h2
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: '0 0 1rem 0',
                        }}
                    >
                        Gợi ý hoạt động
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {parentGuidance.suggestedActivities.map((activity, index) => (
                            <ActivityCard
                                key={index}
                                activity={activity}
                                onStart={() => onActivityStart?.(activity.name)}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Section */}
            <section
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 2rem 2rem 2rem',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '2rem',
                }}
            >
                {/* FAQ */}
                <div>
                    <h2
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: '0 0 1rem 0',
                        }}
                    >
                        Câu hỏi thường gặp
                    </h2>
                    <FAQAccordion />
                </div>

                {/* Contact Support */}
                <Card padding="lg">
                    <h3
                        style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: '0 0 1rem 0',
                        }}
                    >
                        Liên hệ hỗ trợ
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: colors.gray[600] }}>
                            <Phone size={18} />
                            <span style={{ fontSize: typography.fontSize.sm }}>1800 123 456</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: colors.gray[600] }}>
                            <Mail size={18} />
                            <span style={{ fontSize: typography.fontSize.sm }}>support@an-platform.vn</span>
                        </div>
                    </div>
                    <Button variant="secondary" fullWidth onClick={onContactSupport} style={{ marginTop: '1rem' }}>
                        Liên hệ ngay
                    </Button>
                </Card>
            </section>
        </div>
    );
};

export default ParentGuidance;
