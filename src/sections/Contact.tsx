import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const routes = [
  'Jakarta - Bandung',
  'Jakarta - Semarang',
  'Jakarta - Yogyakarta',
  'Jakarta - Surabaya',
  'Bandung - Jakarta',
  'Semarang - Jakarta',
  'Yogyakarta - Jakarta',
  'Surabaya - Jakarta',
];

const busClasses = [
  'Executive Class',
  'Super Executive',
  'Royal Class',
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    route: '',
    busClass: '',
    date: '',
    passengers: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      route: '',
      busClass: '',
      date: '',
      passengers: '',
    });
  };

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
            Isi formulir pemesanan di bawah ini dan tim kami akan segera menghubungi Anda 
            untuk konfirmasi pemesanan.
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

          {/* Booking Form */}
          <div
            className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-3xl p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-200 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0812-3456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white border-gray-200 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-200 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rute Perjalanan</Label>
                  <Select
                    value={formData.route}
                    onValueChange={(value) => setFormData({ ...formData, route: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12">
                      <SelectValue placeholder="Pilih rute" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route} value={route}>
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kelas Bus</Label>
                  <Select
                    value={formData.busClass}
                    onValueChange={(value) => setFormData({ ...formData, busClass: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-xl h-12">
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {busClasses.map((busClass) => (
                        <SelectItem key={busClass} value={busClass}>
                          {busClass}
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
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="bg-white border-gray-200 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="passengers">Jumlah Penumpang</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Masukkan jumlah penumpang"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    required
                    className="bg-white border-gray-200 rounded-xl h-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 text-lg font-semibold"
              >
                <Send className="w-5 h-5 mr-2" />
                Kirim Pemesanan
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Pemesanan Berhasil!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Terima kasih telah memesan tiket di PO Bus Sinar Muda. Tim kami akan segera menghubungi Anda untuk konfirmasi pemesanan.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
