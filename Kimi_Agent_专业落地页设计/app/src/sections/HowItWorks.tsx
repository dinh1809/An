import { Camera, Upload, MessageSquare, Repeat } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Quay video con ở nhà',
    description:
      'Đang chơi cùng con? Hãy quay lại. Không cần góc máy đẹp, không cần ánh sáng hoàn hảo. Chỉ cần thấy được con đang làm gì là đủ.',
    tip: 'Mẹo: Quay ngắn 30-60 giây là đủ để bác sĩ đánh giá.',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Tải lên An.',
    description:
      'Video được tải lên an toàn, tự động nén để tiết kiệm dung lượng. Chỉ bác sĩ điều trị của con mới có quyền xem.',
    tip: 'Dữ liệu được mã hóa đầu cuối, tuân thủ Nghị định 13.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Nhận ghi chú từ bác sĩ',
    description:
      'Bác sĩ sẽ xem và ghi chú trực tiếp trên video: "Giây 15: Mẹ nên đợi thêm 3 giây trước khi gợi ý". Chính xác đến từng giây.',
    tip: 'AI sẽ dịch thuật ngữ y khoa thành ngôn ngữ đờii thường.',
  },
  {
    number: '04',
    icon: Repeat,
    title: 'Thực hành và cải thiện',
    description:
      'Làm theo hướng dẫn, quay video lần sau để bác sĩ thấy sự tiến bộ. Mỗi video là một bước con đi lên.',
    tip: 'Lặp lại quy trình này mỗi ngày để thấy sự thay đổi.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 rounded-full mb-6">
            <span className="text-sm font-medium text-[#0D7377]">
              Cách sử dụng
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Chỉ <span className="text-[#0D7377]">4 bước đơn giản</span>
          </h2>
          <p className="text-lg text-slate-600">
            Không cần biết nhiều về công nghệ. Chúng tôi thiết kế để mọi ngườii 
            đều dùng được, kể cả ông bà.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0D7377] via-[#32E0C4] to-[#0D7377]" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-slate-50 rounded-3xl p-6 lg:p-8 h-full hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                  {/* Number */}
                  <div className="absolute -top-4 left-6 w-10 h-10 bg-[#0D7377] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 mt-4">
                    <step.icon className="h-8 w-8 text-[#0D7377]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Tip */}
                  <div className="bg-[#32E0C4]/10 rounded-xl p-4">
                    <p className="text-sm text-[#0D7377]">{step.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Video Placeholder */}
        <div className="mt-16 text-center">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377]/20 to-[#32E0C4]/20" />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-[#0D7377] border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
              <p className="text-white font-medium">Xem video hướng dẫn</p>
              <p className="text-white/70 text-sm">2 phút 30 giây</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
