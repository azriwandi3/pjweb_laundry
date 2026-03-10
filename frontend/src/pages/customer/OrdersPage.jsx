import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function OrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await ordersAPI.getAll({ page, limit: 10 });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            menunggu_penimbangan: 'bg-yellow-100 text-yellow-800',
            menunggu_konfirmasi_berat: 'bg-red-100 text-red-800 animate-pulse',
            kurir_menuju_lokasi: 'bg-sky-100 text-sky-800',
            barang_diterima: 'bg-emerald-100 text-emerald-800',
            pending: 'bg-yellow-100 text-yellow-800',
            picked_up: 'bg-blue-100 text-blue-800',
            washing: 'bg-cyan-100 text-cyan-800',
            ironing: 'bg-purple-100 text-purple-800',
            ready: 'bg-indigo-100 text-indigo-800',
            delivering: 'bg-orange-100 text-orange-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            menunggu_penimbangan: 'Menunggu Timbang',
            menunggu_konfirmasi_berat: 'Menunggu Konfirmasi',
            kurir_menuju_lokasi: 'Kurir Menuju Lokasi',
            barang_diterima: 'Barang Diterima',
            pending: 'Menunggu',
            picked_up: 'Dijemput',
            washing: 'Dicuci',
            ironing: 'Disetrika',
            ready: 'Siap',
            delivering: 'Diantar',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        };
        return texts[status] || status;
    };

    const handleConfirmWeight = async (orderId) => {
        if (!confirm('Apakah Anda menyetujui total harga baru ini?')) return;
        try {
            await ordersAPI.confirmWeight(orderId);
            fetchOrders(pagination.page); // Refresh order list
        } catch (error) {
            console.error('Error confirming weight:', error);
            alert('Gagal mengkonfirmasi.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
                        <p className="text-gray-600">Semua pesanan laundry Anda</p>
                    </div>
                    <Link to="/order" className="btn-primary">
                        + Pesan Baru
                    </Link>
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card p-12 text-center">
                        <span className="text-6xl mb-4 block">📋</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
                        <p className="text-gray-500 mb-4">Mulai pesan layanan laundry sekarang!</p>
                        <Link to="/order" className="btn-primary inline-block">
                            Pesan Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="font-bold text-gray-900 relative">
                                                Order #{order.id.toString().padStart(4, '0')}
                                                {/* Red Dot Unread Indicator */}
                                                {order.has_unread_update === 1 && (
                                                    <span className="absolute -top-1 -right-3 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                    </span>
                                                )}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 inline-block ${order.delivery_type === 'pickup_delivery' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {order.delivery_type === 'pickup_delivery' ? '🚗 Kurir' : '🚶 Ambil Sendiri'}
                                            </span>
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                            {order.payment_status === 'paid' && (
                                                <span className="badge bg-green-100 text-green-800">Lunas</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="font-bold text-lg text-gray-900">
                                                Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {order.status === 'menunggu_konfirmasi_berat' && (
                                                <button
                                                    onClick={() => handleConfirmWeight(order.id)}
                                                    className="btn-primary text-sm py-2 px-4 shadow-md hover:shadow-lg animate-bounce"
                                                    title="Konfirmasi Harga"
                                                >
                                                    Minta Persetujuan!
                                                </button>
                                            )}
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="btn-secondary text-sm py-2 px-4 text-center"
                                            >
                                                Track
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => fetchOrders(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
                                >
                                    ← Prev
                                </button>
                                <span className="text-gray-600">
                                    Halaman {pagination.page} dari {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => fetchOrders(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
