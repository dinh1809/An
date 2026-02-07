// Design tokens from DESIGN_SYSTEM.md
export const colors = {
    // Primary Teal
    primary: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6',
        600: '#0D9488',
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
    },
    // Secondary Purple
    secondary: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        200: '#E9D5FF',
        300: '#D8B4FE',
        400: '#C084FC',
        500: '#A855F7',
        600: '#9333EA',
        700: '#7E22CE',
        800: '#6B21A8',
        900: '#581C87',
    },
    // Neutrals
    gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
    // Semantic
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
    // Game-specific colors
    games: {
        detailSpotter: { from: '#10B981', to: '#14B8A6' }, // emerald-teal
        stroopChaos: { from: '#0EA5E9', to: '#06B6D4' },   // sky-cyan
        sequenceMemory: { from: '#A855F7', to: '#8B5CF6' }, // purple-violet
        visualLogic: { from: '#F59E0B', to: '#F97316' },   // amber-orange
        dispatcher: { from: '#F43F5E', to: '#EC4899' },    // rose-pink
        sonicComposer: { from: '#6366F1', to: '#3B82F6' }, // indigo-blue
        timeWarpCargo: { from: '#8B5CF6', to: '#A855F7' }, // violet-purple
        commandOverride: { from: '#10B981', to: '#14B8A6' }, // emerald-teal
        fluxMatrix: { from: '#4F46E5', to: '#6366F1' },    // indigo
    },
};

export const typography = {
    fontFamily: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Courier New', monospace",
    },
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
    },
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },
};

export const spacing = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
};

export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    teal: '0 4px 12px rgba(20, 184, 166, 0.3)',
};

export const borderRadius = {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
};

export const animation = {
    duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
    },
    easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};
