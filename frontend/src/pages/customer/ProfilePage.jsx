import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authAPI.getProfile();
                const u = res.data.user;
                setForm({
                    name: u.name || '',
                    phone: u.phone || '',
                    address: u.address || '',
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                showToast('Gagal memuat profil', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await authAPI.updateProfile(form);
            // Update auth store with new data
            useAuthStore.setState({
                user: { ...user, ...res.data.user }
            });
            showToast('Profil berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Gagal menyimpan perubahan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Toast */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                        style={{ animation: 'slideIn 0.3s ease-out' }}>
                        <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">← Kembali ke Dashboard</Link>
                    <h1 className="text-3xl font-bold text-gray-900">👤 Profil Saya</h1>
                    <p className="text-gray-500 mt-1">Kelola informasi akun Anda</p>
                </div>

                {/* Profile Card */}
                <div className="card p-6 mb-6">
                    {/* Avatar & Email (read-only) */}
                    <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
                            {(form.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{form.name || 'Pengguna'}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                {user?.role === 'admin' ? 'Admin' : 'Pelanggan'}
                            </span>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                placeholder="Masukkan nama lengkap"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon</label>
                            <input
                                type="tel"
                                placeholder="0812-xxxx-xxxx"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Digunakan sebagai default saat memesan layanan kurir</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                            <textarea
                                rows="3"
                                placeholder="Jl. Contoh No. 123, Kota"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Digunakan sebagai default alamat penjemputan kurir</p>
                        </div>

                        {/* Info box */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                            <span className="mt-0.5">💡</span>
                            <span>Data nomor telepon dan alamat akan otomatis terisi saat Anda membuat pesanan baru dengan layanan kurir. Anda tetap bisa mengubahnya per-pesanan.</span>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-500/30 disabled:opacity-50"
                        >
                            {isSaving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                        </button>
                    </form>
                </div>

                {/* Email & Security Section */}
                <div className="card p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Keamanan Akun</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Tidak dapat diubah</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Password</p>
                                <p className="text-xs text-gray-500">••••••••</p>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
