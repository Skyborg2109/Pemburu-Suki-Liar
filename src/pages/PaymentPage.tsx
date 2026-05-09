import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, CheckCircle, Clock, CreditCard, Loader2,
  MapPin, QrCode, Banknote, Wallet, Copy, Check, Ticket,
} from 'lucide-react';

interface BookingDetail {
  id: string;
  booking_code: string;
  total_price: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const PAYMENT_INFO: Record<string, { label: string; icon: React.ReactNode; instructions: string[]; account?: string }> = {
  bank_transfer: {
    label: 'Transfer Bank',
    icon: <Banknote className="w-5 h-5" />,
    account: 'BCA 1234-5678-9012 a/n PO Sinar Muda',
    instructions: [
      'Transfer ke rekening BCA 1234-5678-9012 a/n PO Sinar Muda',
      'Masukkan nominal sesuai total pembayaran',
      'Gunakan kode booking sebagai berita transfer',
      'Klik tombol "Konfirmasi Pembayaran" setelah transfer',
    ],
  },
  e_wallet: {
    label: 'E-Wallet (GoPay / OVO / Dana)',
    icon: <Wallet className="w-5 h-5" />,
    account: 'GoPay / OVO / Dana: 0812-3456-7890',
    instructions: [
      'Transfer ke GoPay / OVO / Dana: 0812-3456-7890 a/n Sinar Muda',
      'Masukkan nominal sesuai total pembayaran',
      'Screenshot bukti transfer',
      'Klik tombol "Konfirmasi Pembayaran" setelah transfer',
    ],
  },
  qris: {
    label: 'QRIS',
    icon: <QrCode className="w-5 h-5" />,
    instructions: [
      'Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking',
      'Masukkan nominal sesuai total pembayaran',
      'Pastikan nama tujuan: PO Sinar Muda',
      'Klik tombol "Konfirmasi Pembayaran" setelah scan',
    ],
  },
  cash: {
    label: 'Bayar Tunai',
    icon: <Banknote className="w-5 h-5" />,
    instructions: [
      'Bayar tunai di loket PO Sinar Muda terdekat',
      'Tunjukkan kode booking kepada petugas',
      'Petugas akan mengonfirmasi pembayaran',
      'Anda akan menerima tiket fisik setelah pembayaran',
    ],
  },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const codeFromUrl = searchParams.get('code') ?? '';
  const amountFromUrl = Number(searchParams.get('amount') ?? 0);
  const routeFromUrl = searchParams.get('route') ?? '-';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchLatestPendingBooking();
  }, [user]);

  const fetchLatestPendingBooking = async () => {
    setLoadingBooking(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('id, booking_code, total_price, status, payment_method, created_at')
        .eq('user_id', user!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, not a real error
        toast.error('Gagal memuat detail pemesanan: ' + fetchError.message);
      }

      if (data) {
        setBooking(data as BookingDetail);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      toast.error('Gagal memuat pemesanan: ' + message);
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!booking) return;
    setConfirming(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
        .eq('user_id', user!.id);

      if (updateError) throw updateError;

      setPaid(true);
      setBooking((prev) => prev ? { ...prev, status: 'paid' } : prev);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setConfirming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayCode = booking?.booking_code ?? codeFromUrl;
  const displayAmount = booking?.total_price ?? amountFromUrl;
  const paymentMethod = booking?.payment_method ?? 'bank_transfer';
  const paymentInfo = PAYMENT_INFO[paymentMethod] ?? PAYMENT_INFO.bank_transfer;

  // ─── Success State ───
  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-500 mb-6">Tiket Anda telah dikonfirmasi. Selamat bepergian!</p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Kode Booking</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 font-mono">{displayCode}</span>
                <button
                  onClick={() => handleCopyCode(displayCode)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rute</span>
              <span className="font-medium text-gray-900 text-sm">{routeFromUrl}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Dibayar</span>
              <span className="font-bold text-green-600">{formatRupiah(displayAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/tickets')}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Ticket className="w-4 h-4 mr-2" />
              Lihat Tiket Saya
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full h-12 rounded-xl border-gray-200"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pembayaran</h1>
              <p className="text-sm text-gray-500">Selesaikan pembayaran untuk konfirmasi tiket</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Countdown notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Selesaikan pembayaran sebelum habis waktu</p>
            <p className="text-xs text-amber-600 mt-0.5">Pesanan akan otomatis dibatalkan jika pembayaran tidak diterima dalam 2 jam.</p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Ringkasan Pemesanan
            </h2>
          </div>

          {loadingBooking ? (
            <div className="px-6 py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Kode Booking</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 font-mono text-sm tracking-wider">
                    {displayCode || '—'}
                  </span>
                  {displayCode && (
                    <button
                      onClick={() => handleCopyCode(displayCode)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Salin kode"
                    >
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-green-600" />
                        : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Rute</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium text-gray-900 text-sm">{routeFromUrl}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Metode Pembayaran</span>
                <div className="flex items-center gap-1.5 text-gray-700">
                  {paymentInfo.icon}
                  <span className="text-sm font-medium">{paymentInfo.label}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Pembayaran</span>
                <span className="text-xl font-bold text-blue-600">{formatRupiah(displayAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              {paymentInfo.icon}
              Cara Pembayaran — {paymentInfo.label}
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Account info / QR */}
            {paymentMethod === 'qris' ? (
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                  <span className="sr-only">QR Code placeholder</span>
                </div>
              </div>
            ) : paymentInfo.account ? (
              <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-blue-800">{paymentInfo.account}</span>
                <button
                  onClick={() => handleCopyCode(paymentInfo.account!)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Salin"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            ) : null}

            {/* Nominal */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
              <span className="text-sm text-gray-500">Nominal transfer</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{formatRupiah(displayAmount)}</span>
                <button
                  onClick={() => handleCopyCode(String(displayAmount))}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Salin nominal"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Step by step instructions */}
            <ol className="space-y-2.5 mt-2">
              {paymentInfo.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="pb-8 space-y-3">
          <Button
            onClick={handleConfirmPayment}
            disabled={confirming || loadingBooking || !booking}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            {confirming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mengonfirmasi...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Konfirmasi Pembayaran
              </>
            )}
          </Button>

          {!booking && !loadingBooking && (
            <p className="text-center text-xs text-gray-400">
              Tidak ditemukan booking yang menunggu pembayaran.{' '}
              <button onClick={() => navigate('/booking')} className="text-blue-600 underline">
                Buat pemesanan baru
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
