import React from 'react';
import { Rocket, Check, Lock, Play, ChevronRight } from 'lucide-react';
import { colors, typography, shadows, borderRadius } from './designTokens';
import { Card, Button, Badge, ProgressBar } from './components/ui';
import { userData, gamesList } from './mockData';

export interface GameSelectionDashboardProps {
    readonly onGameSelect?: (gameId: string) => void;
    readonly onStartAssessment?: () => void;
}

const GameCard: React.FC<{
    game: typeof gamesList.basic[0];
    onClick?: () => void;
}> = ({ game, onClick }) => {
    const statusIcons = {
        completed: <Check size={16} style={{ color: colors.success }} />,
        current: <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.primary[500],
            animation: 'pulse 2s infinite',
        }} />,
        locked: <Lock size={16} style={{ color: colors.gray[400] }} />,
    };

    const colorMap: Record<string, { from: string; to: string }> = {
        emerald: { from: '#10B981', to: '#14B8A6' },
        sky: { from: '#0EA5E9', to: '#06B6D4' },
        purple: { from: '#A855F7', to: '#8B5CF6' },
        amber: { from: '#F59E0B', to: '#F97316' },
        rose: { from: '#F43F5E', to: '#EC4899' },
        indigo: { from: '#6366F1', to: '#3B82F6' },
        violet: { from: '#8B5CF6', to: '#A855F7' },
    };

    const gameColor = colorMap[game.color] || colorMap.emerald;

    return (
        <div
            onClick={game.status !== 'locked' ? onClick : undefined}
            style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: game.status !== 'locked' ? 'pointer' : 'not-allowed',
                opacity: game.status === 'locked' ? 0.6 : 1,
                transition: 'all 200ms ease',
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: borderRadius.lg,
                    background: `linear-gradient(135deg, ${gameColor.from}, ${gameColor.to})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                }}
            >
                <Rocket size={24} />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3
                        style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: 0,
                        }}
                    >
                        {game.name}
                    </h3>
                    {'tag' in game && (game as { tag?: string }).tag && (
                        <Badge variant="secondary" size="sm">
                            {(game as { tag?: string }).tag}
                        </Badge>
                    )}
                </div>
                <p
                    style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.gray[500],
                        margin: '0.25rem 0 0 0',
                    }}
                >
                    {game.description}
                </p>
            </div>

            {/* Duration */}
            <Badge variant="primary" size="sm">
                {game.duration}
            </Badge>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {statusIcons[game.status]}
                <ChevronRight size={20} style={{ color: colors.gray[400] }} />
            </div>
        </div>
    );
};

export const GameSelectionDashboard: React.FC<GameSelectionDashboardProps> = ({
    onGameSelect,
    onStartAssessment,
}) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: `linear-gradient(180deg, ${colors.gray[50]} 0%, ${colors.primary[50]}10 100%)`,
                fontFamily: typography.fontFamily.primary,
            }}
        >
            {/* Header */}
            <header
                style={{
                    height: '80px',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${colors.gray[200]}`,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: borderRadius.xl,
                            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <Rocket size={24} />
                    </div>
                    <h1
                        style={{
                            fontSize: typography.fontSize['2xl'],
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gray[900],
                            margin: 0,
                        }}
                    >
                        Trung Tâm Huấn Luyện
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Badge variant="primary">{userData.completedGames}/{userData.totalGames} hoàn thành</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                            src={userData.avatar}
                            alt={userData.name}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: borderRadius.full,
                            }}
                        />
                        <div>
                            <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                                {userData.name}
                            </div>
                            <Badge variant="secondary" size="sm">{userData.level}</Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: borderRadius.xl,
                        marginBottom: '1rem',
                    }}
                >
                    <Rocket size={32} />
                </div>
                <h2
                    style={{
                        fontSize: typography.fontSize['3xl'],
                        fontWeight: typography.fontWeight.bold,
                        margin: '0 0 0.5rem 0',
                    }}
                >
                    Khám phá tiềm năng não bộ của bạn
                </h2>
                <p
                    style={{
                        fontSize: typography.fontSize.lg,
                        opacity: 0.9,
                        margin: 0,
                    }}
                >
                    Mỗi thử thách là một bước tiến!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            padding: '0.5rem 1rem',
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.sm,
                        }}
                    >
                        {userData.completedGames}/{userData.totalGames} hoàn thành
                    </div>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            padding: '0.5rem 1rem',
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.sm,
                        }}
                    >
                        Cấp độ: {userData.level}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* Basic Games Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: borderRadius.full,
                                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.bold,
                            }}
                        >
                            1
                        </div>
                        <h2
                            style={{
                                fontSize: typography.fontSize.xl,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            Khởi Động - Cơ Bản
                        </h2>
                        <Badge variant="primary">CƠ BẢN</Badge>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {gamesList.basic.map((game) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                onClick={() => onGameSelect?.(game.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* Advanced Games Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: borderRadius.full,
                                background: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.bold,
                            }}
                        >
                            2
                        </div>
                        <h2
                            style={{
                                fontSize: typography.fontSize.xl,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            Chuyên Sâu - Nâng Cao
                        </h2>
                        <Badge variant="secondary">NÂNG CAO</Badge>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {gamesList.advanced.map((game) => (
                            <GameCard
                                key={game.id}
                                game={game as typeof gamesList.basic[0]}
                                onClick={() => onGameSelect?.(game.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* CTA Button */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={onStartAssessment}
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                            color: 'white',
                            border: 'none',
                            padding: '1rem 3rem',
                            borderRadius: borderRadius.lg,
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            fontFamily: typography.fontFamily.primary,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: `0 4px 20px ${colors.primary[500]}40`,
                            transition: 'all 200ms ease',
                        }}
                    >
                        <Play size={20} />
                        Bắt Đầu Đánh Giá Toàn Diện
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer
                style={{
                    textAlign: 'center',
                    padding: '2rem',
                    borderTop: `1px solid ${colors.gray[200]}`,
                }}
            >
                <p
                    style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.gray[400],
                        fontFamily: typography.fontFamily.mono,
                        margin: 0,
                    }}
                >
                    AN PLATFORM • PHIÊN BẢN 4.0 • BẢO MẬT AES-256
                </p>
            </footer>
        </div>
    );
};

export default GameSelectionDashboard;
