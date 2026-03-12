import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../../services/api';

export default function ServiceManagement() {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', unit: 'kg', price: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Fetch services ──
    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const res = await servicesAPI.getAll();
            setServices(res.data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('Gagal memuat layanan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    // ── Form handlers ──
    const openAddModal = () => {
        setEditingService(null);
        setForm({ name: '', description: '', unit: 'kg', price: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            description: service.description || '',
            unit: service.unit,
            price: service.price,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setForm({ name: '', description: '', unit: 'kg', price: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            unit: form.unit,
            price: parseFloat(form.price),
        };

        try {
            if (editingService) {
                await servicesAPI.update(editingService.id, payload);
                showToast(`Layanan "${payload.name}" berhasil diperbarui`);
            } else {
                await servicesAPI.create(payload);
                showToast(`Layanan "${payload.name}" berhasil ditambahkan`);
            }
            closeModal();
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            showToast(editingService ? 'Gagal memperbarui layanan' : 'Gagal menambahkan layanan', 'error');
        }
    };

    const handleDelete = async (service) => {
        if (!confirm(`Yakin ingin menghapus layanan "${service.name}"?\nLayanan yang sudah dipakai di pesanan akan dinonaktifkan (soft delete).`)) return;
        try {
            await servicesAPI.delete(service.id);
            showToast(`Layanan "${service.name}" berhasil dihapus`);
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            showToast('Gagal menghapus layanan', 'error');
        }
    };

    const getUnitLabel = (unit) => unit === 'kg' ? 'per Kg' : 'per Pcs';
    const getUnitBadge = (unit) => unit === 'kg'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700';

    // ── Loading ──
    if (isLoading && services.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Toast */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-slide-in ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">← Kembali ke Dashboard</Link>
                        <h1 className="text-3xl font-bold text-gray-900">🧺 Kelola Layanan</h1>
                        <p className="text-gray-500 mt-1">{services.length} layanan aktif</p>
                    </div>
                    <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
                        <span className="text-lg">+</span> Tambah Layanan
                    </button>
                </div>

                {/* Service Cards Grid */}
                {services.length === 0 ? (
                    <div className="card py-16 text-center">
                        <span className="text-5xl block mb-4">📭</span>
                        <p className="text-gray-500 font-medium mb-4">Belum ada layanan</p>
                        <button onClick={openAddModal} className="btn-primary">+ Tambah Layanan Pertama</button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {services.map((service) => (
                            <div key={service.id} className="card p-5 hover:shadow-lg transition-all group relative">
                                {/* Unit Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2.5 py-1 ${getUnitBadge(service.unit)}`}>
                                        {service.unit === 'kg' ? '⚖️' : '📦'} {getUnitLabel(service.unit)}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">#{service.id}</span>
                                </div>

                                {/* Service Info */}
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{service.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 min-h-[40px]">
                                    {service.description || 'Tidak ada deskripsi'}
                                </p>

                                {/* Price */}
                                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Harga</p>
                                    <p className="text-xl font-bold text-primary-600">
                                        Rp {parseInt(service.price).toLocaleString('id-ID')}
                                        <span className="text-sm text-gray-400 font-normal ml-1">/ {service.unit}</span>
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(service)}
                                        className="flex-1 py-2 text-sm font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service)}
                                        className="flex-1 py-2 text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button
                            onClick={openAddModal}
                            className="card p-5 border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/30 transition-all flex flex-col items-center justify-center min-h-[280px] group"
                        >
                            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors">
                                <span className="text-3xl text-gray-400 group-hover:text-primary-500 transition-colors">+</span>
                            </div>
                            <p className="font-semibold text-gray-400 group-hover:text-primary-600 transition-colors">Tambah Layanan Baru</p>
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════
                ADD / EDIT MODAL
               ══════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingService ? `✏️ Edit "${editingService.name}"` : '➕ Tambah Layanan Baru'}
                            </h3>
                            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 text-sm font-bold transition-colors">&times;</button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Layanan *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Cuci Komplit"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                                <textarea
                                    rows="2"
                                    placeholder="Contoh: Cuci + Setrika + Lipat"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                                />
                            </div>

                            {/* Unit & Price Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Unit */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Satuan *</label>
                                    <select
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
                                    >
                                        <option value="kg">⚖️ Kilogram (kg)</option>
                                        <option value="pcs">📦 Satuan (pcs)</option>
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga (Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="500"
                                        placeholder="8000"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {form.name && form.price && (
                                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                                    <p className="text-xs text-primary-400 uppercase tracking-wider font-bold mb-1">Preview</p>
                                    <p className="font-bold text-primary-900">{form.name}</p>
                                    <p className="text-sm text-primary-700">
                                        Rp {parseInt(form.price || 0).toLocaleString('id-ID')} / {form.unit}
                                    </p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/30 transition-colors">
                                    {editingService ? '💾 Simpan Perubahan' : '➕ Tambah Layanan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast animation */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}
