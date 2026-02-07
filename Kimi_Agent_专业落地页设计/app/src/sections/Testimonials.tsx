import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Chị Lan Anh',
    role: 'Mẹ bé Minh Khôi (4 tuổi)',
    location: 'Hà Nội',
    content:
      'Trước đây tôi cứ nghĩ con đi học cả ngày ở trung tâm là đủ. Đến khi dùng An., tôi mới biết mình có thể giúp con nhiều đến vậy. Video ghi chú của bác sĩ rất dễ hiểu, tôi làm theo và thấy con tiến bộ rõ rệt sau 2 tháng.',
    rating: 5,
    highlight: 'Con tiến bộ sau 2 tháng',
  },
  {
    name: 'Anh Đức Thịnh',
    role: 'Bố bé Bảo An (6 tuổi)',
    location: 'TP. Hồ Chí Minh',
    content:
      'Tôi là dân kỹ thuật, không giỏi nói chuyện với bác sĩ. Nhưng với An., tôi chỉ cần quay video con chơi là đủ. AI dịch thuật ngữ y khoa giúp tôi hiểu được "Echolalia" là gì và cách xử lý. Rất tiện lợi.',
    rating: 5,
    highlight: 'AI dịch thuật ngữ rất hay',
  },
  {
    name: 'Chị Ngọc Hà',
    role: 'Mẹ bé Thùy Linh (5 tuổi)',
    location: 'Đà Nẵng',
    content:
      'Điều tôi thích nhất là dữ liệu của con được lưu trữ an toàn. Tôi không còn lo lắng khi gửi video con qua Zalo nữa. Giá cả cũng rất hợp lý, chỉ bằng vài cốc trà sữa mỗi tháng.',
    rating: 5,
    highlight: 'An toàn hơn Zalo',
  },
  {
    name: 'Bác sĩ Nguyễn Văn Tùng',
    role: 'Chuyên gia Can thiệp Sớm',
    location: 'Trung tâm ABC, Hà Nội',
    content:
      'Là bác sĩ, tôi thấy An. giúp tôi làm việc hiệu quả hơn rất nhiều. Thay vì phải giải thích lại nhiều lần, tôi chỉ cần ghi chú trực tiếp trên video. Phụ huynh cũng tuân thủ y lệnh tốt hơn.',
    rating: 5,
    highlight: 'Hiệu quả cho cả bác sĩ',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 rounded-full mb-6">
            <span className="text-sm font-medium text-[#0D7377]">
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
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-slate-50 rounded-3xl p-6 lg:p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 bg-[#0D7377]/10 rounded-xl flex items-center justify-center mb-4">
                <Quote className="h-5 w-5 text-[#0D7377]" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Highlight */}
              <div className="inline-block bg-[#32E0C4]/20 text-[#0D7377] text-sm font-medium px-3 py-1 rounded-full mb-6">
                {testimonial.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0D7377] to-[#32E0C4] rounded-full flex items-center justify-center text-white font-bold">
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
            <p className="text-4xl font-bold text-[#0D7377]">500+</p>
            <p className="text-slate-600 mt-1">Gia đình đang dùng</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#0D7377]">50+</p>
            <p className="text-slate-600 mt-1">Trung tâm liên kết</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#0D7377]">10,000+</p>
            <p className="text-slate-600 mt-1">Video đã ghi chú</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#0D7377]">4.9/5</p>
            <p className="text-slate-600 mt-1">Đánh giá từ phụ huynh</p>
          </div>
        </div>
      </div>
    </section>
  );
}
