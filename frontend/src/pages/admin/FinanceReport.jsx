import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

export default function FinanceReport() {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('today');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    ordersAPI.getStats(),
                    ordersAPI.getAll({ limit: 20, status: 'completed' }),
                ]);
                setStats(statsRes.data);
                setOrders(ordersRes.data.orders);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [dateRange]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Calculate additional stats
    const todayRevenue = parseInt(stats?.today?.total_revenue || 0);
    const monthlyRevenue = parseInt(stats?.monthly?.total_revenue || 0);
    const todayOrders = parseInt(stats?.today?.total_orders || 0);
    const monthlyOrders = parseInt(stats?.monthly?.total_orders || 0);
    const avgOrderValue = monthlyOrders > 0 ? Math.round(monthlyRevenue / monthlyOrders) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/admin" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">← Kembali ke Dashboard</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
                    <p className="text-gray-600">Overview pendapatan dan statistik bisnis</p>
                </div>

                {/* Revenue Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">💰</span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Hari Ini</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            Rp {todayRevenue.toLocaleString('id-ID')}
                        </div>
                        <div className="text-white/80">Pendapatan Hari Ini</div>
                    </div>

                    <div className="card p-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">📊</span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Bulan Ini</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            Rp {monthlyRevenue.toLocaleString('id-ID')}
                        </div>
                        <div className="text-white/80">Pendapatan Bulanan</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">📦</span>
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Bulan Ini</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {monthlyOrders}
                        </div>
                        <div className="text-gray-500">Total Pesanan</div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">📈</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            Rp {avgOrderValue.toLocaleString('id-ID')}
                        </div>
                        <div className="text-gray-500">Rata-rata per Order</div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Statistik Hari Ini</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Pesanan Masuk</span>
                                <span className="font-bold text-lg">{todayOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Menunggu Konfirmasi</span>
                                <span className="font-bold text-lg text-yellow-600">
                                    {stats?.today?.pending_orders || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Selesai</span>
                                <span className="font-bold text-lg text-green-600">
                                    {stats?.today?.completed_orders || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Performa</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Target Bulanan</span>
                                    <span>Rp 50.000.000</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((monthlyRevenue / 50000000) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {((monthlyRevenue / 50000000) * 100).toFixed(1)}% tercapai
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-700 mb-4">Tips Bisnis</h3>
                        <div className="bg-primary-50 rounded-xl p-4">
                            <p className="text-sm text-primary-800">
                                💡 Tingkatkan promosi di jam sibuk (17.00-20.00) untuk meningkatkan konversi pesanan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Completed Orders */}
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Transaksi Selesai Terbaru</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.filter(o => o.status === 'completed').slice(0, 10).map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-medium">
                                            #{order.id.toString().padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${order.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.payment_status === 'paid' ? '✓ Lunas' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.filter(o => o.status === 'completed').length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            Belum ada transaksi selesai
                        </div>
                    )}
                </div>

                {/* Export Button */}
                <div className="mt-6 text-center">
                    <button className="btn-secondary">
                        📥 Export Laporan (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
