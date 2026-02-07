
import {
    Users,
    Video,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Clock,
    Plus,
    FileText,
    Activity,
    CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InviteCodeCard } from "@/components/therapist/InviteCodeCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TherapistLayout } from "@/components/layout/TherapistLayout";

export default function TherapistDashboard() {
    const navigate = useNavigate();
    return (
        <TherapistLayout>
            <div className="space-y-8 pb-12">

                {/* Header with Welcome & Date */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Xin chào, Bác sĩ An! 👋</h2>
                        <p className="text-slate-500 font-medium mt-1">Hôm nay có 4 ca cần chú ý và 3 video mới.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-10 border-slate-200 text-slate-700 font-bold">
                            <Calendar className="mr-2 h-4 w-4" /> 26 Tháng 1, 2026
                        </Button>
                        <Button className="h-10 bg-[#00695C] hover:bg-[#004D40] text-white font-bold shadow-lg shadow-[#00695C]/20">
                            <Plus className="mr-2 h-4 w-4" /> Tạo phiên mới
                        </Button>
                    </div>
                </div>

                {/* 1. Clinical Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Đang theo dõi", value: "24", sub: "bệnh nhân", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { title: "Cần chú ý", value: "4", sub: "ca bất thường", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
                        { title: "Video mới", value: "8", sub: "chờ duyệt", icon: Video, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { title: "Lịch hôm nay", value: "5", sub: "phiên hẹn", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat, i) => (
                        <Card key={i} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                    <span className="text-slate-500 text-sm font-medium">{stat.sub}</span>
                                </div>
                            </div>
                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Priority Cases & New Videos */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Attention Needed */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" /> Cần chú ý ngay
                                </h3>
                                <Button variant="ghost" size="sm" className="text-slate-500 font-bold" onClick={() => navigate("/therapist/patients")}>Xem tất cả</Button>
                            </div>
                            <div className="p-2">
                                {[
                                    { name: "Bé Minh Anh", age: "4 tuổi", issue: "Giảm tương tác mắt 3 ngày liên tiếp", time: "2 giờ trước", avatar: "MA" },
                                    { name: "Bé Tuấn Kiệt", age: "5 tuổi", issue: "Chưa hoàn thành bài tập tuần", time: "5 giờ trước", avatar: "TK" },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-4 group cursor-pointer">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm font-bold text-amber-700 bg-amber-100">
                                            <AvatarFallback>{item.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-slate-900">{item.name} <span className="text-slate-400 font-normal text-xs">({item.age})</span></h4>
                                                <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                                            </div>
                                            <p className="text-sm text-amber-600 font-medium flex items-center gap-1.5">
                                                <Activity className="h-3 w-3" /> {item.issue}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-5 w-5 text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Pending Videos */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Video className="h-5 w-5 text-emerald-600" /> Video chờ duyệt
                                </h3>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">8 mới</Badge>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[
                                    { title: "Bài tập Giao tiếp mắt", parent: "Mẹ Bé Bông", sent: "10:30 AM", status: "Chờ duyệt" },
                                    { title: "Kỹ năng cầm thìa", parent: "Bố Bé Sóc", sent: "09:15 AM", status: "Chờ duyệt" },
                                    { title: "Bắt chước âm thanh", parent: "Mẹ Bé Na", sent: "Hôm qua", status: "Chờ duyệt" },
                                ].map((video, i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-24 bg-slate-200 rounded-lg relative overflow-hidden">
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                                    <Video className="h-6 w-6 text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-[#00695C] transition-colors">{video.title}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{video.parent} • {video.sent}</p>
                                            </div>
                                        </div>
                                        <Button
                                            className="bg-white border-2 border-slate-100 hover:border-[#00695C] hover:text-[#00695C] text-slate-600 font-bold rounded-xl shadow-sm"
                                            onClick={() => navigate("/therapist/review")}
                                        >
                                            Review ngay
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                    </div>

                    {/* 3. Schedule & Shortcuts */}
                    <div className="space-y-8">
                        {/* Invitation Code (Immediate Access) */}
                        <InviteCodeCard />

                        {/* Today's Schedule */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden h-fit">
                            <div className="p-6 pb-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-purple-600" /> Lịch hôm nay
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-slate-400">09:00</span>
                                        <div className="w-px h-full bg-slate-200 my-1 absolute left-[18px] top-6 -z-10"></div>
                                    </div>
                                    <div className="flex-1 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                        <h4 className="font-bold text-purple-900 text-sm">Đánh giá ban đầu: Gia đình Bé Chip</h4>
                                        <p className="text-xs text-purple-700 mt-1 flex items-center gap-1"><Video className="h-3 w-3" /> Online Meeting</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-slate-400">14:30</span>
                                        <div className="w-px h-full bg-slate-200 my-1 absolute left-[18px] top-6 -z-10"></div>
                                    </div>
                                    <div className="flex-1 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <h4 className="font-bold text-slate-700 text-sm">Tư vấn định kỳ: Mẹ Bé Nhím</h4>
                                        <p className="text-xs text-slate-500 mt-1">Tại phòng khám 2</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-slate-400">16:00</span>
                                    </div>
                                    <div className="flex-1 p-3 bg-white border border-slate-200 rounded-xl shadow-sm opacity-60">
                                        <h4 className="font-bold text-slate-700 text-sm">Họp chuyên môn tuần</h4>
                                        <p className="text-xs text-slate-500 mt-1">Team A</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100">
                                <Button variant="ghost" className="w-full text-purple-600 font-bold text-xs uppercase tracking-wider">Xem toàn bộ lịch</Button>
                            </div>
                        </Card>

                        {/* Quick Shortcuts */}
                        <Card className="border-none shadow-sm bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-3xl overflow-hidden text-white">
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4">Phím tắt nhanh</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white overflow-hidden">
                                        <FileText className="h-6 w-6 opacity-80" />
                                        <span className="text-xs font-bold">Ghi chú nhanh</span>
                                    </Button>
                                    <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white overflow-hidden">
                                        <CheckCircle2 className="h-6 w-6 opacity-80" />
                                        <span className="text-xs font-bold">Gán bài tập</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="col-span-2 h-auto py-3 flex items-center justify-center gap-2 bg-white text-[#00695C] hover:bg-slate-100 border-none font-bold"
                                        onClick={() => navigate("/therapist/patients")}
                                    >
                                        <Plus className="h-4 w-4" /> Thêm hồ sơ bệnh nhân
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </TherapistLayout>
    );
}
