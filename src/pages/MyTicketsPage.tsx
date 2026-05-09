import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Bus, ArrowLeft, Calendar, MapPin, Users, ChevronRight,
  Ticket, AlertCircle, Printer, XCircle, Loader2,
} from 'lucide-react';

interface ScheduleInfo {
  id: string;
  date: string;
  departure_time: string;
  route: { from_city: string; to_city: string } | null;
  bus_class: { name: string } | null;
}

interface BookingRow {
  id: string;
  booking_code: string;
  schedule_id: string;
  total_passengers: number;
  total_price: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  schedule?: ScheduleInfo | null;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Menunggu Pembayaran' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Dikonfirmasi' },
  paid: { bg: 'bg-green-50', text: 'text-green-700', label: 'Sudah Dibayar' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Selesai' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Dibatalkan' },
};

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setFetchError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      const { data, error } = await db
        .from('bookings')
        .select(`
          id, booking_code, schedule_id, total_passengers, total_price,
          status, payment_method, created_at,
          schedule:schedules (
            id, date, departure_time,
            route:routes ( from_city, to_city ),
            bus_class:bus_classes ( name )
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }) as { data: BookingRow[] | null; error: Error | null };

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat tiket. Silakan coba lagi.';
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  };

  // Parse schedule_id to extract routeId, classId, date
  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Yakin ingin membatalkan pemesanan ini? Tindakan tidak dapat diurungkan.')) return;
    setCancellingId(bookingId);
    try {
      const db = supabase as any;
      const { error } = await db
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user!.id);
      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      toast.success('Pemesanan berhasil dibatalkan.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error('Gagal membatalkan pemesanan: ' + msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handlePrintTicket = (booking: BookingRow) => {
    const fromCity = booking.schedule?.route?.from_city || '—';
    const toCity = booking.schedule?.route?.to_city || '—';
    const className = booking.schedule?.bus_class?.name || '—';
    const date = booking.schedule?.date || '—';
    const depTime = booking.schedule?.departure_time || '';
    const statusLabels: Record<string, string> = {
      pending: 'Menunggu Pembayaran',
      paid: 'Sudah Dibayar',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      confirmed: 'Dikonfirmasi',
    };
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Tiket #${booking.booking_code}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1a1a1a; }
    h1 { color: #2563eb; margin-bottom: 4px; }
    .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .code { font-family: monospace; font-size: 22px; letter-spacing: 4px; color: #2563eb; text-align: center; padding: 16px; background: #eff6ff; border-radius: 8px; margin: 16px 0; }
    .route { font-size: 20px; font-weight: 700; text-align: center; margin: 12px 0; }
    .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>PO Bus Sinar Muda</h1>
  <p class="sub">E-Ticket Perjalanan</p>
  <div class="card">
    <div class="code">${booking.booking_code}</div>
    <div class="route">${fromCity} → ${toCity}</div>
    <div class="row"><span class="label">Tanggal</span><span class="value">${date}</span></div>
    <div class="row"><span class="label">Keberangkatan</span><span class="value">${depTime || '—'}</span></div>
    <div class="row"><span class="label">Kelas Bus</span><span class="value">${className}</span></div>
    <div class="row"><span class="label">Jumlah Penumpang</span><span class="value">${booking.total_passengers}</span></div>
    <div class="row"><span class="label">Total Bayar</span><span class="value">Rp ${booking.total_price?.toLocaleString('id-ID')}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${statusLabels[booking.status] || booking.status}</span></div>
  </div>
  <p class="footer">Harap tunjukkan e-ticket ini kepada petugas saat naik. Tiket dicetak pada ${new Date().toLocaleString('id-ID')}.</p>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const filters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Batal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tiket Saya</h1>
                <p className="text-sm text-gray-500">Kelola pemesanan tiket Anda</p>
              </div>
            </div>
            <Link to="/booking">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Ticket className="w-4 h-4 mr-2" />
                Pesan Baru
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat tiket...</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat tiket</p>
              <p className="text-sm mt-1">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Tiket</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Anda belum memiliki pemesanan tiket.'
                : 'Tidak ada tiket dengan status ini.'}
            </p>
            <Link to="/booking">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8">
                Pesan Tiket Sekarang
              </Button>
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const status = statusColors[booking.status] || statusColors.pending;
            const fromCity = booking.schedule?.route?.from_city;
            const toCity = booking.schedule?.route?.to_city;
            const className = booking.schedule?.bus_class?.name;
            const date = booking.schedule?.date;
            const depTime = booking.schedule?.departure_time;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    {/* Booking Code & Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-mono text-gray-400">#{booking.booking_code}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{fromCity || '—'}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span>{toCity || '—'}</span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{date}{depTime ? ` · ${depTime}` : ''}</span>
                        </div>
                      )}
                      {className && (
                        <div className="flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5" />
                          <span>{className}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{booking.total_passengers} penumpang</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-blue-600">
                      Rp {booking.total_price?.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                {booking.status !== 'cancelled' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5 text-gray-600 hover:text-gray-800"
                      onClick={() => handlePrintTicket(booking)}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Tiket
                    </Button>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        Batalkan
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
