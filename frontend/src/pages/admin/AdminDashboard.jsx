import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    ordersAPI.getStats(),
                    ordersAPI.getAll({ limit: 5 }),
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data.orders);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview bisnis LaundryKu</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Hari Ini</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {stats?.today?.total_orders || 0}
                        </div>
                        <div className="text-gray-500">Total Pesanan</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Hari Ini</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            Rp {parseInt(stats?.today?.total_revenue || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-gray-500">Pendapatan</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {stats?.today?.pending_orders || 0}
                        </div>
                        <div className="text-gray-500">Menunggu Konfirmasi</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Bulan Ini</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            Rp {parseInt(stats?.monthly?.total_revenue || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-gray-500">Pendapatan Bulanan</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/admin/orders" className="card p-6 hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl text-white">📋</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Kelola Pesanan</h3>
                                <p className="text-sm text-gray-500">Lihat dan update status</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/services" className="card p-6 hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl text-white">🧺</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Kelola Layanan</h3>
                                <p className="text-sm text-gray-500">Tambah/edit layanan</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/reports" className="card p-6 hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl text-white">📈</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Laporan</h3>
                                <p className="text-sm text-gray-500">Lihat laporan keuangan</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/settings" className="card p-6 hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl text-white">⚙️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Pengaturan</h3>
                                <p className="text-sm text-gray-500">Ongkir & Konfigurasi</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
                            <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                Lihat Semua →
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            #{order.id.toString().padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
