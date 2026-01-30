import { Video, Brain, FileCheck, MessageCircle, Lock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Video Annotation từng giây',
    description:
      'Quay video con chơi ở nhà, bác sĩ sẽ ghi chú chính xác vào giây thứ 15: "Mẹ làm sai bước này, cần sửa lại tay". Không còn báo cáo khô khan.',
    color: 'from-[#0D7377] to-[#14919A]',
  },
  {
    icon: Brain,
    title: 'AI Phiên dịch Y khoa',
    description:
      'Đừng lo nếu bạn không hiểu "Echolalia" hay "Sensory Overload". AI sẽ dịch thành: "Con đang nhại lờii vì chưa hiểu, hãy dùng câu ngắn hơn".',
    color: 'from-[#14919A] to-[#32E0C4]',
  },
  {
    icon: FileCheck,
    title: 'Hồ sơ Năng lực Dài hạn',
    description:
      'Mỗi video, mỗi bài tập đều được lưu trữ an toàn. Khi con 18 tuổi, bạn có dữ liệu chứng minh năng lực thay vì "hai bàn tay trắng".',
    color: 'from-[#32E0C4] to-[#0D7377]',
  },
  {
    icon: MessageCircle,
    title: 'Cộng đồng Ẩn danh',
    description:
      'Kết nối với các gia đình khác, chia sẻ kinh nghiệm mà không lo bị đánh giá. Chúng tôi hiểu cảm giác của bạn.',
    color: 'from-[#0D7377] to-[#14919A]',
  },
  {
    icon: Lock,
    title: 'An toàn tuyệt đối',
    description:
      'Dữ liệu video của con được mã hóa đầu cuối, lưu trữ tại Việt Nam. Tuân thủ nghiêm ngặt Nghị định 13/2023 & 102/2025.',
    color: 'from-[#14919A] to-[#32E0C4]',
  },
  {
    icon: TrendingUp,
    title: 'Tăng thờii gian can thiệp',
    description:
      'Từ 45 phút/tuần tại trung tâm, lên đến 20 giờ/tuận tại nhà. Hiệu quả tăng gấp 26 lần mà không tốn thêm chi phí.',
    color: 'from-[#32E0C4] to-[#0D7377]',
  },
];

export default function Solution() {
  return (
    <section id="solution" className="py-20 lg:py-28 bg-gradient-to-b from-white to-[#F0FDFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D7377]/10 rounded-full mb-6">
            <span className="text-sm font-medium text-[#0D7377]">
              Giải pháp của An.
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Biến cha mẹ thành{' '}
            <span className="text-[#0D7377]">đồng trị liệu viên</span>
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
        <div className="mt-16 bg-[#0D7377] rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Khác biệt so với các phần mềm khác?
              </h3>
              <p className="text-white/90 leading-relaxed">
                Luca Education giúp trung tâm quản lý sổ sách. Zalo giúp gửi tin nhắn. 
                Nhưng <strong>An. giúp con bạn tiến bộ</strong> - bằng cách biến video 
                sinh hoạt đờii thường thành dữ liệu lâm sàng có giá trị.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold">26x</p>
                <p className="text-sm text-white/80">Thờii gian can thiệp</p>
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
  );
}
