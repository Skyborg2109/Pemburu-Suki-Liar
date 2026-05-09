import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Bus, User, LogOut, Ticket } from 'lucide-react';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBooking = () => {
    setIsMobileMenuOpen(false);
    if (user) {
      navigate('/booking');
    } else {
      navigate('/login');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav
        translate="no"
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
              translate="no"
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
            <div className="hidden lg:flex items-center gap-8" translate="no">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`font-medium transition-colors hover:text-blue-500 ${
                    isScrolled ? 'text-gray-700' : 'text-white/90'
                  }`}
                  translate="no"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA + Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/tickets">
                    <Button
                      variant="ghost"
                      className={`rounded-xl px-4 transition-all ${
                        isScrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Tiket Saya
                    </Button>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                        isScrolled
                          ? 'hover:bg-gray-100'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className={`text-sm font-medium ${
                        isScrolled ? 'text-gray-700' : 'text-white'
                      }`}>
                        {profile?.full_name?.split(' ')[0] || 'User'}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                          <p className="text-xs text-gray-500">{profile?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Profil Saya
                        </Link>
                        <Link
                          to="/tickets"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Ticket className="w-4 h-4" />
                          Tiket Saya
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className={`rounded-xl px-4 transition-all ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Masuk
                  </Button>
                </Link>
              )}

              <Button
                onClick={handleBooking}
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
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" translate="no">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-80 max-w-full h-full bg-white shadow-2xl">
            <div className="p-6 pt-20">
              {/* User Info (Mobile) */}
              {user && profile && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    translate="no"
                  >
                    {link.label}
                  </button>
                ))}

                {user && (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profil Saya
                    </Link>
                    <Link
                      to="/tickets"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      Tiket Saya
                    </Link>
                  </>
                )}

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  <Button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
                    translate="no"
                  >
                    Pesan Tiket
                  </Button>

                  {user ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl py-6 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </Button>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl py-6"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Masuk / Daftar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
