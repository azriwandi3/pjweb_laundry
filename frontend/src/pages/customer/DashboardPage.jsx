import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ordersAPI } from '../../services/api';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersAPI.getAll({ limit: 5 });
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge-pending',
            picked_up: 'bg-blue-100 text-blue-800',
            washing: 'bg-cyan-100 text-cyan-800',
            ironing: 'bg-purple-100 text-purple-800',
            ready: 'bg-indigo-100 text-indigo-800',
            delivering: 'bg-orange-100 text-orange-800',
            completed: 'badge-completed',
            cancelled: 'badge-cancelled',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="card p-6 mb-8 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Halo, {user?.name}! 👋
                            </h1>
                            <p className="text-white/80">
                                Selamat datang kembali di LaundryKu
                            </p>
                        </div>
                        <Link to="/order" className="btn bg-white text-primary-600 hover:bg-gray-100">
                            + Pesan Baru
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                                </div>
                                <div className="text-gray-500">Pesanan Aktif</div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {orders.filter(o => o.status === 'completed').length}
                                </div>
                                <div className="text-gray-500">Pesanan Selesai</div>
                            </div>
                        </div>
                    </div>

                    <Link to="/profile" className="card p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">👤</span>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">Profil</div>
                                <div className="text-gray-500">Edit Data Anda</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
                            <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                Lihat Semua →
                            </Link>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="text-6xl mb-4 block">📋</span>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
                            <p className="text-gray-500 mb-4">Mulai pesan layanan laundry sekarang!</p>
                            <Link to="/order" className="btn-primary inline-block">
                                Pesan Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="font-semibold text-gray-900">
                                                    Order #{order.id.toString().padStart(4, '0')}
                                                </span>
                                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-gray-900">
                                                Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                                            </div>
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
