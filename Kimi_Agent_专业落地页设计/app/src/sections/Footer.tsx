import { Mail, Phone, MapPin, Facebook, MessageCircle } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Tính năng', href: '#solution' },
    { name: 'Bảng giá', href: '#pricing' },
    { name: 'Câu chuyện', href: '#testimonials' },
    { name: 'Hỏi đáp', href: '#faq' },
  ],
  company: [
    { name: 'Về chúng tôi', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Tuyển dụng', href: '#' },
    { name: 'Liên hệ', href: '#' },
  ],
  legal: [
    { name: 'Điều khoản dịch vụ', href: '#' },
    { name: 'Chính sách bảo mật', href: '#' },
    { name: 'Tuân thủ pháp lý', href: '#' },
    { name: 'Chứng chỉ bảo mật', href: '#' },
  ],
};

export default function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/images/logo.png"
                alt="An. Logo"
                className="h-12 w-auto"
              />
              <span className="font-semibold text-xl">An.</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
              Nền tảng can thiệp tự kỷ tại nhà đầu tiên tại Việt Nam. 
              Giúp cha mẹ trở thành đồng trị liệu viên cho con.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="h-5 w-5" />
                <span>hello@anapp.vn</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="h-5 w-5" />
                <span>090 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="h-5 w-5" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Sản phẩm</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Công ty</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Pháp lý</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © 2024 An. - Autism Therapy Management Platform. Nền tảng quản lý can thiệp chuyên nghiệp hàng đầu.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#0D7377] hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#0D7377] hover:text-white transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#0D7377] hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
