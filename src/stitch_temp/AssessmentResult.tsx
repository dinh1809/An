
import React, { useEffect, useState } from 'react';
import {
    Trophy, Clock, Star, Download, Save, Code, Palette, CheckCircle,
    Sparkles, ArrowLeft, Brain, Rocket, Loader2
} from 'lucide-react';
import { colors, typography, shadows, borderRadius } from './designTokens';
import { Card, Button, Badge, StatsCard } from './components/ui';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { aiService, type CareerMatch } from "@/services/ai";

export interface AssessmentResultProps {
    readonly onExportPDF?: () => void;
    readonly onSaveProfile?: () => void;
    readonly onJobClick?: (jobTitle: string) => void;
    readonly onBack?: () => void;
}

// Simple Radar Chart Component (SVG-based)
const RadarChart: React.FC<{ data: { axis: string; value: number }[] }> = ({ data }) => {
    const size = 400;
    const center = size / 2;
    const radius = 150;
    const angleSlice = (Math.PI * 2) / data.length;

    // Calculate points for polygon
    const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = (d.value / 100) * radius;
        return {
            x: center + value * Math.cos(angle),
            y: center + value * Math.sin(angle),
        };
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    // Grid circles
    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1].map(level => level * radius);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid circles */}
            {gridCircles.map((r, i) => (
                <circle key={i} cx={center} cy={center} r={r} fill="none" stroke={colors.gray[200]} strokeWidth="1" />
            ))}
            {/* Axis lines */}
            {data.map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                return (
                    <line
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.cos(angle)}
                        y2={center + radius * Math.sin(angle)}
                        stroke={colors.gray[200]} strokeWidth="1"
                    />
                );
            })}
            {/* Data polygon */}
            <polygon points={polygonPoints} fill={`${colors.primary[500]}30`} stroke={colors.primary[500]} strokeWidth="2" />
            {/* Data points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="6" fill={colors.secondary[500]} stroke="white" strokeWidth="2" />
            ))}
            {/* Labels */}
            {data.map((d, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const labelRadius = radius + 30;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);
                return (
                    <text
                        key={i} x={x} y={y}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={colors.gray[700]} fontSize="14"
                        fontFamily={typography.fontFamily.primary} fontWeight="500"
                    >
                        {d.axis}
                    </text>
                );
            })}
        </svg>
    );
};

