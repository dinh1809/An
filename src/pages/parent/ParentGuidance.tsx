/**
 * 👨‍👩‍👧 PARENT GUIDANCE PAGE
 * =========================
 * Trang hướng dẫn cho phụ huynh
 * 
 * Features:
 * - Tổng quan điểm mạnh của con
 * - Các bước tiếp theo (Timeline)
 * - Gợi ý hoạt động phát triển
 * - FAQ - Câu hỏi thường gặp
 * - Thông tin hỗ trợ
 * 
 * Design: Glassmorphism + Tailwind + shadcn
 * Integrated with: useParentGuidance hook (Supabase data)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    Ear,
    Move,
    Cpu,
    ChevronDown,
    ChevronRight,
    Check,
    Circle,
    Puzzle,
    Pencil,
    Phone,
    Mail,
    Globe,
    ArrowLeft,
    Brain,
    Sparkles,
    Clock,
    Star,
    BookOpen,
    HelpCircle,
    Lightbulb,
    type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useParentGuidance, type FAQ, type Activity, type NextStep } from "@/hooks/useParentGuidance";

// ============================================================================
// ICON MAP
// ============================================================================

const DOMAIN_ICONS: Record<string, LucideIcon> = {
    visual: Eye,
    auditory: Ear,
    movement: Move,
    logic: Cpu
};

const DIFFICULTY_COLORS = {
    easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
};

const DIFFICULTY_LABELS = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Nâng cao"
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StrengthDisplayProps {
    domain: string;
    score: number;
    isStrength: boolean;
    translateFn: (d: string) => string;
}

const StrengthDisplay = ({ domain, score, isStrength, translateFn }: StrengthDisplayProps) => {
    const IconComponent = DOMAIN_ICONS[domain] || Eye;
    const percentage = (score / 5) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-4 rounded-2xl",
                "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                "border",
                isStrength
                    ? "border-teal-400 dark:border-teal-500 ring-2 ring-teal-500/20"
                    : "border-slate-200 dark:border-slate-700"
            )}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isStrength
                        ? "bg-gradient-to-br from-teal-400 to-purple-500"
                        : "bg-slate-100 dark:bg-slate-700"
                )}>
                    <IconComponent className={cn(
                        "w-5 h-5",
                        isStrength ? "text-white" : "text-slate-500"
                    )} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {translateFn(domain)}
                        </span>
                        {isStrength && (
                            <Badge className="bg-teal-500 text-white text-xs">
                                Điểm mạnh
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{score.toFixed(1)}/5</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            </div>
        </motion.div>
    );
};

interface NextStepItemProps {
    step: NextStep;
    index: number;
    isLast: boolean;
}

const NextStepItem = ({ step, index, isLast }: NextStepItemProps) => {
    const StatusIcon = step.status === "done" ? Check : Circle;
    const statusColors = {
        done: "bg-emerald-500 text-white",
        current: "bg-teal-500 text-white animate-pulse",
        upcoming: "bg-slate-200 dark:bg-slate-700 text-slate-500"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
        >
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-12 bg-gradient-to-b from-teal-500/50 to-transparent" />
            )}

            {/* Icon */}
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                statusColors[step.status]
            )}>
                <StatusIcon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
                <h4 className={cn(
                    "font-semibold mb-1",
                    step.status === "upcoming"
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-800 dark:text-white"
                )}>
                    {step.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {step.description}
                </p>
            </div>
        </motion.div>
    );
};

interface ActivityCardProps {
    activity: Activity;
    index: number;
}

