import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RouteOption {
  id: string;
  from_city: string;
  to_city: string;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    routeId: '',
    classId: '',
    date: '',
    passengers: '1',
  });

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
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        const [routesRes, classesRes] = await Promise.all([
          db.from('routes').select('id, from_city, to_city').eq('is_active', true).order('from_city') as Promise<{ data: RouteOption[] | null; error: Error | null }>,
          db.from('bus_classes').select('id, name').order('price_multiplier') as Promise<{ data: ClassOption[] | null; error: Error | null }>,
        ]);
        if (routesRes.error) throw routesRes.error;
        if (classesRes.error) throw classesRes.error;
        setRouteOptions(routesRes.data ?? []);
        setClassOptions(classesRes.data ?? []);
      } catch {
        toast.error('Gagal memuat pilihan rute dan kelas.');
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeId) { toast.error('Pilih rute terlebih dahulu.'); return; }
    if (!formData.date) { toast.error('Pilih tanggal keberangkatan.'); return; }

    const params = new URLSearchParams();
    params.set('route', formData.routeId);
    if (formData.classId) params.set('class', formData.classId);
    params.set('date', formData.date);
    params.set('passengers', formData.passengers);
    navigate(`/booking?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section
      id="pemesanan"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
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
            <span className="text-blue-700 text-sm font-medium">Pemesanan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pesan Tiket <span className="text-blue-600">Sekarang</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Pilih rute perjalanan Anda dan lanjutkan ke halaman pemesanan untuk memilih kursi 
            dan menyelesaikan pembayaran.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="bg-blue-600 rounded-3xl p-8 text-white h-full">
              <h3 className="text-2xl font-bold mb-6">Hubungi Kami</h3>
              <p className="text-blue-100 mb-8">
                Tim customer service kami siap membantu Anda dengan pemesanan dan informasi lainnya.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Telepon/WhatsApp</p>
                    <p className="font-semibold">0812-3456-7890</p>
                    <p className="font-semibold">0813-9876-5432</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Email</p>
                    <p className="font-semibold">info@pobussinarmuda.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Kantor Pusat</p>
                    <p className="font-semibold">Terminal Lebak Bulus</p>
                    <p className="text-blue-200 text-sm">Jakarta Selatan, 12440</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Jam Operasional</p>
                    <p className="font-semibold">Setiap Hari</p>
                    <p className="text-blue-200 text-sm">05:00 - 22:00 WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Booking Form */}
          <div
            className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <form onSubmit={handleQuickBook} className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                Pemesanan Cepat
              </h3>

              {optionsLoading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memuat pilihan rute...</span>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Rute Perjalanan</Label>
                    <Select
                      value={formData.routeId}
                      onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12">
                        <SelectValue placeholder="Pilih rute" />
                      </SelectTrigger>
                      <SelectContent>
                        {routeOptions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.from_city} â†’ {r.to_city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kelas Bus</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12">
                        <SelectValue placeholder="Pilih kelas (opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal Keberangkatan</Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white border-gray-200 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah Penumpang</Label>
                    <Select
                      value={formData.passengers}
                      onValueChange={(value) => setFormData({ ...formData, passengers: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} Penumpang
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={optionsLoading}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl h-14 text-lg font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
              >
                Lanjutkan Pemesanan
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Anda akan diarahkan ke halaman pemesanan untuk memilih kursi dan menyelesaikan pembayaran.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

