import { ArrowRight, Play, Heart, Shield, Sparkles, Clock, Home, Frown, AlertTriangle, Video, Brain, FileCheck, MessageCircle, Lock, TrendingUp, Camera, Upload, MessageSquare, Repeat, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const problems = [
    {
        icon: Clock,
        title: '45 phút/tuần là chưa đủ',
        description: 'Trẻ chỉ được can thiệp chuyên sâu tại trung tâm chưa đầy 1 giờ mỗi tuần. Thời gian còn lại - 99% - trẻ ở nhà với cha mẹ.',
        stat: '45 phút',
        statLabel: 'mỗi tuần',
    },
    {
        icon: Home,
        title: 'Cha mẹ không biết cách dạy',
        description: 'Hầu hết phụ huynh đều muốn giúp con, nhưng không biết bắt đầu từ đâu. Những thuật ngữ y khoa khó hiểu càng làm họ thêm bối rối.',
        stat: '86%',
        statLabel: 'phụ huynh cần hỗ trợ',
    },
    {
        icon: Frown,
        title: 'Dữ liệu 10 năm bị vứt bỏ',
        description: 'Khi trẻ trưởng thành, toàn bộ hành trình can thiệp bị mất. Không có bằng chứng năng lực để xin việc, dù con bạn rất giỏi.',
        stat: '85%',
        statLabel: 'tỷ lệ thất nghiệp',
    },
];

const features = [
    {
        icon: Video,
        title: 'Video Annotation từng giây',
        description: 'Quay video con chơi ở nhà, bác sĩ sẽ ghi chú chính xác vào giây thứ 15: "Mẹ làm sai bước này, cần sửa lại tay". Không còn báo cáo khô khan.',
        color: 'from-teal-600 to-teal-700',
    },
    {
        icon: Brain,
        title: 'AI Phiên dịch Y khoa',
        description: 'Đừng lo nếu bạn không hiểu "Echolalia" hay "Sensory Overload". AI sẽ dịch thành: "Con đang nhại lời vì chưa hiểu, hãy dùng câu ngắn hơn".',
        color: 'from-teal-700 to-teal-500',
    },
    {
        icon: FileCheck,
        title: 'Hồ sơ Năng lực Dài hạn',
        description: 'Mỗi video, mỗi bài tập đều được lưu trữ an toàn. Khi con 18 tuổi, bạn có dữ liệu chứng minh năng lực thay vì "hai bàn tay trắng".',
        color: 'from-teal-500 to-teal-600',
    },
    {
        icon: MessageCircle,
        title: 'Cộng đồng Ẩn danh',
        description: 'Kết nối với các gia đình khác, chia sẻ kinh nghiệm mà không lo bị đánh giá. Chúng tôi hiểu cảm giác của bạn.',
        color: 'from-teal-600 to-teal-700',
    },
    {
        icon: Lock,
        title: 'An toàn tuyệt đối',
        description: 'Dữ liệu video của con được mã hóa đầu cuối, lưu trữ tại Việt Nam. Tuân thủ nghiêm ngặt Nghị định 13/2023 & 102/2025.',
        color: 'from-teal-700 to-teal-500',
    },
    {
        icon: TrendingUp,
        title: 'Tăng thời gian can thiệp',
        description: 'Từ 45 phút/tuần tại trung tâm, lên đến 20 giờ/tuần tại nhà. Hiệu quả tăng gấp 26 lần mà không tốn thêm chi phí.',
        color: 'from-teal-500 to-teal-600',
    },
];

const steps = [
    {
        number: '01',
        icon: Camera,
        title: 'Quay video con ở nhà',
        description: 'Đang chơi cùng con? Hãy quay lại. Không cần góc máy đẹp, không cần ánh sáng hoàn hảo. Chỉ cần thấy được con đang làm gì là đủ.',
        tip: 'Mẹo: Quay ngắn 30-60 giây là đủ để bác sĩ đánh giá.',
    },
    {
        number: '02',
        icon: Upload,
        title: 'Tải lên An.',
        description: 'Video được tải lên an toàn, tự động nén để tiết kiệm dung lượng. Chỉ bác sĩ điều trị của con mới có quyền xem.',
        tip: 'Dữ liệu được mã hóa đầu cuối, tuân thủ Nghị định 13.',
    },
    {
        number: '03',
        icon: MessageSquare,
        title: 'Nhận ghi chú từ bác sĩ',
        description: 'Bác sĩ sẽ xem và ghi chú trực tiếp trên video: "Giây 15: Mẹ nên đợi thêm 3 giây trước khi gợi ý". Chính xác đến từng giây.',
        tip: 'AI sẽ dịch thuật ngữ y khoa thành ngôn ngữ đời thường.',
    },
    {
        number: '04',
        icon: Repeat,
        title: 'Thực hành và cải thiện',
        description: 'Làm theo hướng dẫn, quay video lần sau để bác sĩ thấy sự tiến bộ. Mỗi video là một bước con đi lên.',
        tip: 'Lặp lại quy trình này mỗi ngày để thấy sự thay đổi.',
    },
];

export default function Landing() {
    const navigate = useNavigate();

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="An Logo"
                                className="h-12 w-12 object-contain"
                            />
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-900">An.</span>
                                <span className="text-xs text-slate-500 -mt-1">Nền tảng can thiệp tại nhà</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            <a
                                href="#problem"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#problem'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Vấn đề
                            </a>
                            <a
                                href="#solution"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#solution'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Giải pháp
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Cách hoạt động
                            </a>
                            <a
                                href="#pricing"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#pricing'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Bảng giá
                            </a>
                            <a
                                href="#testimonials"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#testimonials'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Câu chuyện
                            </a>
                            <a
                                href="#faq"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                Hỏi đáp
                            </a>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/auth")}
                                className="hidden sm:flex text-slate-700 hover:text-teal-600 hover:bg-teal-50"
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                                onClick={() => navigate("/auth")}
                            >
                                Bắt đầu miễn phí
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen pt-20 lg:pt-24 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-teal-50 -z-10" />

                {/* Decorative elements */}
                <div className="absolute top-40 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 rounded-full">
                                <Sparkles className="h-4 w-4 text-teal-600" />
                                <span className="text-sm font-medium text-teal-700">
                                    Nền tảng can thiệp tại nhà đầu tiên tại Việt Nam
                                </span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                                    Khi <span className="text-teal-600">45 phút</span> ở trung tâm
                                    <br />
                                    chưa đủ cho con...
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                                    An. giúp cha mẹ trở thành "đồng trị liệu viên" tại nhà.
                                    Quay video sinh hoạt thường ngày, bác sĩ sẽ ghi chú từng giây
                                    để hướng dẫn bạn cách tương tác đúng.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-600/10 rounded-xl flex items-center justify-center">
                                        <Heart className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">500+</p>
                                        <p className="text-sm text-slate-500">Gia đình đang dùng</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-400/10 rounded-xl flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">100%</p>
                                        <p className="text-sm text-slate-500">Tuân thủ Nghị định 13</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => scrollToSection('#pricing')}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base"
                                >
                                    Bắt đầu miễn phí
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => scrollToSection('#how-it-works')}
                                    className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-6 text-base"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Xem cách hoạt động
                                </Button>
                            </div>

                            {/* Trust badge */}
                            <p className="text-sm text-slate-500">
                                Không cần thẻ tín dụng. Dùng thử gói Cộng đồng miễn phí trọn đời.
                            </p>
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="/hero.jpeg"
                                    alt="Bác sĩ hướng dẫn phụ huynh can thiệp tại nhà"
                                    className="w-full h-auto object-cover"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent" />
                            </div>

                            {/* Floating card */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 max-w-[200px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Tiến bộ rõ rệt</p>
                                        <p className="text-xs text-slate-500">Sau 3 tháng</p>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full" />
                                </div>
                            </div>

                            {/* Another floating card */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-teal-600/10 rounded-full flex items-center justify-center">
                                        <Heart className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Video đã ghi chú</p>
                                </div>
                                <p className="text-2xl font-bold text-teal-600 mt-1">1,247</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section id="problem" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-6">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">
                                Vấn đề thực tế mà mọi gia đình đều gặp
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Can thiệp tự kỷ đang bị <span className="text-teal-600">đứt gãy</span> ở 3 điểm
                        </h2>
                        <p className="text-lg text-slate-600">
                            Chúng tôi đã trò chuyện với hàng trăm gia đình. Câu chuyện của họ
                            đều giống nhau: lo lắng, bất lực, và không biết phải làm gì tiếp theo.
                        </p>
                    </div>

                    {/* Problem Cards */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {problems.map((problem, index) => (
                            <div
                                key={index}
                                className="group relative bg-slate-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <problem.icon className="h-7 w-7 text-teal-600 group-hover:text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {problem.title}
                                </h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    {problem.description}
                                </p>

                                {/* Stat */}
                                <div className="pt-6 border-t border-slate-200">
                                    <p className="text-3xl font-bold text-teal-600">{problem.stat}</p>
                                    <p className="text-sm text-slate-500">{problem.statLabel}</p>
                                </div>

                                {/* Decorative corner */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-600/5 to-transparent rounded-tr-3xl" />
                            </div>
                        ))}
                    </div>

                    {/* Quote */}
                    <div className="mt-16 text-center">
                        <blockquote className="text-xl sm:text-2xl text-slate-700 italic max-w-4xl mx-auto">
                            "Con tôi đi học cả ngày, nhưng về nhà tôi không biết phải làm gì.
                            Tôi cảm thấy mình đang làm phiền bác sĩ khi nhắn tin hỏi quá nhiều."
                        </blockquote>
                        <p className="mt-4 text-slate-500">
                            — Chị Hương, phụ huynh bé Minh (5 tuổi)
                        </p>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solution" className="py-20 lg:py-28 bg-gradient-to-b from-white to-teal-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 rounded-full mb-6">
                            <span className="text-sm font-medium text-teal-600">
                                Giải pháp của An.
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Biến cha mẹ thành <span className="text-teal-600">đồng trị liệu viên</span>
                        </h2>
                        <p className="text-lg text-slate-600">
                            Chúng tôi không thay thế bác sĩ. Chúng tôi giúp bác sĩ "cầm tay chỉ việc"
                            cho bạn, ngay cả khi ở nhà.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-slate-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Highlight Box */}
                    <div className="mt-16 bg-teal-600 rounded-3xl p-8 lg:p-12 text-white">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                                    Khác biệt so với các phần mềm khác?
                                </h3>
                                <p className="text-white/90 leading-relaxed">
                                    Luca Education giúp trung tâm quản lý sổ sách. Zalo giúp gửi tin nhắn.
                                    Nhưng <strong>An. giúp con bạn tiến bộ</strong> - bằng cách biến video
                                    sinh hoạt đời thường thành dữ liệu lâm sàng có giá trị.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-2xl p-5 text-center">
                                    <p className="text-3xl font-bold">26x</p>
                                    <p className="text-sm text-white/80">Thời gian can thiệp</p>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-5 text-center">
                                    <p className="text-3xl font-bold">100%</p>
                                    <p className="text-sm text-white/80">Tuân thủ pháp lý</p>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-5 text-center">
                                    <p className="text-3xl font-bold">50k</p>
                                    <p className="text-sm text-white/80">VNĐ/tháng</p>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-5 text-center">
                                    <p className="text-3xl font-bold">0</p>
                                    <p className="text-sm text-white/80">Chi phí chuyển đổi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 rounded-full mb-6">
                            <span className="text-sm font-medium text-teal-600">
                                Cách sử dụng
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Chỉ <span className="text-teal-600">4 bước đơn giản</span>
                        </h2>
                        <p className="text-lg text-slate-600">
                            Không cần biết nhiều về công nghệ. Chúng tôi thiết kế để mọi người
                            đều dùng được, kể cả ông bà.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="relative">
                        {/* Connection line */}
                        <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="relative">
                                    {/* Step Card */}
                                    <div className="bg-slate-50 rounded-3xl p-6 lg:p-8 h-full hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                                        {/* Number */}
                                        <div className="absolute -top-4 left-6 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {step.number}
                                        </div>

                                        {/* Icon */}
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 mt-4">
                                            <step.icon className="h-8 w-8 text-teal-600" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-600 mb-4 leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Tip */}
                                        <div className="bg-teal-400/10 rounded-xl p-4">
                                            <p className="text-sm text-teal-600">{step.tip}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Demo Video Placeholder */}
                    <div className="mt-16 text-center">
                        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-teal-400/20" />
                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                        <Play className="h-6 w-6 text-teal-600 ml-1" />
                                    </div>
                                </div>
                                <p className="text-white font-medium">Xem video hướng dẫn</p>
                                <p className="text-white/70 text-sm">2 phút 30 giây</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 lg:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600 mb-4">
                            Bảng giá dịch vụ
                        </h2>
                        <p className="text-lg text-slate-600">
                            Chi phí rẻ hơn một cốc trà sữa, an toàn hơn Zalo
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Free Plan */}
                        <div className="relative rounded-3xl p-6 lg:p-8 bg-white text-slate-900 border border-slate-200">
                            <div className="mb-6">
                                <p className="text-sm font-semibold tracking-wider mb-2 text-teal-600">
                                    GÓI CỘNG ĐỒNG
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl lg:text-5xl font-bold">0</span>
                                    <span className="text-xl font-bold">VNĐ</span>
                                    <span className="text-sm text-slate-500">/trọn đời</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Nhật ký hành vi & Cảm xúc cơ bản</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Thư viện mục tiêu can thiệp mẫu</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Quay video & Gửi cho bác sĩ</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <X className="h-5 w-5 flex-shrink-0 mt-0.5 text-slate-400" />
                                    <span className="text-sm text-slate-400 line-through">Lưu trữ video: Chỉ 7 ngày (Tự động xóa)</span>
                                </li>
                            </ul>

                            <Button className="w-full py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent" variant="outline">
                                Dùng thử miễn phí
                            </Button>
                        </div>

                        {/* Popular Plan */}
                        <div className="relative rounded-3xl p-6 lg:p-8 bg-teal-600 text-white shadow-2xl scale-105 z-10">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="bg-teal-400 text-teal-900 text-xs font-bold px-4 py-1.5 rounded-full">
                                    BEST SELLER
                                </span>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm font-semibold tracking-wider mb-2 text-teal-200">
                                    CLINIC PARTNER
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl lg:text-5xl font-bold">50.000</span>
                                    <span className="text-xl font-bold">VNĐ</span>
                                    <span className="text-sm text-white/70">/bé/tháng</span>
                                </div>
                                <p className="text-sm mt-1 text-white/70">
                                    Thanh toán 1 lần 12 tháng (600.000 VNĐ/năm)
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-200" />
                                    <span className="text-sm text-white/90">Tất cả tính năng gói Cộng đồng</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-200" />
                                    <span className="text-sm text-white/90">5GB Lưu trữ Video Y khoa (Chuẩn H.265)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-200" />
                                    <span className="text-sm text-white/90">Video Annotation: Gán nhãn/vẽ lên video</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-200" />
                                    <span className="text-sm text-white/90">AI Phiên dịch Y khoa chuyên sâu</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-200" />
                                    <span className="text-sm text-white/90">Chứng nhận Bảo mật Nghị định 102/2025 & 13/2023</span>
                                </li>
                            </ul>

                            <Button className="w-full py-6 bg-teal-400 hover:bg-teal-300 text-teal-900 font-semibold">
                                Liên hệ triển khai
                            </Button>
                        </div>

                        {/* Premium Plan */}
                        <div className="relative rounded-3xl p-6 lg:p-8 bg-white text-slate-900 border border-slate-200">
                            <div className="mb-6">
                                <p className="text-sm font-semibold tracking-wider mb-2 text-teal-600">
                                    LƯU TRỮ TRỌN ĐỜI
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl lg:text-5xl font-bold">199.000</span>
                                    <span className="text-xl font-bold">VNĐ</span>
                                    <span className="text-sm text-slate-500">/năm</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Cộng thêm 10GB lưu trữ lạnh</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Lưu trữ trọn đời hành trình của con</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Tải xuống video gốc Full HD</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-600" />
                                    <span className="text-sm text-slate-600">Khôi phục video đã xóa (30 ngày)</span>
                                </li>
                            </ul>

                            <Button className="w-full py-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent" variant="outline">
                                Nâng cấp ngay
                            </Button>
                        </div>
                    </div>

                    {/* Security Banner */}
                    <div className="mt-12 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-teal-600/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Shield className="h-8 w-8 text-teal-600" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Tuân thủ Nghị định 13/2023 - Bảo vệ dữ liệu trẻ em
                                </h3>
                                <p className="text-slate-600">
                                    Hệ thống máy chủ đặt tại Việt Nam, cam kết an toàn tuyệt đối cho thông tin trẻ và gia đình theo tiêu chuẩn quốc gia.
                                </p>
                            </div>
                            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 whitespace-nowrap">
                                Xem chứng chỉ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 rounded-full mb-6">
                            <span className="text-sm font-medium text-teal-600">
                                Câu chuyện thành công
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Họ đã thay đổi cuộc sống của con mình
                        </h2>
                        <p className="text-lg text-slate-600">
                            Những câu chuyện thật từ gia đình đang sử dụng An. mỗi ngày.
                        </p>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {[
                            {
                                name: 'Chị Lan Anh',
                                role: 'Mẹ bé Minh Khôi (4 tuổi)',
                                location: 'Hà Nội',
                                content: 'Trước đây tôi cứ nghĩ con đi học cả ngày ở trung tâm là đủ. Đến khi dùng An., tôi mới biết mình có thể giúp con nhiều đến vậy. Video ghi chú của bác sĩ rất dễ hiểu, tôi làm theo và thấy con tiến bộ rõ rệt sau 2 tháng.',
                                highlight: 'Con tiến bộ sau 2 tháng',
                            },
                            {
                                name: 'Anh Đức Thịnh',
                                role: 'Bố bé Bảo An (6 tuổi)',
                                location: 'TP. Hồ Chí Minh',
                                content: 'Tôi là dân kỹ thuật, không giỏi nói chuyện với bác sĩ. Nhưng với An., tôi chỉ cần quay video con chơi là đủ. AI dịch thuật ngữ y khoa giúp tôi hiểu được "Echolalia" là gì và cách xử lý. Rất tiện lợi.',
                                highlight: 'AI dịch thuật ngữ rất hay',
                            },
                            {
                                name: 'Chị Ngọc Hà',
                                role: 'Mẹ bé Thùy Linh (5 tuổi)',
                                location: 'Đà Nẵng',
                                content: 'Điều tôi thích nhất là dữ liệu của con được lưu trữ an toàn. Tôi không còn lo lắng khi gửi video con qua Zalo nữa. Giá cả cũng rất hợp lý, chỉ bằng vài cốc trà sữa mỗi tháng.',
                                highlight: 'An toàn hơn Zalo',
                            },
                            {
                                name: 'Bác sĩ Nguyễn Văn Tùng',
                                role: 'Chuyên gia Can thiệp Sớm',
                                location: 'Trung tâm ABC, Hà Nội',
                                content: 'Là bác sĩ, tôi thấy An. giúp tôi làm việc hiệu quả hơn rất nhiều. Thay vì phải giải thích lại nhiều lần, tôi chỉ cần ghi chú trực tiếp trên video. Phụ huynh cũng tuân thủ y lệnh tốt hơn.',
                                highlight: 'Hiệu quả cho cả bác sĩ',
                            },
                        ].map((testimonial, index) => (
                            <div key={index} className="group bg-slate-50 rounded-3xl p-6 lg:p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                                {/* Quote Icon */}
                                <div className="w-10 h-10 bg-teal-600/10 rounded-xl flex items-center justify-center mb-4">
                                    <MessageSquare className="h-5 w-5 text-teal-600" />
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400">★</span>
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-slate-700 leading-relaxed mb-6">
                                    "{testimonial.content}"
                                </p>

                                {/* Highlight */}
                                <div className="inline-block bg-teal-400/20 text-teal-600 text-sm font-medium px-3 py-1 rounded-full mb-6">
                                    {testimonial.highlight}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(testimonial.name.length - 1)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {testimonial.role} • {testimonial.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-teal-600">500+</p>
                            <p className="text-slate-600 mt-1">Gia đình đang dùng</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-teal-600">50+</p>
                            <p className="text-slate-600 mt-1">Trung tâm liên kết</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-teal-600">10,000+</p>
                            <p className="text-slate-600 mt-1">Video đã ghi chú</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-teal-600">4.9/5</p>
                            <p className="text-slate-600 mt-1">Đánh giá từ phụ huynh</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 lg:py-28 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600/10 rounded-full mb-6">
                            <span className="text-sm font-medium text-teal-600">
                                Hỏi đáp
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Những câu hỏi thường gặp
                        </h2>
                        <p className="text-lg text-slate-600">
                            Chúng tôi hiểu bạn có nhiều thắc mắc. Dưới đây là những câu hỏi phổ biến nhất.
                        </p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                        {[
                            {
                                question: 'Tôi không giỏi công nghệ, có dùng được An. không?',
                                answer: 'Hoàn toàn được! Chúng tôi thiết kế An. để mọi người đều dùng được, kể cả ông bà. Quy trình chỉ có 4 bước: Quay video → Tải lên → Nhận ghi chú → Thực hành. Nhân viên tại trung tâm cũng sẽ hướng dẫn bạn cài đặt và sử dụng ngay tại chỗ.',
                            },
                            {
                                question: 'Dữ liệu video của con tôi có an toàn không?',
                                answer: 'Tuyệt đối an toàn. An. tuân thủ nghiêm ngặt Nghị định 13/2023 và 102/2025 về bảo vệ dữ liệu cá nhân. Video được mã hóa đầu cuối, lưu trữ tại máy chủ Việt Nam. Chỉ bác sĩ điều trị của con bạn mới có quyền xem. Chúng tôi cam kết không bán dữ liệu cho bên thứ ba.',
                            },
                            {
                                question: 'Tôi có thể dùng thử miễn phí không?',
                                answer: 'Có! Gói Cộng đồng hoàn toàn miễn phí trọn đời. Bạn có thể quay video, gửi cho bác sĩ và nhận hướng dẫn cơ bản. Tuy nhiên, video chỉ được lưu trong 7 ngày. Để lưu trữ lâu dài và sử dụng tính năng Video Annotation đầy đủ, bạn có thể nâng cấp lên gói Clinic Partner.',
                            },
                            {
                                question: 'An. khác gì so với việc nhắn tin qua Zalo?',
                                answer: 'Có 3 điểm khác biệt chính: (1) An. cho phép bác sĩ ghi chú trực tiếp trên video từng giây, thay vì chỉ nhắn tin văn bản; (2) Dữ liệu trên An. được bảo mật theo tiêu chuẩn y tế, trong khi Zalo có rủi ro lộ thông tin; (3) An. tích lũy dữ liệu dài hạn để theo dõi sự tiến bộ của con.',
                            },
                        ].map((faq, index) => (
                            <details key={index} className="bg-white rounded-2xl border border-slate-200 px-6 py-5 group">
                                <summary className="text-left text-slate-900 font-semibold cursor-pointer list-none flex justify-between items-center">
                                    {faq.question}
                                    <span className="text-teal-600 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-slate-600 leading-relaxed mt-4">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-slate-600 mb-4">
                            Vẫn còn thắc mắc? Chúng tôi luôn sẵn sàng trả lời.
                        </p>
                        <a href="#" className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:underline">
                            Liên hệ hỗ trợ
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-20 lg:py-28 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Mạng lưới Đối tác tin cậy
                        </h2>
                        <p className="text-lg text-slate-600">
                            Chúng tôi hợp tác với các tổ chức hàng đầu để tạo ra tác động xã hội bền vững
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-70 hover:opacity-100 transition-opacity">
                        {[
                            { name: "Imagtor", logo: "/partners/Imagtor.webp", url: "https://imagtor.com/" },
                            { name: "Enablecode", logo: "/partners/enablecode.png", url: "https://enablecode.vn/" },
                            { name: "Tòhe", logo: "/partners/tohe.png", url: "https://tohe.vn/" },
                            { name: "Vụn Art", logo: "/partners/vụn_art.png", url: "https://www.facebook.com/VunArtVanPhuc/" },
                            { name: "Kymviet", logo: "/partners/Kymviet.jpg", url: "https://kymviet.com.vn/" },
                            { name: "Kymviet Space", logo: "/partners/Kymviet_space.png", url: "https://www.facebook.com/KymvietSpace/" },
                            { name: "VAN", logo: "/partners/van-logo.webp", url: "https://van.org.vn/" },
                            { name: "VSV Capital", logo: "/partners/VSV_Captial.jpg", url: "https://vsv.capital/" }
                        ].map((partner, idx) => (
                            <a
                                key={idx}
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group grayscale hover:grayscale-0 transition-all duration-300"
                                title={partner.name}
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-12 md:h-16 w-auto object-contain"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-teal-600 to-teal-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Sẵn sàng Bắt đầu?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Dùng thử miễn phí gói Cộng đồng. Nâng cấp khi bạn thấy hiệu quả.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="bg-white text-teal-600 hover:bg-white/90 text-lg px-8 py-6"
                            onClick={() => navigate("/auth")}
                        >
                            Bắt đầu Miễn phí
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                        >
                            Liên hệ tư vấn
                        </Button>
                    </div>
                    <p className="mt-6 text-white/70 text-sm">
                        Không cần thẻ tín dụng • Hủy bất cứ lúc nào • Dữ liệu được bảo mật
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">An.</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Nền tảng can thiệp tại nhà cho trẻ tự kỷ
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Sản phẩm</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#problem" className="hover:text-white transition-colors">Vấn đề</a></li>
                                <li><a href="#solution" className="hover:text-white transition-colors">Giải pháp</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition-colors">Cách hoạt động</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Giá cả</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Công ty</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Pháp lý</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Nghị định 13/2023</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
                        © 2026 An. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