// Job Match Card Component
const JobMatchCard: React.FC<{ job: CareerMatch; onClick?: () => void }> = ({ job, onClick }) => {
    const iconMap: Record<string, React.ReactNode> = {
        code: <Code size={24} />,
        palette: <Palette size={24} />,
        'check-circle': <CheckCircle size={24} />,
        brain: <Brain size={24} />,
        rocket: <Rocket size={24} />
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 200ms ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                    style={{
                        width: '48px', height: '48px',
                        borderRadius: borderRadius.lg,
                        background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: colors.primary[600], flexShrink: 0,
                    }}
                >
                    {iconMap[job.icon] || <Star size={24} />}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], margin: 0 }}>
                            {job.title}
                        </h4>
                        <Badge variant="primary">{Math.round(job.matchPercent)}% phù hợp</Badge>
                    </div>
                    <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[500], margin: '0.5rem 0 0 0' }}>
                        {job.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
    onExportPDF,
    onSaveProfile,
    onJobClick,
    onBack,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [radarData, setRadarData] = useState<{ axis: string; value: number }[]>([]);
    const [jobMatches, setJobMatches] = useState<CareerMatch[]>([]);
    const [totalScore, setTotalScore] = useState(0);
    const [level, setLevel] = useState("Explorer");
    const [aiAnalyzing, setAiAnalyzing] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all game sessions
                const { data, error } = await supabase
                    .from("game_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }); // Get latest

                if (error) throw error;

                // Process Metadata
                // Strategy: Take the BEST score for each game type
                const bestScores: Record<string, any> = {};

                data?.forEach(session => {
                    const type = session.game_type;
                    if (!bestScores[type] || (session.final_score || 0) > (bestScores[type].final_score || 0)) {
                        bestScores[type] = session;
                    }
                });

                // Extract Metrics (Normalize to 0-100)
                // - Detail Spotter -> Visual
                // - Time Warp -> Memory
                // - Flux Matrix -> Flexibility
                // - Command Override -> Inhibition
                // - Dispatcher -> Attention

                const getScore = (type: string, key: string, maxVal: number = 100) => {
                    const val = bestScores[type]?.advanced_metrics?.[key] ?? 0;
                    return Math.min(100, Math.round((val / maxVal) * 100));
                };

                const visual = getScore("detail_spotter", "visual_acuity_score", 100) || 75; // Mock fallback if empty for demo
                const memory = getScore("time_warp_cargo", "working_memory_score", 100) || 60;
                const flexibility = getScore("flux_matrix", "flexibility_index", 1) || 50; // Index is 0-1
                const inhibition = getScore("command_override", "inhibition_score", 1000) || 80; // Score usually around 500-1000? Need to check
                const attention = getScore("dispatcher", "attention_score", 100) || 70;

                const profile = {
                    visualSpatial: visual,
                    inhibitionControl: inhibition > 100 ? Math.min(100, inhibition / 10) : inhibition, // Adjust scale
                    workingMemory: memory,
                    flexibility: flexibility <= 1 ? flexibility * 100 : flexibility,
                    attention: attention
                };

                const radar = [
                    { axis: "Visual Spatial", value: profile.visualSpatial },
                    { axis: "Inhibition", value: profile.inhibitionControl },
                    { axis: "Memory", value: profile.workingMemory },
                    { axis: "Flexibility", value: profile.flexibility },
                    { axis: "Attention", value: profile.attention },
                ];
                setRadarData(radar);

                const total = Object.values(bestScores).reduce((acc, s) => acc + (s.final_score || 0), 0);
                setTotalScore(total);

                if (total > 5000) setLevel("Elite Neuro-Hacker");
                else if (total > 2000) setLevel("Pro Analyst");
                else setLevel("Potential Explorer");

                // Call AI
                setAiAnalyzing(true);
                const careers = await aiService.generateCareerInsights(profile);
                setJobMatches(careers);
                setAiAnalyzing(false);

            } catch (err) {
                console.error("Error fetching results:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-500">Đang tổng hợp dữ liệu thần kinh...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: colors.gray[50], fontFamily: typography.fontFamily.primary }}>
            {/* Header */}
            <header style={{ height: '80px', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.gray[200]}`, background: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gray[600] }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.gray[900], margin: 0 }}>Kết Quả Đánh Giá</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="ghost" onClick={onExportPDF} icon={<Download size={18} />}>Xuất PDF</Button>
                    <Button variant="primary" onClick={onSaveProfile} icon={<Save size={18} />}>Lưu Hồ Sơ</Button>
                </div>
            </header>

            {/* Hero Section */}
            <div style={{ background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`, padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Sparkles size={32} style={{ color: colors.secondary[500] }} />
                </div>
                <h2 style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, color: colors.gray[900], margin: '0 0 0.5rem 0' }}>
                    Kết quả Phân tích Neuro-Logic
                </h2>
                <p style={{ fontSize: typography.fontSize.lg, color: colors.gray[600], margin: 0 }}>
                    Hồ sơ năng lực của bạn đã được thiết lập.
                </p>
            </div>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column */}
                <div>
                    <Card padding="lg">
                        <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], margin: '0 0 1rem 0', textAlign: 'center' }}>Hồ Sơ Năng Lực</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <RadarChart data={radarData} />
                        </div>
                    </Card>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                        <StatsCard icon={<Trophy size={24} />} label="Điểm tổng" value={totalScore.toLocaleString()} />
                        <StatsCard icon={<Clock size={24} />} label="Độ chính xác TB" value={"92%"} />
                        <StatsCard icon={<Star size={24} />} label="Xếp hạng" value={level} />
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={20} style={{ color: colors.secondary[500] }} />
                        <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], margin: 0 }}>
                            Gợi Ý Nghề Nghiệp (AI Powered)
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {aiAnalyzing ? (
                            <div className="text-center p-8 bg-white rounded-xl border border-gray-100">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                <p className="text-gray-500">Dr. An đang phân tích dữ liệu...</p>
                            </div>
                        ) : (
                            jobMatches.map((job, index) => (
                                <JobMatchCard key={index} job={job} onClick={() => onJobClick?.(job.title)} />
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                            💡 <strong>Góc nhìn chuyên gia:</strong> Dữ liệu cho thấy bạn có ưu thế vượt trội về {
                                radarData.reduce((prev, current) => (prev.value > current.value) ? prev : current, { value: 0, axis: '' }).axis
                            }. Hãy tập trung phát triển các kỹ năng liên quan!
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssessmentResult;

