
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    MessageSquare,
    Activity,
    Clock,
    ChevronDown,
    Plus,
    Loader2,
    UserCircle,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AddPatientDialog } from "@/components/therapist/AddPatientDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientProfile {
    user_id: string;
    full_name: string | null;
    avatar_url?: string | null;
}

interface Connection {
    id: string;
    parent_id: string;
    status: string;
    created_at: string;
}

interface ConnectedPatient {
    id: string;
    name: string;
    description: string;
    parentName: string;
    status: string;
    lastSession: string;
    progress: number;
    avatar: string;
    tags: string[];
    parentId: string;
}

export default function TherapistPatients() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<ConnectedPatient[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchPatients = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            // 1. Fetch connections
            const { data: connections, error: connError } = await supabase
                .from("connections")
                .select("*")
                .eq("therapist_id", user.id);

            if (connError) throw connError;

            if (connections) {
                // 2. Fetch parent profiles for these connections
                const patientData = await Promise.all(
                    connections.map(async (conn) => {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name, avatar_url")
                            .eq("user_id", conn.parent_id)
                            .maybeSingle();

                        // Map DB data to our UI structure
                        return {
                            id: conn.id,
                            name: profile?.full_name || "Trẻ chưa đặt tên",
                            description: "ASD Patient",
                            parentName: profile?.full_name || "Phụ huynh",
                            status: conn.status === "accepted" ? "Active" : "Pending",
                            lastSession: "N/A", // We'd need to fetch actual session data
                            progress: Math.floor(Math.random() * 100), // Placeholder for real progress
                            avatar: profile?.full_name?.substring(0, 2).toUpperCase() || "P",
                            tags: ["Bệnh nhân", conn.status],
                            parentId: conn.parent_id
                        };
                    })
                );
                setPatients(patientData);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Filter Logic
    const filteredPatients = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && p.status === "Active") ||
            (filterStatus === "pending" && p.status === "Pending") ||
            (filterStatus === "inactive" && p.status === "Inactive");
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ Bệnh nhân</h2>
                    <p className="text-slate-500 text-sm font-medium">
                        {loading ? "Đang tải..." : `Quản lý ${patients.length} trẻ đang theo dõi`}
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-[#00695C] hover:bg-[#004D40] text-white font-bold shadow-lg shadow-[#00695C]/20 rounded-xl px-6 h-12 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" /> Thêm hồ sơ mới
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên trẻ hoặc phụ huynh..."
                        className="pl-11 h-12 border-slate-200 bg-slate-50 focus:bg-white transition-all rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:w-[160px] h-12 justify-between border-slate-200 text-slate-600 rounded-xl">
                                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Trạng thái</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-100">
                            <DropdownMenuItem onClick={() => setFilterStatus("all")}>Tất cả</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("active")}>Đang điều trị</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Chờ xác nhận</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>Tạm dừng</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Patient Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-64 rounded-2xl p-6 space-y-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-2 w-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredPatients.length === 0 ? (
                <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có bệnh nhân nào</h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                        Kết nối với phụ huynh để bắt đầu theo dõi và quản lý hồ sơ bệnh nhân.
                    </p>
                    <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        variant="outline"
                        className="rounded-xl border-slate-200 font-bold"
                    >
                        Thêm ngay
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <Card
                            key={patient.id}
                            onClick={() => navigate(`/therapist/patient/${patient.parentId}`)}
                            className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden rounded-2xl cursor-pointer ring-1 ring-slate-100 hover:ring-[#00695C]/20"
                        >
                            {/* Card Header with Progress Bar */}
                            <div className="h-2 w-full bg-slate-100 relative">
                                <div
                                    className={cn("h-full absolute left-0 top-0 transition-all duration-500",
                                        patient.progress > 60 ? "bg-emerald-500" : patient.progress > 40 ? "bg-amber-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${patient.progress}%` }}
                                />
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm bg-teal-50 font-bold text-[#00695C]">
                                            <AvatarFallback>{patient.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-[#00695C] transition-colors">{patient.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{patient.description}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600 rounded-full">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Người giám hộ:</span>
                                        <span className="font-medium text-slate-700">{patient.parentName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Buổi cuối:</span>
                                        <span className="font-medium text-slate-700 font-mono">{patient.lastSession}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {patient.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 border-none px-2 rounded-md">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between group-hover:bg-[#00695C]/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    {patient.status === 'Active' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[10px] px-2 rounded-full">Đang điều trị</Badge>}
                                    {patient.status === 'Pending' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold text-[10px] px-2 rounded-full">Chờ xác nhận</Badge>}
                                    {patient.status === 'Inactive' && <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-[10px] px-2 rounded-full">Tạm dừng</Badge>}
                                </div>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-[#00695C] hover:bg-[#00695C]/10 rounded-full transition-all">
                                        <MessageSquare className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-[#00695C] hover:bg-[#00695C]/10 rounded-full transition-all">
                                        <FileText className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AddPatientDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchPatients}
            />
        </div>
    );
}
