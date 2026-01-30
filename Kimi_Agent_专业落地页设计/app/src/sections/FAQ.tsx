import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Tôi không giỏi công nghệ, có dùng được An. không?',
    answer:
      'Hoàn toàn được! Chúng tôi thiết kế An. để mọi ngườii đều dùng được, kể cả ông bà. Quy trình chỉ có 4 bước: Quay video → Tải lên → Nhận ghi chú → Thực hành. Nhân viên tại trung tâm cũng sẽ hướng dẫn bạn cài đặt và sử dụng ngay tại chỗ.',
  },
  {
    question: 'Dữ liệu video của con tôi có an toàn không?',
    answer:
      'Tuyệt đối an toàn. An. tuân thủ nghiêm ngặt Nghị định 13/2023 và 102/2025 về bảo vệ dữ liệu cá nhân. Video được mã hóa đầu cuối, lưu trữ tại máy chủ Việt Nam. Chỉ bác sĩ điều trị của con bạn mới có quyền xem. Chúng tôi cam kết không bán dữ liệu cho bên thứ ba.',
  },
  {
    question: 'Tôi có thể dùng thử miễn phí không?',
    answer:
      'Có! Gói Cộng đồng hoàn toàn miễn phí trọn đờii. Bạn có thể quay video, gửi cho bác sĩ và nhận hướng dẫn cơ bản. Tuy nhiên, video chỉ được lưu trong 7 ngày. Để lưu trữ lâu dài và sử dụng tính năng Video Annotation đầy đủ, bạn có thể nâng cấp lên gói Clinic Partner.',
  },
  {
    question: 'An. khác gì so với việc nhắn tin qua Zalo?',
    answer:
      'Có 3 điểm khác biệt chính: (1) An. cho phép bác sĩ ghi chú trực tiếp trên video từng giây, thay vì chỉ nhắn tin văn bản; (2) Dữ liệu trên An. được bảo mật theo tiêu chuẩn y tế, trong khi Zalo có rủi ro lộ thông tin; (3) An. tích lũy dữ liệu dài hạn để theo dõi sự tiến bộ của con.',
  },
  {
    question: 'Tôi cần quay video như thế nào?',
    answer:
      'Rất đơn giản! Bạn chỉ cần quay con đang chơi hoặc sinh hoạt ở nhà. Không cần góc máy đẹp, không cần ánh sáng hoàn hảo. Video ngắn 30-60 giây là đủ để bác sĩ đánh giá. Quan trọng là thấy được con đang làm gì và bạn đang tương tác với con như thế nào.',
  },
  {
    question: 'Bác sĩ phản hồi trong bao lâu?',
    answer:
      'Thông thường, bác sĩ sẽ phản hồi trong vòng 24-48 giờ làm việc. Trong trường hợp khẩn cấp, bạn nên liên hệ trực tiếp với trung tâm. An. không thay thế cho việc khám và điều trị trực tiếp, mà là công cụ hỗ trợ can thiệp tại nhà.',
  },
  {
    question: 'Tôi có thể hủy đăng ký bất cứ lúc nào không?',
    answer:
      'Hoàn toàn được. Bạn có thể hủy đăng ký bất cứ lúc nào mà không bị phạt. Nếu đã thanh toán trước cho cả năm, chúng tôi sẽ hoàn lại tiền cho thờii gian chưa sử dụng. Tuy nhiên, hầu hết gia đình đều ở lại vì họ thấy con tiến bộ rõ rệt.',
  },
  {
    question: 'An. có hỗ trợ các loại hình can thiệp nào?',
    answer:
      'An. hỗ trợ đa dạng các phương pháp can thiệp: ABA (Phân tích Hành vi Ứng dụng), TEACCH, Sensory Integration (Tích hợp Cảm giác), Speech Therapy (Trị liệu Ngôn ngữ), và Occupational Therapy (Trị liệu Nghề nghiệp). Bác sĩ của bạn sẽ tùy chỉnh hướng dẫn phù hợp với phương pháp đang áp dụng cho con.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 rounded-full mb-6">
            <HelpCircle className="h-4 w-4 text-[#0D7377]" />
            <span className="text-sm font-medium text-[#0D7377]">
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

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-2xl border border-slate-200 px-6 data-[state=open]:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="text-left text-slate-900 font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Vẫn còn thắc mắc? Chúng tôi luôn sẵn sàng trả lờii.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[#0D7377] font-semibold hover:underline"
          >
            Liên hệ hỗ trợ
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
