import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Status definitions in LOGICAL order ──
    const statusOptions = [
        { value: 'pending',                   label: 'Pesanan Baru',            icon: '📝', badgeCls: 'bg-yellow-100 text-yellow-800' },
        { value: 'kurir_menuju_lokasi',       label: 'Kurir Menuju Lokasi',     icon: '🛵', badgeCls: 'bg-sky-100 text-sky-800' },
        { value: 'barang_diterima',           label: 'Barang Diterima',         icon: '📦', badgeCls: 'bg-emerald-100 text-emerald-800' },
        { value: 'menunggu_penimbangan',      label: 'Menunggu Timbang',        icon: '⚖️', badgeCls: 'bg-amber-100 text-amber-800' },
        { value: 'menunggu_konfirmasi_berat', label: 'Konfirmasi User',         icon: '⏳', badgeCls: 'bg-orange-100 text-orange-800' },
        { value: 'washing',                   label: 'Dicuci',                  icon: '🧺', badgeCls: 'bg-cyan-100 text-cyan-800' },
        { value: 'ironing',                   label: 'Disetrika',               icon: '👔', badgeCls: 'bg-purple-100 text-purple-800' },
        { value: 'ready',                     label: 'Siap Diambil / Diantar',  icon: '✅', badgeCls: 'bg-indigo-100 text-indigo-800' },
        { value: 'delivering',                label: 'Sedang Diantar',          icon: '🚚', badgeCls: 'bg-teal-100 text-teal-800' },
        { value: 'completed',                 label: 'Selesai',                 icon: '🎉', badgeCls: 'bg-green-100 text-green-800' },
        { value: 'cancelled',                 label: 'Dibatalkan',              icon: '❌', badgeCls: 'bg-red-100 text-red-800' },
    ];

    const getStatusOption = (val) => statusOptions.find(s => s.value === val);
    const getStatusBadge = (status) => getStatusOption(status)?.badgeCls || 'bg-gray-100 text-gray-800';
    const getStatusLabel = (status) => getStatusOption(status)?.label || status;

    // ── Dynamic status filtering based on order items ──
    const getRelevantStatuses = (order) => {
        const items = order?.items || [];
        const names = items.map(i => (i.service_name || '').toLowerCase());

        const hasWashing = items.length === 0 || names.some(n =>
            n.includes('cuci') || n.includes('express') || n.includes('bedcover') || n.includes('sepatu')
        );
        const hasIroning = items.length === 0 || names.some(n =>
            n.includes('setrika') || n.includes('komplit') || n.includes('express')
        );
        const isCourier = order?.delivery_type === 'pickup_delivery';

        return statusOptions.filter(s => {
            if (s.value === 'kurir_menuju_lokasi' && !isCourier) return false;
            if (s.value === 'delivering' && !isCourier) return false;
            if (s.value === 'washing' && !hasWashing) return false;
            if (s.value === 'ironing' && !hasIroning) return false;
            return true;
        });
    };

    // ── Toast helper ──
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Data fetching ──
    const fetchOrders = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            const response = await ordersAPI.getAll(params);
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Gagal memuat pesanan', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    // ── Handlers ──
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            showToast(`Status diubah ke "${getStatusLabel(newStatus)}"`);
            fetchOrders(pagination.page);
            if (selectedOrder && selectedOrder.id === orderId) {
                const updated = await ordersAPI.getById(orderId);
                const fullOrder = updated.data.order;
                if (fullOrder.items) fullOrder.items = fullOrder.items.map(i => ({ ...i, actual_quantity: i.quantity }));
                setSelectedOrder(fullOrder);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Gagal update status', 'error');
        }
    };

    const handleUpdatePayment = async (orderId, newPaymentStatus) => {
        try {
            await ordersAPI.updatePayment(orderId, newPaymentStatus);
            showToast(newPaymentStatus === 'paid' ? 'Pembayaran ditandai Lunas ✓' : 'Pembayaran diubah ke Belum Bayar');
            fetchOrders(pagination.page);
            if (selectedOrder && selectedOrder.id === orderId) {
                const updated = await ordersAPI.getById(orderId);
                setSelectedOrder(updated.data.order);
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            showToast('Gagal update pembayaran', 'error');
        }
    };

    const handleUpdateWeight = async (e) => {
        e.preventDefault();
        if (!selectedOrder?.items) return;
        try {
            const itemsPayload = selectedOrder.items.map(item => ({
                order_item_id: item.id,
                actual_quantity: parseFloat(item.actual_quantity || item.quantity)
            }));
            await ordersAPI.updateActualWeight(selectedOrder.id, itemsPayload);
            showToast('Berat berhasil diupdate! Menunggu konfirmasi user.');
            fetchOrders(pagination.page);
            const updated = await ordersAPI.getById(selectedOrder.id);
            const fullOrder = updated.data.order;
            if (fullOrder.items) fullOrder.items = fullOrder.items.map(i => ({ ...i, actual_quantity: i.quantity }));
            setSelectedOrder(fullOrder);
        } catch (error) {
            console.error('Error updating weight:', error);
            showToast('Gagal update berat', 'error');
        }
    };

    const openModal = async (order) => {
        setIsModalOpen(true);
        setSelectedOrder(order);
        try {
            const res = await ordersAPI.getById(order.id);
            const fullOrder = res.data.order;
            if (fullOrder.items) {
                fullOrder.items = fullOrder.items.map(i => ({ ...i, actual_quantity: i.quantity }));
            }
            setSelectedOrder(fullOrder);
        } catch (error) {
            console.error('Error fetching full order details', error);
            showToast('Gagal memuat detail pesanan', 'error');
        }
    };

    // Quick filter categories for cleaner UI
    const filterGroups = [
        { label: 'Semua', value: '' },
        { label: '🆕 Baru', value: 'pending' },
        { label: '🛵 Kurir OTW', value: 'kurir_menuju_lokasi' },
        { label: '⚖️ Timbang', value: 'menunggu_penimbangan' },
        { label: '⏳ Konfirmasi', value: 'menunggu_konfirmasi_berat' },
        { label: '🧺 Proses', value: 'washing' },
        { label: '✅ Siap', value: 'ready' },
        { label: '🎉 Selesai', value: 'completed' },
        { label: '❌ Batal', value: 'cancelled' },
    ];

    // ── Loading State ──
    if (isLoading && orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Toast Notification ── */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-slide-in ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
                        {toast.message}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">← Kembali ke Dashboard</Link>
                        <h1 className="text-3xl font-bold text-gray-900">📋 Kelola Pesanan</h1>
                        <p className="text-gray-500 mt-1">
                            {pagination.total} pesanan total
                        </p>
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {filterGroups.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === f.value
                                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Orders Table ── */}
                <div className="card overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="py-16 text-center">
                            <span className="text-5xl block mb-4">📭</span>
                            <p className="text-gray-500 font-medium">Tidak ada pesanan{statusFilter ? ' dengan filter ini' : ''}</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bayar</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => openModal(order)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-gray-900 block">#{order.id.toString().padStart(4, '0')}</span>
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 mt-1 inline-block ${order.delivery_type === 'pickup_delivery' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {order.delivery_type === 'pickup_delivery' ? '🚗 Kurir' : '🚶 Mandiri'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-400">{order.customer_phone || order.customer_email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                                                        {getStatusOption(order.status)?.icon} {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.payment_status === 'paid' ? '💰 Lunas' : '⏰ Belum'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    Rp {parseInt(order.total_price || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-sm">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openModal(order); }}
                                                        className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        ✏️ Kelola
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Hal. <strong>{pagination.page}</strong> dari <strong>{pagination.totalPages}</strong> ({pagination.total} pesanan)
                                    </p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page <= 1} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
                                        <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                ORDER DETAIL MODAL
               ══════════════════════════════════════════════════════════════ */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-3xl mx-auto shadow-2xl overflow-y-auto max-h-[92vh]">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Pesanan #{selectedOrder.id?.toString().padStart(4, '0')}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${getStatusBadge(selectedOrder.status)}`}>
                                        {getStatusOption(selectedOrder.status)?.icon} {getStatusLabel(selectedOrder.status)}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedOrder.delivery_type === 'pickup_delivery' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {selectedOrder.delivery_type === 'pickup_delivery' ? '🚗 Kurir' : '🚶 Mandiri'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-sm font-bold transition-colors">&times;</button>
                        </div>

                        <div className="p-6 space-y-6">

                            {/* ── Section 1: Customer Info + Payment ── */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Customer Info */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Pelanggan</h4>
                                    <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customer_phone || '-'}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>
                                    {selectedOrder.pickup_address && (
                                        <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded-lg border border-gray-200">📍 {selectedOrder.pickup_address}</p>
                                    )}
                                    {selectedOrder.notes && (
                                        <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded-lg border border-gray-200">📝 {selectedOrder.notes}</p>
                                    )}
                                </div>

                                {/* Payment Status */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status Pembayaran</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.id, 'unpaid')}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${selectedOrder.payment_status === 'unpaid'
                                                ? 'bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/30'
                                                : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            ⏰ Belum Bayar
                                        </button>
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.id, 'paid')}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${selectedOrder.payment_status === 'paid'
                                                ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                                                : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            💰 Lunas
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span>Rp {parseInt(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        {selectedOrder.delivery_type === 'pickup_delivery' && (
                                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                <span>Ongkos Kurir</span>
                                                <span>Rp {parseInt(selectedOrder.delivery_fee || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-dashed border-gray-300">
                                            <span>Total</span>
                                            <span className="text-primary-600">Rp {parseInt(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 2: Items List ── */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detail Layanan</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">{item.service_name}</p>
                                                    <p className="text-xs text-gray-400">{item.quantity} {item.unit} × Rp {parseInt(item.unit_price || 0).toLocaleString('id-ID')}</p>
                                                </div>
                                                <p className="font-bold text-sm text-gray-900">Rp {parseInt(item.subtotal || 0).toLocaleString('id-ID')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Section 3: Update Status ── */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status Pesanan</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {getRelevantStatuses(selectedOrder).map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status.value)}
                                            className={`px-3 py-2.5 rounded-xl text-left transition-all flex items-center gap-2 text-sm ${selectedOrder.status === status.value
                                                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-300'
                                                : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-700'
                                                }`}
                                        >
                                            <span className="text-base">{status.icon}</span>
                                            <span className="font-medium truncate">{status.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Section 4: Weight Input (only when status is menunggu_penimbangan) ── */}
                            {selectedOrder.status === 'menunggu_penimbangan' && selectedOrder.items && (
                                <div className="p-4 border-2 border-orange-300 bg-orange-50 rounded-xl">
                                    <h4 className="text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                                        <span className="text-lg">⚖️</span> Input Berat / Kuantitas Aktual
                                    </h4>
                                    <p className="text-xs text-orange-600 mb-4">Masukkan berat aktual setelah penimbangan. Total harga akan dihitung ulang dan menunggu konfirmasi pelanggan.</p>
                                    <form onSubmit={handleUpdateWeight}>
                                        <div className="space-y-3 mb-4">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                                                    <div>
                                                        <p className="font-semibold text-sm">{item.service_name}</p>
                                                        <p className="text-xs text-gray-500">Estimasi: {item.quantity} {item.unit} • Rp {parseInt(item.unit_price || 0).toLocaleString('id-ID')}/{item.unit}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0.1"
                                                            required
                                                            className="w-24 px-3 py-2 text-right text-sm font-bold border-2 border-orange-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                                                            value={item.actual_quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...selectedOrder.items];
                                                                newItems[idx] = { ...newItems[idx], actual_quantity: e.target.value };
                                                                setSelectedOrder({ ...selectedOrder, items: newItems });
                                                            }}
                                                        />
                                                        <span className="text-sm font-bold text-orange-700">{item.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-orange-600/30">
                                            ⚖️ Update Berat & Minta Konfirmasi User
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* Toast animation style */}
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