const ActivityCard = ({ activity, index }: ActivityCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
        >
            <Card className={cn(
                "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                "border-slate-200 dark:border-slate-700",
                "hover:shadow-lg hover:border-teal-400/50 transition-all cursor-pointer"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Puzzle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-800 dark:text-white truncate">
                                    {activity.title}
                                </h4>
                                <Badge className={cn("text-xs shrink-0", DIFFICULTY_COLORS[activity.difficulty])}>
                                    {DIFFICULTY_LABELS[activity.difficulty]}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                {activity.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{activity.duration}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface FAQItemProps {
    faq: FAQ;
    isOpen: boolean;
    onToggle: () => void;
}

const FAQItem = ({ faq, isOpen, onToggle }: FAQItemProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                "rounded-xl overflow-hidden",
                "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
                "border border-slate-200 dark:border-slate-700",
                isOpen && "ring-2 ring-teal-500/20"
            )}
        >
            <button
                className="w-full p-4 flex items-center justify-between text-left"
                onClick={onToggle}
            >
                <span className="font-medium text-slate-800 dark:text-white pr-4">
                    {faq.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0">
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ParentGuidance = () => {
    const navigate = useNavigate();
    const { loading, error, data, translateDomain } = useParentGuidance();

    const [openFAQId, setOpenFAQId] = useState<string | null>(null);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            Chưa có dữ liệu
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Bạn cần hoàn thành ít nhất một bài đánh giá để xem hướng dẫn cho phụ huynh.
                        </p>
                        <Button onClick={() => navigate("/assessment")} className="bg-teal-500 hover:bg-teal-600">
                            Bắt đầu đánh giá
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* ============ HEADER ============ */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="font-bold text-lg text-slate-800 dark:text-white">
                                    Hướng Dẫn Phụ Huynh
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {data.childName} • Cập nhật {new Date(data.lastUpdated).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="gap-1 text-teal-600 border-teal-500">
                            <Star className="w-3 h-3 fill-current" />
                            {data.completedGames}/{data.totalGames} bài
                        </Badge>
                    </div>
                </div>
            </header>

            {/* ============ MAIN CONTENT ============ */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

                {/* SECTION 1: CHILD STRENGTHS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Điểm Mạnh Của {data.childName}
                        </h2>
                    </div>

                    <Card className="bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-950/30 dark:to-purple-950/30 border-teal-200 dark:border-teal-800 mb-4">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-slate-600 dark:text-slate-300">
                                    {data.childName} có xu hướng{" "}
                                    <strong className="text-teal-600 dark:text-teal-400">
                                        {translateDomain(data.primaryStrength)}
                                    </strong>{" "}
                                    nổi bật. Điều này cho thấy con sẽ tiếp thu tốt nhất khi được học theo phương pháp{" "}
                                    <strong className="text-purple-600 dark:text-purple-400">
                                        {data.strategy.name_vi}
                                    </strong>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(data.profile).map(([domain, score]) => (
                            <StrengthDisplay
                                key={domain}
                                domain={domain}
                                score={score}
                                isStrength={data.strengths.includes(domain)}
                                translateFn={translateDomain}
                            />
                        ))}
                    </div>
                </section>

                {/* SECTION 2: NEXT STEPS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                            <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Các Bước Tiếp Theo
                        </h2>
                    </div>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            {data.nextSteps.map((step, idx) => (
                                <NextStepItem
                                    key={step.id}
                                    step={step}
                                    index={idx}
                                    isLast={idx === data.nextSteps.length - 1}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </section>

                {/* SECTION 3: SUGGESTED ACTIVITIES */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Gợi Ý Hoạt Động
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.suggestedActivities.map((activity, idx) => (
                            <ActivityCard key={activity.id} activity={activity} index={idx} />
                        ))}
                    </div>
                </section>

                {/* SECTION 4: FAQ */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Câu Hỏi Thường Gặp
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {data.faqs.map((faq) => (
                            <FAQItem
                                key={faq.id}
                                faq={faq}
                                isOpen={openFAQId === faq.id}
                                onToggle={() => setOpenFAQId(openFAQId === faq.id ? null : faq.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* SECTION 5: SUPPORT CONTACT */}
                <section>
                    <Card className="bg-gradient-to-r from-teal-500 to-purple-500 border-0">
                        <CardContent className="p-6">
                            <div className="text-center text-white mb-4">
                                <h3 className="text-xl font-bold mb-2">Cần Hỗ Trợ?</h3>
                                <p className="text-teal-100">
                                    Liên hệ với chúng tôi để được tư vấn chi tiết hơn
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {data.supportResources.map((resource) => {
                                    const Icon = resource.type === "phone" ? Phone
                                        : resource.type === "email" ? Mail
                                            : Globe;
                                    return (
                                        <Button
                                            key={resource.type}
                                            variant="secondary"
                                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {resource.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </section>

            </div>

            {/* ============ FOOTER ============ */}
            <footer className="py-8 text-center">
                <p className="text-xs text-slate-400 font-mono">
                    AN PLATFORM • PHIÊN BẢN 4.0 • BẢO MẬT AES-256
                </p>
            </footer>
        </div>
    );
};

export default ParentGuidance;
