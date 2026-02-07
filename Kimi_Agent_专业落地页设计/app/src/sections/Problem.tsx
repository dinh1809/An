import { Clock, Home, Frown, AlertTriangle } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: '45 phút/tuần là chưa đủ',
    description:
      'Trẻ chỉ được can thiệp chuyên sâu tại trung tâm chưa đầy 1 giờ mỗi tuần. Thờii gian còn lại - 99% - trẻ ở nhà với cha mẹ.',
    stat: '45 phút',
    statLabel: 'mỗi tuần',
  },
  {
    icon: Home,
    title: 'Cha mẹ không biết cách dạy',
    description:
      'Hầu hết phụ huynh đều muốn giúp con, nhưng không biết bắt đầu từ đâu. Những thuật ngữ y khoa khó hiểu càng làm họ thêm bối rối.',
    stat: '86%',
    statLabel: 'phụ huynh cần hỗ trợ',
  },
  {
    icon: Frown,
    title: 'Dữ liệu 10 năm bị vứt bỏ',
    description:
      'Khi trẻ trưởng thành, toàn bộ hành trình can thiệp bị mất. Không có bằng chứng năng lực để xin việc, dù con bạn rất giỏi.',
    stat: '85%',
    statLabel: 'tỷ lệ thất nghiệp',
  },
];

export default function Problem() {
  return (
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
            Can thiệp tự kỷ đang bị{' '}
            <span className="text-[#0D7377]">đứt gãy</span> ở 3 điểm
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
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-[#0D7377] group-hover:text-white transition-colors">
                <problem.icon className="h-7 w-7 text-[#0D7377] group-hover:text-white" />
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
                <p className="text-3xl font-bold text-[#0D7377]">{problem.stat}</p>
                <p className="text-sm text-slate-500">{problem.statLabel}</p>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0D7377]/5 to-transparent rounded-tr-3xl" />
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
  );
}
