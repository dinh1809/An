import { Check, X, Shield, Zap, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Feature {
  text: string;
  included: boolean;
  strikethrough?: boolean;
}

interface Plan {
  name: string;
  price: string;
  unit: string;
  period: string;
  description: string;
  icon: typeof Zap | typeof Infinity | null;
  features: Feature[];
  note?: string;
  cta: string;
  ctaVariant: 'outline' | 'default';
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: 'GÓI CỘNG ĐỒNG',
    price: '0',
    unit: 'VNĐ',
    period: '/trọn đờii',
    description: 'Dành cho gia đình muốn thử nghiệm',
    icon: null,
    features: [
      { text: 'Nhật ký hành vi & Cảm xúc cơ bản', included: true },
      { text: 'Thư viện mục tiêu can thiệp mẫu', included: true },
      { text: 'Quay video & Gửi cho bác sĩ', included: true },
      { text: 'Lưu trữ video: Chỉ 7 ngày (Tự động xóa)', included: false, strikethrough: true },
    ],
    cta: 'Dùng thử miễn phí',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'CLINIC PARTNER',
    price: '50.000',
    unit: 'VNĐ',
    period: '/bé/tháng',
    note: 'Thanh toán 1 lần 12 tháng (600.000 VNĐ/năm)',
    description: 'Dành cho gia đình nghiêm túc với can thiệp',
    icon: Zap,
    features: [
      { text: 'Tất cả tính năng gói Cộng đồng', included: true },
      { text: '5GB Lưu trữ Video Y khoa (Chuẩn H.265)', included: true },
      { text: 'Video Annotation: Gán nhãn/vẽ lên video', included: true },
      { text: 'AI Phiên dịch Y khoa chuyên sâu', included: true },
      { text: 'Chứng nhận Bảo mật Nghị định 102/2025 & 13/2023', included: true },
    ],
    cta: 'Liên hệ triển khai',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'LƯU TRỮ TRỌN ĐỜI',
    price: '199.000',
    unit: 'VNĐ',
    period: '/năm',
    description: 'Dành cho gia đình muốn lưu giữ kỷ niệm',
    icon: Infinity,
    features: [
      { text: 'Cộng thêm 10GB lưu trữ lạnh', included: true },
      { text: 'Lưu trữ trọn đờii hành trình của con', included: true },
      { text: 'Tải xuống video gốc Full HD', included: true },
      { text: 'Khôi phục video đã xóa (30 ngày)', included: true },
    ],
    cta: 'Nâng cấp ngay',
    ctaVariant: 'outline' as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D7377] mb-4">
            Bảng giá dịch vụ
          </h2>
          <p className="text-lg text-slate-600">
            Chi phí rẻ hơn một cốc trà sữa, an toàn hơn Zalo
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-6 lg:p-8 ${
                plan.popular
                  ? 'bg-[#0D7377] text-white shadow-2xl scale-105 z-10'
                  : 'bg-white text-slate-900 border border-slate-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#32E0C4] text-[#0D7377] text-xs font-bold px-4 py-1.5 rounded-full">
                    BEST SELLER
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <p
                  className={`text-sm font-semibold tracking-wider mb-2 ${
                    plan.popular ? 'text-[#32E0C4]' : 'text-[#0D7377]'
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-xl font-bold">{plan.unit}</span>
                  <span
                    className={`text-sm ${
                      plan.popular ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                {plan.note && (
                  <p
                    className={`text-sm mt-1 ${
                      plan.popular ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {plan.note}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-[#32E0C4]' : 'text-[#0D7377]'
                        }`}
                      />
                    ) : (
                      <X
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-white/50' : 'text-slate-400'
                        }`}
                      />
                    )}
                    <span
                      className={`text-sm ${
                        feature.strikethrough
                          ? plan.popular
                            ? 'text-white/50 line-through'
                            : 'text-slate-400 line-through'
                          : plan.popular
                          ? 'text-white/90'
                          : 'text-slate-600'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full py-6 ${
                  plan.popular
                    ? 'bg-[#32E0C4] hover:bg-[#2DD4BF] text-[#0D7377] font-semibold'
                    : 'border-2 border-[#0D7377] text-[#0D7377] hover:bg-[#0D7377] hover:text-white bg-transparent'
                }`}
                variant={plan.ctaVariant}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Security Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-[#0D7377]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-8 w-8 text-[#0D7377]" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Tuân thủ Nghị định 13/2023 - Bảo vệ dữ liệu trẻ em
              </h3>
              <p className="text-slate-600">
                Hệ thống máy chủ đặt tại Việt Nam, cam kết an toàn tuyệt đối cho thông tin trẻ và gia đình theo tiêu chuẩn quốc gia.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#0D7377] text-[#0D7377] hover:bg-[#0D7377]/5 whitespace-nowrap"
            >
              Xem chứng chỉ
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
