import React, { useState } from 'react';
import { GameSelectionDashboard } from './GameSelectionDashboard';
import { AssessmentResult } from './AssessmentResult';
import { ParentGuidance } from './ParentGuidance';
import { PartnerConnection } from './PartnerConnection';
import { colors, typography, borderRadius } from './designTokens';

type Screen = 'dashboard' | 'result' | 'guidance' | 'partner';

const screens: { key: Screen; label: string }[] = [
    { key: 'dashboard', label: '🎮 Game Selection' },
    { key: 'result', label: '📊 Assessment Result' },
    { key: 'guidance', label: '👨‍👩‍👧 Parent Guidance' },
    { key: 'partner', label: '🤝 Partner Connection' },
];

export const StitchPreview: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return (
                    <GameSelectionDashboard
                        onGameSelect={(id) => console.log('Game selected:', id)}
                        onStartAssessment={() => console.log('Start assessment')}
                    />
                );
            case 'result':
                return (
                    <AssessmentResult
                        onExportPDF={() => console.log('Export PDF')}
                        onSaveProfile={() => console.log('Save profile')}
                        onJobClick={(job) => console.log('Job clicked:', job)}
                        onBack={() => setCurrentScreen('dashboard')}
                    />
                );
            case 'guidance':
                return (
                    <ParentGuidance
                        onActivityStart={(name) => console.log('Activity started:', name)}
                        onContactSupport={() => console.log('Contact support')}
                        onBack={() => setCurrentScreen('dashboard')}
                    />
                );
            case 'partner':
                return (
                    <PartnerConnection
                        onPartnerView={(id) => console.log('View partner:', id)}
                        onPartnerConnect={(id) => console.log('Connect partner:', id)}
                        onSearch={(q) => console.log('Search:', q)}
                        onBack={() => setCurrentScreen('dashboard')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ fontFamily: typography.fontFamily.primary }}>
            {/* Navigation Bar */}
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50px',
                    background: colors.gray[900],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    zIndex: 9999,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
            >
                <span
                    style={{
                        color: colors.primary[400],
                        fontWeight: typography.fontWeight.bold,
                        marginRight: '1rem',
                    }}
                >
                    STITCH PREVIEW
                </span>
                {screens.map((screen) => (
                    <button
                        key={screen.key}
                        onClick={() => setCurrentScreen(screen.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: borderRadius.md,
                            border: 'none',
                            background: currentScreen === screen.key ? colors.primary[500] : 'transparent',
                            color: currentScreen === screen.key ? 'white' : colors.gray[400],
                            fontFamily: typography.fontFamily.primary,
                            fontSize: typography.fontSize.sm,
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                        }}
                    >
                        {screen.label}
                    </button>
                ))}
            </nav>

            {/* Content */}
            <div style={{ paddingTop: '50px' }}>
                {renderScreen()}
            </div>
        </div>
    );
};

export default StitchPreview;
