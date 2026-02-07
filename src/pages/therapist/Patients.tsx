
import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    MessageSquare,
    Activity,
    Clock,
    ChevronDown,
    Plus
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

// Mock Data
const patients = [
    {
        id: "p1",
        name: "Nguyễn Minh Anh",
        age: 4,
        gender: "F",
        diagnosis: "ASD Level 2",
        parent: "Mẹ Trần Thị Hoa",
        status: "Active",
        lastSession: "24/01/2026",
        progress: 65,
        avatar: "MA",
        tags: ["Can thiệp sớm", "Giao tiếp"]
    },
    {
        id: "p2",
        name: "Lê Tuấn Kiệt",
        age: 5,
        gender: "M",
        diagnosis: "ASD Level 1",
        parent: "Bố Lê Văn Nam",
        status: "Warning",
        lastSession: "20/01/2026",
        progress: 42,
        avatar: "TK",
        tags: ["Hành vi", "Tăng động"]
    },
    {
        id: "p3",
        name: "Phạm Gia Bảo",
        age: 6,
        gender: "M",
        diagnosis: "Rối loạn ngôn ngữ",
        parent: "Mẹ Phạm Thu Hà",
        status: "Active",
        lastSession: "25/01/2026",
        progress: 78,
        avatar: "GB",
        tags: ["Ngôn ngữ", "Tiền học đường"]
    },
    {
        id: "p4",
        name: "Hoàng Bảo Ngọc",
        age: 3,
        gender: "F",
        diagnosis: "ASD Level 2",
        parent: "Mẹ Hoàng Lan",
        status: "Inactive",
        lastSession: "10/01/2026",
        progress: 30,
        avatar: "BN",
        tags: ["Can thiệp sớm"]
    },
];

export default function TherapistPatients() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Filter Logic
    const filteredPatients = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.parent.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && ["Active", "Warning"].includes(p.status)) ||
            (filterStatus === "inactive" && p.status === "Inactive");
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ Bệnh nhân</h2>
                    <p className="text-slate-500 text-sm font-medium">Quản lý {patients.length} trẻ đang theo dõi</p>
                </div>
                <Button className="bg-[#00695C] hover:bg-[#004D40] text-white font-bold shadow-lg shadow-[#00695C]/20">
                    <Plus className="mr-2 h-4 w-4" /> Thêm hồ sơ mới
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên trẻ hoặc phụ huynh..."
                        className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 md:w-[160px] justify-between border-slate-200 text-slate-600">
                                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Trạng thái</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => setFilterStatus("all")}>Tất cả</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("active")}>Đang điều trị</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>Tạm dừng</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white overflow-hidden rounded-2xl cursor-pointer ring-1 ring-slate-100 hover:ring-[#00695C]/20">
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
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm bg-slate-100 font-bold text-slate-600">
                                        <AvatarFallback>{patient.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-[#00695C] transition-colors">{patient.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{patient.age} tuổi • {patient.gender === 'M' ? 'Nam' : 'Nữ'}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Chẩn đoán:</span>
                                    <span className="font-semibold text-slate-700">{patient.diagnosis}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Phụ huynh:</span>
                                    <span className="font-medium text-slate-700">{patient.parent}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Buổi cuối:</span>
                                    <span className="font-medium text-slate-700">{patient.lastSession}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {patient.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between group-hover:bg-[#00695C]/5 transition-colors">
                            <div className="flex items-center gap-2">
                                {patient.status === 'Active' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[10px] px-2">Đang điều trị</Badge>}
                                {patient.status === 'Warning' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold text-[10px] px-2">Cần chú ý</Badge>}
                                {patient.status === 'Inactive' && <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-[10px] px-2">Tạm dừng</Badge>}
                            </div>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-[#00695C] hover:bg-[#00695C]/10 rounded-full">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-[#00695C] hover:bg-[#00695C]/10 rounded-full">
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
