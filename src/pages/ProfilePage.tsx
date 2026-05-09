import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, User, Mail, Phone, Shield, Calendar,
  Camera, Check, Loader2, Edit3, Save,
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !user) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profil berhasil diperbarui!');
      setEditing(false);

      // Refresh the page to update profile in context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2 MB.');
      return;
    }

    setAvatarUploading(true);
    setError('');
    setSuccess('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setSuccess('Foto profil berhasil diperbarui!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah foto.';
      setError(message);
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-sm text-gray-500">Kelola informasi akun Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDE0di0xNGgtMTR6TTM2IDM0aDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          </div>

          {/* Avatar + Name */}
          <div className="px-6 sm:px-8 -mt-14 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-4xl font-bold text-blue-600">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {avatarUploading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Camera className="w-4 h-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || 'User'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.role === 'admin'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {profile?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Bergabung {memberSince}
                  </span>
                </div>
              </div>

              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="rounded-xl h-10 px-4 self-start sm:self-end"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm border border-green-100">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informasi Pribadi
          </h3>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className={`pl-10 h-12 rounded-xl transition-colors ${
                    editing
                      ? 'bg-white border-blue-300 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.email}
                  disabled
                  className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-400">Email tidak dapat diubah.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className={`pl-10 h-12 rounded-xl transition-colors ${
                    editing
                      ? 'bg-white border-blue-300 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-semibold shadow-lg shadow-blue-600/25"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        email: profile.email || '',
                      });
                    }
                  }}
                  className="rounded-xl h-12 px-6"
                >
                  Batal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Akun & Keamanan
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">User ID</p>
                <p className="text-sm text-gray-400 font-mono">{user?.id?.slice(0, 16)}...</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Provider</p>
                <p className="text-sm text-gray-500">Email & Password</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Bergabung Sejak</p>
                <p className="text-sm text-gray-500">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-red-600 mb-2">Zona Berbahaya</h3>
          <p className="text-sm text-gray-500 mb-4">
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Keluar dari Akun
          </Button>
        </div>
      </div>
    </div>
  );
}
