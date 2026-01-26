import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";


interface JobCardProps {
    job: {
        id: string;
        title: string;
        partner_name: string;
        description: string | null;
        location: string | null;
        salary_range: string | null;
        neuro_traits: string[] | null;
        neuro_score: number | null;
        external_url: string | null;
    };
}

export function JobCard({ job }: JobCardProps) {
    // Generate Match Score (Mock if missing)
    const score = job.neuro_score || Math.floor(Math.random() * (99 - 85 + 1)) + 85;

    // Neuro-Tag Styling Logic
    const getTagStyles = (trait: string) => {
        const lower = trait.toLowerCase();
        if (lower.includes('visual')) return "bg-purple-50 text-purple-700 border-purple-100";
        if (lower.includes('logic')) return "bg-blue-50 text-blue-700 border-blue-100";
        if (lower.includes('focus')) return "bg-teal-50 text-teal-700 border-teal-100";
        if (lower.includes('creative')) return "bg-pink-50 text-pink-700 border-pink-100";
        return "bg-slate-50 text-slate-600 border-slate-100";
    };

    const companyInitial = job.partner_name.charAt(0).toUpperCase();

    return (
        <Card className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div onClick={() => window.open(job.external_url || "#", "_blank")} className="cursor-pointer space-y-4">

                {/* --- HEADER: Logo + Match Score --- */}
                <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-50 shadow-sm">
                        {companyInitial}
                    </div>

                    {/* Z-Pattern Anchor: Match Score Badge */}
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border",
                        score >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-indigo-50 text-indigo-700 border-indigo-100"
                    )}>
                        <CheckCircle2 className="w-4 h-4" />
                        {score}% Match
                    </div>
                </div>

                {/* --- BODY: Title & Company --- */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1" title={job.title}>
                        {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{job.partner_name}</p>
                </div>

                {/* --- TAGS: Neuro-Fit Indicators --- */}
                <div className="flex flex-wrap gap-2">
                    {job.neuro_traits?.slice(0, 3).map((trait, idx) => (
                        <span
                            key={idx}
                            className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", getTagStyles(trait))}
                        >
                            {trait}
                        </span>
                    ))}
                    {(job.neuro_traits?.length || 0) > 3 && (
                        <span className="text-xs font-medium px-2 py-1 text-slate-400 bg-slate-50 rounded-full">
                            +{job.neuro_traits!.length - 3}
                        </span>
                    )}
                </div>

                {/* --- FOOTER: Meta & Action --- */}
                <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location || "Remote"}
                        </div>
                        <div className="flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                            {job.salary_range || "Thỏa thuận"}
                        </div>
                    </div>

                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                    </div>
                </div>

            </div>
        </Card>
    );
}
