
import {
    MessageSquare,
    ArrowBigUp,
    ArrowBigDown,
    Share2,
    MoreHorizontal,
    User,
    Send,
    Filter,
    ShieldCheck,
    ChevronRight,
    Image as ImageIcon,
    Smile,
    Search,
    TrendingUp,
    Clock,
    Award,
    Eye,
    Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Forum() {
    const [activeTab, setActiveTab] = useState("hot");

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">

            {/* Left Sidebar: Navigation & Identity */}
            <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
                <Card className="p-6 border-none shadow-soft rounded-2xl bg-white dark:bg-[#112220]">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-primary/10">
                                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                    ?
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 h-6 w-6 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Bạn đang ẩn danh</h3>
                            <p className="text-xs text-muted-foreground italic">Biệt danh hiện tại: "Mẹ Gấu Trắng"</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-primary/20 text-primary hover:bg-primary/5">
                            Đổi biệt danh
                        </Button>
                    </div>
                </Card>

                {/* Categories */}
                <Card className="p-2 border-none shadow-soft rounded-2xl bg-white dark:bg-[#112220]">
                    <div className="px-4 py-3">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Phân loại</h3>
                    </div>
                    <nav className="space-y-1">
                        {[
                            { icon: TrendingUp, label: "Xu hướng", color: "text-orange-500" },
                            { icon: MessageSquare, label: "Tất cả bài viết", color: "text-blue-500" },
                            { icon: Award, label: "Câu chuyện hay", color: "text-purple-500" },
                        ].map((item, i) => (
                            <Button key={i} variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-muted">
                                <item.icon className={cn("h-5 w-5", item.color)} />
                                {item.label}
                            </Button>
                        ))}
                    </nav>
                    <Separator className="my-2 mx-4 bg-border/50" />
                    <div className="px-4 py-3">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Chủ đề quan tâm</h3>
                    </div>
                    <nav className="space-y-1">
                        {["Kỹ năng xã hội", "Hành vi", "Dinh dưỡng", "Giáo dục hòa nhập"].map((tag, i) => (
                            <Button key={i} variant="ghost" className="w-full justify-start gap-3 h-10 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary transition-all">
                                <span className="text-primary opacity-40">#</span>
                                {tag}
                            </Button>
                        ))}
                    </nav>
                </Card>
            </aside>

            {/* Main Content: Post list */}
            <main className="flex-1 space-y-6 min-w-0">
                {/* Search & Mobile Tabs */}
                <div className="flex items-center gap-4 bg-white dark:bg-[#112220] p-2 rounded-2xl shadow-soft border border-border/40">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm chủ đề, câu hỏi..."
                            className="w-full pl-11 bg-transparent border-none focus-visible:ring-0 text-sm"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                        {["hot", "new", "top"].map((tab) => (
                            <Button
                                key={tab}
                                size="sm"
                                variant={activeTab === tab ? "default" : "ghost"}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 h-8 rounded-lg text-xs font-bold uppercase tracking-wider",
                                    activeTab === tab && "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90"
                                )}
                            >
                                {tab === "hot" && "Nổi bật"}
                                {tab === "new" && "Mới nhất"}
                                {tab === "top" && "Đỉnh nhất"}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Real Forum Create Post */}
                <Card className="p-0 border-none shadow-soft rounded-2xl overflow-hidden bg-white dark:bg-[#112220]">
                    <div className="flex gap-4 p-5">
                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                            <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <Textarea
                                className="min-h-[60px] w-full bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 placeholder:text-muted-foreground/50"
                                placeholder="Chia sẻ ẩn danh... bạn đang nghĩ gì?"
                            />
                            <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl">
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl font-bold">
                                        Aa
                                    </Button>
                                </div>
                                <Button className="px-6 bg-primary hover:bg-primary-light text-white font-black rounded-xl h-10 shadow-lg shadow-primary/20 gap-2">
                                    Đăng bài
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Forum Thread List */}
                <div className="space-y-4">
                    {/* Post 1: Reddit Style */}
                    <Card className="flex flex-row p-0 border-none shadow-soft hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white dark:bg-[#112220] group">
                        {/* Vote Sidebar */}
                        <div className="w-12 bg-muted/20 flex flex-col items-center py-4 gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500 group-hover:bg-orange-50">
                                <ArrowBigUp className="h-6 w-6" />
                            </Button>
                            <span className="text-xs font-black tabular-nums">1.2k</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500 group-hover:bg-blue-50">
                                <ArrowBigDown className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-bold uppercase tracking-widest">#KinhNghiem</Badge>
                                <span className="text-[10px] text-muted-foreground">• Đăng bởi <span className="font-bold hover:underline cursor-pointer">Mẹ Nhím Bé</span></span>
                                <span className="text-[10px] text-muted-foreground">• 3 giờ trước</span>
                            </div>

                            <h2 className="text-xl font-extrabold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors cursor-pointer">
                                Kinh nghiệm rèn luyện khả năng tập trung cho bé 3 tuổi tại nhà - Những bước đi nhỏ đầy bất ngờ!
                            </h2>

                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                                Chào các mẹ, mình đã vật lộn hơn một năm trời để tìm cách giao tiếp với Nhím. Hôm nay mình muốn chia sẻ một vài kỷ niệm và bài học đắt giá mà mình đã rút ra... [Xem thêm]
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-muted-foreground hover:text-primary rounded-lg font-bold">
                                        <MessageSquare className="h-4 w-4" />
                                        142 Bình luận
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-muted-foreground hover:text-primary rounded-lg font-bold">
                                        <Share2 className="h-4 w-4" />
                                        Chia sẻ
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Post 2: Question Type */}
                    <Card className="flex flex-row p-0 border-none shadow-soft hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white dark:bg-[#112220] group">
                        <div className="w-12 bg-muted/20 flex flex-col items-center py-4 gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500">
                                <ArrowBigUp className="h-6 w-6" />
                            </Button>
                            <span className="text-xs font-black">45</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500">
                                <ArrowBigDown className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="bg-red-500/5 text-red-500 border-none text-[10px] font-bold uppercase tracking-widest">#HoiGap</Badge>
                                <span className="text-[10px] text-muted-foreground">• Đăng bởi <span className="font-bold hover:underline cursor-pointer">Bố Bi Bin</span></span>
                                <span className="text-[10px] text-muted-foreground">• 5 giờ trước</span>
                            </div>
                            <h2 className="text-lg font-bold text-foreground mb-3 leading-tight">
                                Bé hay nhìn nghiêng và không tập trung khi gọi tên, có mẹ nào gặp tình trạng này chưa ạ?
                            </h2>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-muted-foreground hover:text-primary rounded-lg font-bold">
                                        <MessageSquare className="h-4 w-4" />
                                        86 Trả lời
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-muted-foreground hover:text-primary rounded-lg font-bold">
                                        <Eye className="h-4 w-4" />
                                        1.2k Lượt xem
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Post 3: Image/Success Story */}
                    <Card className="flex flex-row p-0 border-none shadow-soft hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white dark:bg-[#112220] group">
                        <div className="w-12 bg-muted/20 flex flex-col items-center py-4 gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500">
                                <ArrowBigUp className="h-6 w-6" />
                            </Button>
                            <span className="text-xs font-black">890</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500">
                                <ArrowBigDown className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex-1 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="bg-emerald-500/5 text-emerald-500 border-none text-[10px] font-bold uppercase tracking-widest">#ThanhTuu</Badge>
                                <span className="text-[10px] text-muted-foreground">• Đăng bởi <span className="font-bold hover:underline cursor-pointer">Mẹ Bống</span></span>
                                <span className="text-[10px] text-muted-foreground">• 1 ngày trước</span>
                            </div>
                            <h2 className="text-lg font-bold text-foreground mb-3">
                                Khoảnh khắc hạnh phúc nhất của tuần này: Bống đã biết gọi "Mẹ" lần đầu tiên!
                            </h2>
                            <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video mb-4">
                                <img
                                    src="https://images.unsplash.com/photo-1510154221590-ff63e90a136f?w=800&fit=crop"
                                    alt="Success story"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-muted-foreground hover:text-primary rounded-lg font-bold">
                                        <MessageSquare className="h-4 w-4" />
                                        253 Bình luận
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Loading More */}
                <div className="flex justify-center p-8">
                    <Button variant="ghost" className="text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-primary">
                        Tải thêm bài viết
                    </Button>
                </div>
            </main>

            {/* Right Sidebar: Community Info & Moderation */}
            <aside className="hidden xl:block w-80 flex-shrink-0 space-y-6">
                {/* Community Overview */}
                <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-[#00695C] to-[#004D40] text-white rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="h-20 w-20 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest">Ký túc xá ẩn danh</h3>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                            Nơi các phụ huynh chia sẻ câu chuyện mà không sợ bị phán xét. Quyền riêng tư của bạn là ưu tiên số 1.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-xl font-black">12.5k</h4>
                                <p className="text-[10px] opacity-70 font-bold uppercase">Thành viên</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-black">450</h4>
                                <p className="text-[10px] opacity-70 font-bold uppercase">Đang online</p>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-primary hover:bg-white/90 font-black rounded-xl h-11 text-xs uppercase tracking-wider">
                            Tham gia hội nhóm
                        </Button>
                    </div>
                </Card>

                {/* Pinned Posts / Rules */}
                <Card className="p-5 border-none shadow-soft rounded-2xl bg-white dark:bg-[#112220]">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Nội quy & An toàn</h3>
                    <div className="space-y-4">
                        {[
                            "Tôn trọng và đồng cảm luôn đi đầu.",
                            "Tuyệt đối không để lộ danh tính thực.",
                            "Mọi lời khuyên chỉ mang tính tham khảo.",
                            "Cùng nhau xây dựng môi trường tích cực."
                        ].map((rule, i) => (
                            <div key={i} className="flex gap-3 items-start group">
                                <div className="mt-1 size-1.5 rounded-full bg-primary shrink-0 transition-transform group-hover:scale-150" />
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{rule}</p>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-[10px] font-black text-primary hover:bg-primary/5 uppercase">
                        Xem trung tâm an toàn
                    </Button>
                </Card>

                {/* Hot Keywords */}
                <Card className="p-5 border-none shadow-soft rounded-2xl bg-white dark:bg-[#112220]">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Tìm kiếm phổ biến</h3>
                    <div className="flex flex-wrap gap-2">
                        {["ABA", "Can thiệp sớm", "Trường hòa nhập", "Tự kỷ nhẹ", "Kỹ năng tự phục vụ", "Giao tiếp mắt"].map((tag, i) => (
                            <Badge key={i} variant="outline" className="border-border/60 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/40 cursor-pointer px-3 py-1 bg-muted/20">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </Card>
            </aside>
        </div>
    );
}
