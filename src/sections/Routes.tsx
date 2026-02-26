import { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const routes = [
  {
    from: 'Jakarta',
    to: 'Bandung',
    duration: '3 Jam',
    price: 'Rp 85.000',
    image: `${import.meta.env.BASE_URL}dest-bandung.jpg`,
    schedule: 'Setiap Jam',
  },
  {
    from: 'Jakarta',
    to: 'Semarang',
    duration: '8 Jam',
    price: 'Rp 180.000',
    image: `${import.meta.env.BASE_URL}dest-semarang.jpg`,
    schedule: '06:00, 14:00, 20:00',
  },
  {
    from: 'Jakarta',
    to: 'Yogyakarta',
    duration: '10 Jam',
    price: 'Rp 220.000',
    image: `${import.meta.env.BASE_URL}dest-jakarta.jpg`,
    schedule: '07:00, 19:00',
  },
];

export default function Routes() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToBooking = () => {
    const element = document.getElementById('pemesanan');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="rute"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            <span className="text-blue-700 text-sm font-medium">Rute Perjalanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Destinasi <span className="text-blue-600">Populer</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Kami melayani berbagai rute perjalanan antar kota dengan jadwal yang fleksibel
            dan harga yang kompetitif.
          </p>
        </div>

        {/* Route Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={route.image}
                  alt={`${route.from} ke ${route.to}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{route.to}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900 font-semibold">{route.to}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">{route.schedule}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mulai dari</p>
                    <p className="text-xl font-bold text-blue-600">{route.price}</p>
                  </div>
                  <Button
                    onClick={scrollToBooking}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    Pesan
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Routes */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <button
            onClick={scrollToBooking}
            className="group relative inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 text-lg font-semibold rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <span className="relative">Lihat Semua Rute</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
