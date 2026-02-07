import { ArrowRight, Play, Heart, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-20 lg:pt-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F8F5] via-white to-[#F0FDFA] -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-72 h-72 bg-[#32E0C4]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#0D7377]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 rounded-full">
              <Sparkles className="h-4 w-4 text-[#0D7377]" />
              <span className="text-sm font-medium text-[#0D7377]">
                Nền tảng can thiệp tại nhà đầu tiên tại Việt Nam
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Khi <span className="text-[#0D7377]">45 phút</span> ở trung tâm
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
                <div className="w-12 h-12 bg-[#0D7377]/10 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-[#0D7377]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">500+</p>
                  <p className="text-sm text-slate-500">Gia đình đang dùng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#32E0C4]/10 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#0D7377]" />
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
                className="bg-[#0D7377] hover:bg-[#0A5A5D] text-white px-8 py-6 text-base"
              >
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('#how-it-works')}
                className="border-[#0D7377] text-[#0D7377] hover:bg-[#0D7377]/5 px-8 py-6 text-base"
              >
                <Play className="mr-2 h-5 w-5" />
                Xem cách hoạt động
              </Button>
            </div>

            {/* Trust badge */}
            <p className="text-sm text-slate-500">
              Không cần thẻ tín dụng. Dùng thử gói Cộng đồng miễn phí trọn đờii.
            </p>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/hero.jpg"
                alt="Bác sĩ hướng dẫn phụ huynh can thiệp tại nhà"
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D7377]/20 to-transparent" />
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
                <div className="h-full w-3/4 bg-gradient-to-r from-[#0D7377] to-[#32E0C4] rounded-full" />
              </div>
            </div>

            {/* Another floating card */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0D7377]/10 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-[#0D7377]" />
                </div>
                <p className="text-sm font-medium text-slate-700">Video đã ghi chú</p>
              </div>
              <p className="text-2xl font-bold text-[#0D7377] mt-1">1,247</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
