import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Pelanggan Regular',
    content: 'Saya sudah menggunakan PO Bus Sinar Muda selama 5 tahun. Pelayanannya selalu konsisten, busnya nyaman dan supirnya sangat profesional. Highly recommended!',
    rating: 5,
    avatar: 'BS',
  },
  {
    name: 'Siti Rahayu',
    role: 'Ibu Rumah Tangga',
    content: 'Perjalanan Jakarta-Bandung jadi lebih menyenangkan dengan Sinar Muda. AC dingin, kursi nyaman, dan selalu tepat waktu. Anak-anak juga suka naik bus ini.',
    rating: 5,
    avatar: 'SR',
  },
  {
    name: 'Ahmad Wijaya',
    role: 'Pebisnis',
    content: 'Sebagai pengusaha yang sering traveling, saya butuh transportasi yang reliable. PO Bus Sinar Muda selalu menjadi pilihan utama saya untuk perjalanan bisnis.',
    rating: 5,
    avatar: 'AW',
  },
  {
    name: 'Dewi Kusuma',
    role: 'Mahasiswa',
    content: 'Harga tiketnya terjangkau tapi kualitasnya premium. WiFi gratis dan colokan USB sangat membantu untuk mengerjakan tugas selama perjalanan.',
    rating: 5,
    avatar: 'DK',
  },
];

export default function Testimonials() {
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
      id="testimoni"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            <span className="text-blue-700 text-sm font-medium">Testimoni</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Apa Kata <span className="text-blue-600">Pelanggan Kami</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah testimoni 
            dari para pelanggan setia PO Bus Sinar Muda.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-blue-600" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div
          className={`mt-16 flex flex-wrap justify-center items-center gap-8 lg:gap-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { value: '4.9', label: 'Rating Google' },
            { value: '500K+', label: 'Pelanggan Puas' },
            { value: '98%', label: 'Tingkat Kepuasan' },
          ].map((badge, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-blue-600">{badge.value}</p>
              <p className="text-gray-600 text-sm">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
