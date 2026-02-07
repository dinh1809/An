import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  scrollY: number;
}

const navLinks = [
  { name: 'Vấn đề', href: '#problem' },
  { name: 'Giải pháp', href: '#solution' },
  { name: 'Cách hoạt động', href: '#how-it-works' },
  { name: 'Bảng giá', href: '#pricing' },
  { name: 'Câu chuyện', href: '#testimonials' },
  { name: 'Hỏi đáp', href: '#faq' },
];

export default function Navbar({ scrollY }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = scrollY > 50;

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="An. Logo"
              className="h-10 w-auto"
            />
            <span className="font-semibold text-lg text-[#0D7377]">An.</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-slate-600 hover:text-[#0D7377] transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-[#0D7377] hover:text-[#0D7377] hover:bg-[#0D7377]/10"
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => scrollToSection('#pricing')}
              className="bg-[#0D7377] hover:bg-[#0A5A5D] text-white"
            >
              Dùng thử miễn phí
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-600"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-3 text-left text-slate-600 hover:text-[#0D7377] hover:bg-[#0D7377]/5 rounded-lg transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-4 px-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start text-[#0D7377]"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => scrollToSection('#pricing')}
                  className="bg-[#0D7377] hover:bg-[#0A5A5D] text-white"
                >
                  Dùng thử miễn phí
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
