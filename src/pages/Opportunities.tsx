import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/opportunities/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FILTERS = ["All", "Visual", "Logic", "Focus", "Creative", "Remote"];

export default function Opportunities() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('opportunities')
                    .select('*')
                    .eq('status', 'ACTIVE')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setJobs(data || []);
            } catch (err: any) {
                console.error("Error fetching jobs:", err);
                setError(err.message || "Không thể tải dữ liệu việc làm.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Filter Logic
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.partner_name.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeFilter === "All") return matchesSearch;

            // Check tags (fuzzy match)
            const hasTag = job.neuro_traits && job.neuro_traits.some((t: string) =>
                t.toLowerCase().includes(activeFilter.toLowerCase())
            );

            // Special case for Remote
            if (activeFilter === "Remote") {
                return matchesSearch && (job.location?.toLowerCase().includes("remote") || hasTag);
            }

            return matchesSearch && hasTag;
        });
    }, [jobs, activeFilter, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                            Cơ hội nghề nghiệp
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
                            Tìm thấy <span className="font-semibold text-indigo-600">{filteredJobs.length}</span> công việc phù hợp với hồ sơ năng lực của bạn.
                        </p>
                    </div>

                    {/* Search Bar - Desktop aligned right */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Tìm theo tên job, công ty..."
                            className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- FILTERS (Mobile Optimized) --- */}
                <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                        <div className="flex w-max space-x-2 pb-1">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`
                                        inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all
                                        ${activeFilter === filter
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                                        }
                                    `}
                                >
                                    {filter === "All" && <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />}
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="invisible" />
                    </ScrollArea>
                </div>

                {/* --- GRID CONTENT --- */}
                {error ? (
                    <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Lỗi kết nối</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Không tìm thấy kết quả</h3>
                        <p className="text-slate-500 max-w-xs mt-1">Không có công việc nào khớp với từ khóa "{searchQuery}" trong bộ lọc hiện tại.</p>
                        <Button variant="link" onClick={() => { setSearchQuery(""); setActiveFilter("All") }} className="mt-2 text-indigo-600">
                            Xóa bộ lọc
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
