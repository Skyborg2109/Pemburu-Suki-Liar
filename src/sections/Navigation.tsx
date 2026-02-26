import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Bus } from 'lucide-react';

const navLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Rute', href: '#rute' },
  { label: 'Armada', href: '#armada' },
  { label: 'Testimoni', href: '#testimoni' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('#beranda')}
              className="flex items-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isScrolled ? 'bg-blue-600' : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <Bus className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`font-bold text-lg transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Sinar <span className="text-blue-500">Muda</span>
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.href)}
                  className={`font-medium transition-colors hover:text-blue-500 ${
                    isScrolled ? 'text-gray-700' : 'text-white/90'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Button
                onClick={() => scrollToSection('#pemesanan')}
                className={`rounded-xl px-6 transition-all ${
                  isScrolled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white text-blue-600 hover:bg-white/90'
                }`}
              >
                Pesan Tiket
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div
          className={`absolute top-0 right-0 w-80 max-w-full h-full bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Button
                  onClick={() => scrollToSection('#pemesanan')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
                >
                  Pesan Tiket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
