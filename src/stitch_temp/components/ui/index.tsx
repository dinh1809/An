import React from 'react';
import { colors, typography, shadows, borderRadius } from '../../designTokens';

// Card Component - Glassmorphism Style
export interface CardProps {
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly hoverable?: boolean;
    readonly padding?: 'sm' | 'md' | 'lg';
    readonly style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
    padding = 'md',
    style: customStyle,
}) => {
    const paddingValues = {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
    };

    return (
        <div
            className={className}
            style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                padding: paddingValues[padding],
                boxShadow: shadows.md,
                transition: 'all 200ms ease',
                cursor: hoverable ? 'pointer' : 'default',
                ...customStyle,
            }}
        >
            {children}
        </div>
    );
};

// Button Component
export interface ButtonProps {
    readonly children: React.ReactNode;
    readonly variant?: 'primary' | 'secondary' | 'ghost';
    readonly size?: 'sm' | 'md' | 'lg';
    readonly onClick?: () => void;
    readonly disabled?: boolean;
    readonly fullWidth?: boolean;
    readonly icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    fullWidth = false,
    icon,
}) => {
    const sizeStyles = {
        sm: { padding: '0.5rem 1rem', fontSize: typography.fontSize.sm },
        md: { padding: '0.75rem 1.5rem', fontSize: typography.fontSize.base },
        lg: { padding: '1rem 2rem', fontSize: typography.fontSize.lg },
    };

    const variantStyles = {
        primary: {
            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
            color: 'white',
            border: 'none',
        },
        secondary: {
            background: 'white',
            color: colors.primary[700],
            border: `2px solid ${colors.primary[500]}`,
        },
        ghost: {
            background: 'transparent',
            color: colors.gray[600],
            border: `1px solid ${colors.gray[300]}`,
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...sizeStyles[size],
                ...variantStyles[variant],
                borderRadius: borderRadius.md,
                fontFamily: typography.fontFamily.primary,
                fontWeight: typography.fontWeight.semibold,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                width: fullWidth ? '100%' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 200ms ease',
            }}
        >
            {icon}
            {children}
        </button>
    );
};

// Badge Component
export interface BadgeProps {
    readonly children: React.ReactNode;
    readonly variant?: 'primary' | 'secondary' | 'success' | 'warning';
    readonly size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'sm',
}) => {
    const variantStyles = {
        primary: { background: colors.primary[100], color: colors.primary[700] },
        secondary: { background: colors.secondary[100], color: colors.secondary[700] },
        success: { background: colors.successBg, color: colors.success },
        warning: { background: colors.warningBg, color: colors.warning },
    };

    const sizeStyles = {
        sm: { padding: '0.25rem 0.5rem', fontSize: typography.fontSize.xs },
        md: { padding: '0.375rem 0.75rem', fontSize: typography.fontSize.sm },
    };

    return (
        <span
            style={{
                ...variantStyles[variant],
                ...sizeStyles[size],
                borderRadius: borderRadius.full,
                fontFamily: typography.fontFamily.primary,
                fontWeight: typography.fontWeight.medium,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
            }}
        >
            {children}
        </span>
    );
};

// Progress Bar Component
export interface ProgressBarProps {
    readonly value: number;
    readonly max: number;
    readonly label?: string;
    readonly color?: string;
    readonly showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max,
    label,
    color = colors.primary[500],
    showLabel = true,
}) => {
    const percentage = (value / max) * 100;

    return (
        <div style={{ width: '100%' }}>
            {showLabel && label && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        fontSize: typography.fontSize.sm,
                        color: colors.gray[600],
                    }}
                >
                    <span>{label}</span>
                    <span style={{ fontFamily: typography.fontFamily.mono }}>
                        {value}/{max}
                    </span>
                </div>
            )}
            <div
                style={{
                    width: '100%',
                    height: '8px',
                    background: colors.gray[200],
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: borderRadius.full,
                        transition: 'width 300ms ease',
                    }}
                />
            </div>
        </div>
    );
};

// Stats Card Component
export interface StatsCardProps {
    readonly icon: React.ReactNode;
    readonly label: string;
    readonly value: string | number;
    readonly trend?: 'up' | 'down' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    label,
    value,
    trend,
}) => {
    return (
        <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                        borderRadius: borderRadius.lg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary[600],
                    }}
                >
                    {icon}
                </div>
                <div>
                    <div
                        style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[500],
                            marginBottom: '0.25rem',
                        }}
                    >
                        {label}
                    </div>
                    <div
                        style={{
                            fontSize: typography.fontSize['2xl'],
                            fontFamily: typography.fontFamily.mono,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gray[900],
                        }}
                    >
                        {value}
                    </div>
                </div>
            </div>
        </Card>
    );
};
