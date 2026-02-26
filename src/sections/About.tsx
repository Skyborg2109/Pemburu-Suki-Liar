import { useEffect, useRef, useState } from 'react';
import { Shield, Clock, Award, Users } from 'lucide-react';

const stats = [
  { icon: Clock, value: '15+', label: 'Tahun Pengalaman' },
  { icon: Users, value: '500K+', label: 'Pelanggan Puas' },
  { icon: Shield, value: '100%', label: 'Keamanan Terjamin' },
  { icon: Award, value: '50+', label: 'Armada Bus' },
];

export default function About() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="tentang"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/bus-fleet.jpg"
                alt="Armada PO Bus Sinar Muda"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white rounded-2xl p-6 shadow-xl">
              <p className="text-4xl font-bold">15+</p>
              <p className="text-blue-100">Tahun</p>
              <p className="text-sm text-blue-200">Pengalaman</p>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-blue-700 text-sm font-medium">Tentang Kami</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Perjalanan Nyaman &{' '}
              <span className="text-blue-600">Aman Bersama Kami</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              PO Bus Sinar Muda telah melayani perjalanan antar kota di Pulau Jawa sejak 2009. 
              Dengan armada bus modern dan tim profesional, kami berkomitmen memberikan 
              pengalaman perjalanan terbaik untuk setiap penumpang.
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Kami memahami bahwa kenyamanan dan keselamatan adalah prioritas utama. 
              Oleh karena itu, seluruh armada kami dilengkapi dengan fasilitas terbaik 
              dan selalu melalui pemeliharaan rutin untuk memastikan keamanan perjalanan Anda.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                'Armada Bus Modern',
                'Supir Berpengalaman',
                'Harga Terjangkau',
                'Jadwal Tepat Waktu',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-blue-50 transition-colors group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <stat.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
