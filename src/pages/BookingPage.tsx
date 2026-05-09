import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bus, ArrowLeft, MapPin, Clock, Users, ChevronRight,
  Check, CreditCard, Armchair, ArrowRight, Ticket, CheckCircle,
  User, Phone, Loader2, AlertCircle,
} from 'lucide-react';
import type { Route, BusClass, PaymentMethod, BookingStatus, Booking } from '@/types/database';



type Passenger = { name: string; phone: string; seat: string };

const STEPS = [
  { id: 1, label: 'Rute & Tanggal', icon: MapPin },
  { id: 2, label: 'Kelas & Jadwal', icon: Bus },
  { id: 3, label: 'Pilih Kursi', icon: Armchair },
  { id: 4, label: 'Data Penumpang', icon: Users },
  { id: 5, label: 'Konfirmasi', icon: CheckCircle },
];

// ───────── Seat Map Component ─────────
function SeatMap({
  seatConfig,
  totalSeats,
  selectedSeats,
  onSeatToggle,
  maxSeats,
  occupiedSeats,
}: {
  seatConfig: string;
  totalSeats: number;
  selectedSeats: string[];
  onSeatToggle: (seat: string) => void;
  maxSeats: number;
  occupiedSeats: Set<string>;
}) {
  const isWide = seatConfig === '2-2';
  const cols = seatConfig === '1-1' ? 2 : isWide ? 4 : 3;
  const rows = Math.ceil(totalSeats / cols);

  const getSeatId = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white border-2 border-gray-200" />
          <span className="text-gray-600">Tersedia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600" />
          <span className="text-gray-600">Dipilih</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-300" />
          <span className="text-gray-600">Terisi</span>
        </div>
      </div>

      {/* Bus Front */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-gray-200 rounded-t-2xl px-6 py-2 text-sm text-gray-600 font-medium">
          <Bus className="w-4 h-4" />
          Depan Bus
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex justify-center">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols + (seatConfig === '2-1' ? 1 : 0)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows }).map((_, row) =>
            Array.from({ length: cols }).map((_, col) => {
              // Add aisle gap for 2-1 config
              if (seatConfig === '2-1' && col === 2) {
                const seatId = getSeatId(row, col);
                const isOccupied = occupiedSeats.has(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const seatNumber = row * cols + col + 1;
                if (seatNumber > totalSeats) return <div key={`${row}-${col}`} />;

                return [
                  <div key={`aisle-${row}-${col}`} className="w-4" />,
                  <button
                    key={`seat-${row}-${col}`}
                    disabled={isOccupied || (!isSelected && selectedSeats.length >= maxSeats)}
                    onClick={() => onSeatToggle(seatId)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs font-semibold transition-all
                      ${isOccupied
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                          : selectedSeats.length >= maxSeats
                            ? 'bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      }`}
                  >
                    {seatId}
                  </button>,
                ];
              }

              if (seatConfig === '1-1' && col === 1) {
                const seatId = getSeatId(row, col);
                const isOccupied = occupiedSeats.has(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const seatNumber = row * cols + col + 1;
                if (seatNumber > totalSeats) return <div key={`${row}-${col}`} />;

                return [
                  <div key={`aisle-${row}-${col}`} className="w-6" />,
                  <button
                    key={`seat-${row}-${col}`}
                    disabled={isOccupied || (!isSelected && selectedSeats.length >= maxSeats)}
                    onClick={() => onSeatToggle(seatId)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs font-semibold transition-all
                      ${isOccupied
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                          : selectedSeats.length >= maxSeats
                            ? 'bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      }`}
                  >
                    {seatId}
                  </button>,
                ];
              }

              const seatId = getSeatId(row, col);
              const isOccupied = occupiedSeats.has(seatId);
              const isSelected = selectedSeats.includes(seatId);
              const seatNumber = row * cols + col + 1;
              if (seatNumber > totalSeats) return <div key={`${row}-${col}`} />;

              return (
                <button
                  key={`${row}-${col}`}
                  disabled={isOccupied || (!isSelected && selectedSeats.length >= maxSeats)}
                  onClick={() => onSeatToggle(seatId)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs font-semibold transition-all
                    ${isOccupied
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                        : selectedSeats.length >= maxSeats
                          ? 'bg-white border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                >
                  {seatId}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bus Back */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 bg-gray-200 rounded-b-2xl px-6 py-2 text-sm text-gray-600 font-medium">
          Belakang Bus
        </div>
      </div>
    </div>
  );
}

// ───────── Main Booking Page ─────────
export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Routes & bus classes from Supabase
  const [routes, setRoutes] = useState<Route[]>([]);
  const [busClasses, setBusClasses] = useState<BusClass[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  // Step 1: Route & Date
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);

  // Step 2: Class & Schedule
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Step 3: Seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // Step 4: Passenger data
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Fetch routes & bus classes from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      setDataError('');
      try {
        const [routesRes, classesRes] = await Promise.all([
          supabase.from('routes').select('*').eq('is_active', true).order('from_city'),
          supabase.from('bus_classes').select('*').order('price_multiplier'),
        ]);

        if (routesRes.error) throw routesRes.error;
        if (classesRes.error) throw classesRes.error;

        setRoutes((routesRes.data as Route[]) ?? []);
        setBusClasses((classesRes.data as BusClass[]) ?? []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data rute.';
        setDataError(message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch schedule UUID + occupied seats when entering step 3
  useEffect(() => {
    if (step !== 3 || !selectedRouteId || !selectedClassId || !selectedDate || !selectedTime) return;

    const fetchScheduleAndSeats = async () => {
      setSeatsLoading(true);
      setScheduleError('');
      setSelectedScheduleId('');
      try {
        // 1. Resolve schedule UUID
        const { data: scheduleData, error: scheduleErr } = await supabase
          .from('schedules')
          .select('id')
          .eq('route_id', selectedRouteId)
          .eq('bus_class_id', selectedClassId)
          .eq('date', selectedDate)
          .eq('departure_time', selectedTime)
          .single();

        if (scheduleErr || !scheduleData) {
          setScheduleError('Jadwal tidak tersedia untuk pilihan ini. Coba tanggal atau waktu lain.');
          return;
        }
        const schedId = (scheduleData as { id: string }).id;
        setSelectedScheduleId(schedId);

        // 2. Fetch occupied seats for this schedule
        const { data: activeBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('schedule_id', schedId)
          .neq('status', 'cancelled');

        if (bookingsError) throw bookingsError;

        const bookingIds = (activeBookings ?? []).map((b: { id: string }) => b.id);
        if (bookingIds.length === 0) {
          setOccupiedSeats(new Set());
          return;
        }

        const { data: seatData, error: seatsError } = await supabase
          .from('booking_passengers')
          .select('seat_number')
          .in('booking_id', bookingIds);

        if (seatsError) throw seatsError;
        setOccupiedSeats(new Set((seatData ?? []).map((s: { seat_number: string }) => s.seat_number)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data kursi.';
        toast.error(msg);
        setOccupiedSeats(new Set());
      } finally {
        setSeatsLoading(false);
      }
    };

    fetchScheduleAndSeats();
  }, [step, selectedRouteId, selectedClassId, selectedDate, selectedTime]);

  // Pre-fill from URL params
  useEffect(() => {
    const routeParam = searchParams.get('route');
    const classParam = searchParams.get('class');
    const dateParam = searchParams.get('date');
    const passengersParam = searchParams.get('passengers');
    if (routeParam) setSelectedRouteId(routeParam);
    if (classParam) setSelectedClassId(classParam);
    if (dateParam) setSelectedDate(dateParam);
    if (passengersParam) {
      const n = parseInt(passengersParam, 10);
      if (!isNaN(n) && n >= 1 && n <= 6) setPassengerCount(n);
    }
  }, [searchParams]);

  // Initialize passenger list when count changes
  useEffect(() => {
    setPassengers(
      Array.from({ length: passengerCount }, (_, i) => ({
        name: i === 0 && profile ? profile.full_name : '',
        phone: i === 0 && profile ? profile.phone : '',
        seat: selectedSeats[i] || '',
      }))
    );
  }, [passengerCount, profile]);

  // Sync seats to passengers
  useEffect(() => {
    setPassengers((prev) =>
      prev.map((p, i) => ({ ...p, seat: selectedSeats[i] || '' }))
    );
  }, [selectedSeats]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const selectedClass = busClasses.find((c) => c.id === selectedClassId);
  const pricePerSeat = selectedRoute && selectedClass
    ? selectedRoute.base_price * selectedClass.price_multiplier
    : 0;
  const totalPrice = pricePerSeat * passengerCount;

  const canProceed = () => {
    switch (step) {
      case 1: return selectedRouteId && selectedDate && passengerCount > 0;
      case 2: return selectedClassId && selectedTime;
      case 3: return selectedSeats.length === passengerCount;
      case 4: return passengers.every((p) => p.name && p.phone);
      case 5: return paymentMethod;
      default: return false;
    }
  };

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : prev.length < passengerCount
          ? [...prev, seatId]
          : prev
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    setBookingError('');

    try {
      // 1. Insert booking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: bookingData, error: insertError } = await db
        .from('bookings')
        .insert({
          user_id: user!.id,
          schedule_id: selectedScheduleId,
          total_passengers: passengerCount,
          total_price: totalPrice,
          status: 'pending' as BookingStatus,
          payment_method: paymentMethod as PaymentMethod,
          paid_at: null,
        })
        .select('id, booking_code')
        .single() as { data: Pick<Booking, 'id' | 'booking_code'> | null; error: Error | null };

      if (insertError) throw insertError;
      if (!bookingData) throw new Error('Gagal membuat pemesanan.');

      // 2. Insert passengers
      const passengerRows = passengers.map((p) => ({
        booking_id: bookingData.id,
        seat_number: p.seat,
        passenger_name: p.name,
        passenger_phone: p.phone,
      }));

      const { error: passengersError } = await db
        .from('booking_passengers')
        .insert(passengerRows) as { error: Error | null };

      if (passengersError) throw passengersError;

      // 3. Navigate to payment page only on full success
      const routeLabel = `${selectedRoute?.from_city} → ${selectedRoute?.to_city}`;
      navigate(
        `/payment?code=${bookingData.booking_code}&amount=${totalPrice}&route=${encodeURIComponent(routeLabel)}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setBookingError(message);
    } finally {
      setLoading(false);
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Submit overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex flex-col items-center justify-center gap-4">
          <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-3 shadow-xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-semibold text-gray-800">Memproses Pemesanan...</p>
            <p className="text-sm text-gray-500">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pesan Tiket</h1>
              <p className="text-sm text-gray-500">Langkah {step} dari 5</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${i > 0 ? '' : ''}`}>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-sm font-semibold
                      ${step > s.id
                        ? 'bg-green-100 text-green-600'
                        : step === s.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${
                    step >= s.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 rounded ${
                    step > s.id ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ─── Loading state ─── */}
        {dataLoading && (
          <div className="space-y-6">
            {/* Skeleton cards */}
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-4">
                <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ))}
            <div className="flex items-center gap-2 justify-center text-sm text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat data rute & kelas bus...
            </div>
          </div>
        )}

        {/* ─── Error state ─── */}
        {!dataLoading && dataError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-700 font-medium">{dataError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* ─── Step 1: Route & Date ─── */}
        {!dataLoading && !dataError && step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Pilih Rute & Tanggal
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Rute Perjalanan</Label>
                  <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Pilih rute" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          Tidak ada rute tersedia
                        </SelectItem>
                      ) : (
                        routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.from_city} → {route.to_city} ({route.duration})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Tanggal Keberangkatan</Label>
                  <Input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-12 rounded-xl bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Jumlah Penumpang</Label>
                  <Select
                    value={String(passengerCount)}
                    onValueChange={(v) => {
                      setPassengerCount(Number(v));
                      setSelectedSeats([]);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
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

              {selectedRoute && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {selectedRoute.from_city} <ArrowRight className="w-4 h-4 inline" /> {selectedRoute.to_city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{selectedRoute.duration}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Step 2: Class & Schedule ─── */}
        {!dataLoading && !dataError && step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-600" />
                Pilih Kelas Bus
              </h2>

              <div className="grid gap-4">
                {busClasses.map((cls) => {
                  const price = selectedRoute
                    ? selectedRoute.base_price * cls.price_multiplier
                    : 0;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setSelectedSeats([]);
                      }}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                        selectedClassId === cls.id
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{cls.name}</h3>
                          <p className="text-sm text-gray-500">{cls.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">
                            Rp {price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-500">/kursi</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cls.features.map((f) => (
                          <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                            {f}
                          </span>
                        ))}
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                          {cls.seats_count} kursi • Konfigurasi {cls.seat_config}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedClassId && selectedRoute && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Pilih Jam Keberangkatan
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedRoute.schedule.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-4 rounded-xl border-2 text-center transition-all font-semibold ${
                        selectedTime === time
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 3: Seat Selection ─── */}
        {!dataLoading && !dataError && step === 3 && selectedClass && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Armchair className="w-5 h-5 text-blue-600" />
                Pilih Kursi
              </h2>
              <p className="text-gray-500 mb-6">
                Pilih {passengerCount} kursi — {selectedClass.name} ({selectedClass.seat_config})
              </p>

              {seatsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Memuat ketersediaan kursi...</p>
                </div>
              ) : scheduleError ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-red-600 font-medium">{scheduleError}</p>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-blue-600 underline"
                  >
                    Kembali pilih jadwal
                  </button>
                </div>
              ) : (
                <SeatMap
                  seatConfig={selectedClass.seat_config}
                  totalSeats={selectedClass.seats_count}
                  selectedSeats={selectedSeats}
                  onSeatToggle={handleSeatToggle}
                  maxSeats={passengerCount}
                  occupiedSeats={occupiedSeats}
                />
              )}

              {selectedSeats.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    Kursi dipilih: <span className="font-semibold text-blue-700">{selectedSeats.join(', ')}</span>
                    <span className="text-gray-400 ml-2">({selectedSeats.length}/{passengerCount})</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Step 4: Passenger Data ─── */}
        {!dataLoading && !dataError && step === 4 && (
          <div className="space-y-4">
            {passengers.map((passenger, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Penumpang {index + 1}
                  <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                    Kursi {passenger.seat}
                  </span>
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Masukkan nama lengkap"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="0812-xxxx-xxxx"
                        value={passenger.phone}
                        onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Step 5: Confirmation & Payment ─── */}
        {!dataLoading && !dataError && step === 5 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                Ringkasan Pemesanan
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Rute</span>
                  <span className="font-medium text-gray-900">
                    {selectedRoute?.from_city} → {selectedRoute?.to_city}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Tanggal</span>
                  <span className="font-medium text-gray-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Jam Berangkat</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Kelas</span>
                  <span className="font-medium text-gray-900">{selectedClass?.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Kursi</span>
                  <span className="font-medium text-gray-900">{selectedSeats.join(', ')}</span>
                </div>

                {/* Passengers */}
                <div className="pt-2">
                  <p className="text-gray-500 mb-3">Penumpang</p>
                  <div className="space-y-2">
                    {passengers.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.phone}</p>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Kursi {p.seat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Harga per kursi</span>
                    <span className="text-gray-900">Rp {pricePerSeat.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Jumlah penumpang</span>
                    <span className="text-gray-900">× {passengerCount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-blue-200">
                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Metode Pembayaran
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'bank_transfer', label: 'Transfer Bank', desc: 'BCA, BNI, Mandiri, BRI' },
                  { id: 'e_wallet', label: 'E-Wallet', desc: 'GoPay, OVO, DANA, ShopeePay' },
                  { id: 'qris', label: 'QRIS', desc: 'Scan QR untuk bayar' },
                  { id: 'cash', label: 'Bayar di Agen', desc: 'Bayar tunai di loket' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="rounded-xl h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Beranda' : 'Kembali'}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 disabled:opacity-50"
            >
              Lanjutkan
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              {bookingError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {bookingError}
                </div>
              )}
              <Button
                onClick={handleConfirm}
                disabled={!canProceed() || loading}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-8 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Konfirmasi & Bayar
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
