import { useEffect, useRef, useState } from 'react';
import { Star, Quote, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TestimonialRow {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  profile?: { full_name: string } | null;
}

const FALLBACK_TESTIMONIALS: TestimonialRow[] = [
  { id: '1', rating: 5, content: 'Saya sudah menggunakan PO Bus Sinar Muda selama 5 tahun. Pelayanannya selalu konsisten, busnya nyaman dan supirnya sangat profesional. Highly recommended!', created_at: '', profile: { full_name: 'Budi Santoso' } },
  { id: '2', rating: 5, content: 'Perjalanan Jakarta-Bandung jadi lebih menyenangkan dengan Sinar Muda. AC dingin, kursi nyaman, dan selalu tepat waktu. Anak-anak juga suka naik bus ini.', created_at: '', profile: { full_name: 'Siti Rahayu' } },
  { id: '3', rating: 5, content: 'Sebagai pengusaha yang sering traveling, saya butuh transportasi yang reliable. PO Bus Sinar Muda selalu menjadi pilihan utama saya untuk perjalanan bisnis.', created_at: '', profile: { full_name: 'Ahmad Wijaya' } },
  { id: '4', rating: 5, content: 'Harga tiketnya terjangkau tapi kualitasnya premium. WiFi gratis dan colokan USB sangat membantu untuk mengerjakan tugas selama perjalanan.', created_at: '', profile: { full_name: 'Dewi Kusuma' } },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user, profile } = useAuth();

  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // Submit form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchTestimonials = async () => {
      setTestimonialsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        const { data, error } = await db
          .from('testimonials')
          .select('id, rating, content, created_at, profile:profiles(full_name)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(8) as { data: TestimonialRow[] | null; error: Error | null };

        if (error) throw error;
        setTestimonials(data && data.length > 0 ? data : FALLBACK_TESTIMONIALS);
      } catch {
        setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk memberikan testimoni.');
      return;
    }
    if (content.trim().length < 10) {
      toast.error('Testimoni minimal 10 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error } = await db.from('testimonials').insert({
        user_id: user.id,
        rating,
        content: content.trim(),
        is_approved: false,
      }) as { error: Error | null };

      if (error) throw error;
      toast.success('Testimoni berhasil dikirim! Akan ditampilkan setelah moderasi.');
      setContent('');
      setRating(5);
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim testimoni.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const displayedTestimonials = testimonialsLoading ? FALLBACK_TESTIMONIALS : testimonials;

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
          {displayedTestimonials.map((testimonial, index) => {
            const initials = (testimonial.profile?.full_name || 'U')
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <div
                key={testimonial.id}
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
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.profile?.full_name || 'Pengguna'}</p>
                    <p className="text-gray-500 text-xs">Pelanggan Sinar Muda</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Testimonial */}
        <div
          className={`mt-12 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                <Star className="w-4 h-4" />
                Bagikan Pengalaman Anda
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tulis Testimoni</h3>
              <form onSubmit={handleSubmitTestimonial} className="space-y-5">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cerita Pengalaman Anda</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Bagikan pengalaman perjalanan Anda bersama PO Bus Sinar Muda..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/500</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          )}
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
