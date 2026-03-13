import { useEffect, useRef, useState } from 'react';
import { Users, Wifi, Tv, Armchair, Snowflake, Battery } from 'lucide-react';

const fleetTypes = [
  {
    name: 'Executive Class',
    seats: 30,
    features: [
      { icon: Armchair, label: 'Seat 2-1' },
      { icon: Snowflake, label: 'AC' },
      { icon: Tv, label: 'TV' },
      { icon: Wifi, label: 'WiFi' },
    ],
    description: 'Kenyamanan premium dengan konfigurasi kursi 2-1',
    image: `${import.meta.env.BASE_URL}bus-interior.jpg`,
  },
  {
    name: 'Super Executive',
    seats: 22,
    features: [
      { icon: Armchair, label: 'Seat 2-1' },
      { icon: Snowflake, label: 'AC' },
      { icon: Tv, label: 'TV' },
      { icon: Wifi, label: 'WiFi' },
      { icon: Battery, label: 'USB Port' },
    ],
    description: 'Ekstra nyaman dengan legroom lebih luas',
    image: `${import.meta.env.BASE_URL}hero-bus.jpg`,
  },
  {
    name: 'Royal Class',
    seats: 18,
    features: [
      { icon: Armchair, label: 'Seat 1-1' },
      { icon: Snowflake, label: 'AC' },
      { icon: Tv, label: 'TV Personal' },
      { icon: Wifi, label: 'WiFi' },
      { icon: Battery, label: 'USB Port' },
    ],
    description: 'Pengalaman first class dengan kursi 1-1',
    image: `${import.meta.env.BASE_URL}bus-fleet.jpg`,
  },
];

export default function Fleet() {
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

  return (
    <section
      id="armada"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            <span className="text-blue-700 text-sm font-medium">Armada Kami</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pilihan <span className="text-blue-600">Kelas Bus</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Kami menyediakan berbagai kelas bus untuk memenuhi kebutuhan perjalanan Anda,
            dari yang ekonomis hingga yang paling nyaman.
          </p>
        </div>

        {/* Fleet Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fleetTypes.map((fleet, index) => (
            <div
              key={fleet.name}
              className={`group bg-gray-50 rounded-3xl overflow-hidden hover:bg-white hover:shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={fleet.image}
                  alt={fleet.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{fleet.name}</h3>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{fleet.seats} Kursi</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">{fleet.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {fleet.features.map((feature) => (
                    <div
                      key={`${fleet.name}-${feature.label}`}
                      className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 shadow-sm"
                    >
                      <feature.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Banner */}
        <div
          className={`mt-16 bg-blue-600 rounded-3xl p-8 lg:p-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Armchair, title: 'Kursi Nyaman', desc: 'Reclining seat dengan legroom luas' },
              { icon: Snowflake, title: 'AC Premium', desc: 'Suhu optimal sepanjang perjalanan' },
              { icon: Tv, title: 'Hiburan', desc: 'TV dan musik untuk menemani perjalanan' },
              { icon: Wifi, title: 'WiFi Gratis', desc: 'Koneksi internet selama perjalanan' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-blue-100 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
