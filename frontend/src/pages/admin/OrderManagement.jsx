import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statusOptions = [
        { value: 'menunggu_penimbangan', label: 'Menunggu Timbang', color: 'gray' },
        { value: 'menunggu_konfirmasi_berat', label: 'Menunggu Konfirmasi User', color: 'orange' },
        { value: 'kurir_menuju_lokasi', label: 'Kurir Menuju Lokasi', color: 'sky' },
        { value: 'barang_diterima', label: 'Barang Diterima', color: 'emerald' },
        { value: 'pending', label: 'Menunggu', color: 'yellow' },
        { value: 'picked_up', label: 'Dijemput / Menunggu Cuci', color: 'blue' },
        { value: 'washing', label: 'Dicuci', color: 'cyan' },
        { value: 'ironing', label: 'Disetrika', color: 'purple' },
        { value: 'ready', label: 'Siap', color: 'indigo' },
        { value: 'delivering', label: 'Diantar', color: 'teal' },
        { value: 'completed', label: 'Selesai', color: 'green' },
        { value: 'cancelled', label: 'Dibatalkan', color: 'red' },
    ];

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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            fetchOrders(pagination.page);
            if (selectedOrder) {
                const updated = await ordersAPI.getById(orderId);
                setSelectedOrder(updated.data.order);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal update status');
        }
    };

    const handleUpdatePayment = async (orderId, newPaymentStatus) => {
        try {
            await ordersAPI.updatePayment(orderId, newPaymentStatus);
            fetchOrders(pagination.page);
            if (selectedOrder) {
                const updated = await ordersAPI.getById(orderId);
                setSelectedOrder(updated.data.order);
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Gagal update pembayaran');
        }
    };

    const handleUpdateWeight = async (e) => {
        e.preventDefault();
        try {
            const itemsPayload = selectedOrder.items.map(item => ({
                order_item_id: item.id, // the API returns "id" as the order_item primary key
                actual_quantity: parseFloat(item.actual_quantity || item.quantity)
            }));
            await ordersAPI.updateActualWeight(selectedOrder.id, itemsPayload);
            fetchOrders(pagination.page);
            const updated = await ordersAPI.getById(selectedOrder.id);
            setSelectedOrder(updated.data.order);
            alert('Berat berhasil diupdate! Order menunggu konfirmasi user.');
        } catch (error) {
            console.error('Error updating weight:', error);
            alert('Gagal update berat');
        }
    };

    const openModal = async (order) => {
        setIsModalOpen(true);
        setSelectedOrder(order); // Initial shallow data
        try {
            const res = await ordersAPI.getById(order.id);
            // set actual_quantity default for forms
            const fullOrder = res.data.order;
            if (fullOrder.items) {
                fullOrder.items = fullOrder.items.map(i => ({ ...i, actual_quantity: i.quantity }));
            }
            setSelectedOrder(fullOrder);
        } catch (error) {
            console.error('Error fetching full order details', error);
        }
    };

    const getStatusBadge = (status) => {
        const option = statusOptions.find(s => s.value === status);
        return option ? `bg-${option.color}-100 text-${option.color}-800` : 'bg-gray-100 text-gray-800';
    };

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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
                        <p className="text-gray-600">Lihat dan update status pesanan</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStatusFilter('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === ''
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Semua
                        </button>
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setStatusFilter(status.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status.value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-medium block">#{order.id.toString().padStart(4, '0')}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5 mt-1 inline-block ${order.delivery_type === 'pickup_delivery' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {order.delivery_type === 'pickup_delivery' ? '🚗 Kurir' : '🚶 Ambil Sendiri'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                <div className="text-sm text-gray-500">{order.customer_phone || order.customer_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {statusOptions.find(s => s.value === order.status)?.label || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${order.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openModal(order)}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Details / Update
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
                                Halaman {pagination.page} dari {pagination.totalPages}
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => fetchOrders(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => fetchOrders(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details & Status Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full mx-auto shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Kelola Pesanan #{selectedOrder.id.toString().padStart(4, '0')}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Customer & Payment Info */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Informasi Customer</h4>
                                    <p className="text-sm font-medium text-gray-900">{selectedOrder.customer_name}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customer_phone || selectedOrder.customer_email}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-semibold text-gray-700 mb-3">Status Pembayaran</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.id, 'unpaid')}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedOrder.payment_status === 'unpaid' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            Belum Bayar
                                        </button>
                                        <button
                                            onClick={() => handleUpdatePayment(selectedOrder.id, 'paid')}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800 border-2 border-green-200' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            Lunas
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Update Tracking Status */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Update Status Order</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status.value)}
                                            className={`w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center justify-between text-sm ${selectedOrder.status === status.value
                                                ? 'bg-primary-50 border-2 border-primary-500'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                                                }`}
                                        >
                                            <span className="font-medium">{status.label}</span>
                                            {selectedOrder.status === status.value && (
                                                <span className="text-primary-600 font-bold">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Input Actual Weight Section */}
                        {selectedOrder.status === 'menunggu_penimbangan' && selectedOrder.items && (
                            <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-xl">
                                <h4 className="font-bold text-orange-800 mb-4">Input Berat / Kuantitas Aktual</h4>
                                <form onSubmit={handleUpdateWeight}>
                                    <div className="space-y-3 mb-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                                <div>
                                                    <p className="font-medium text-sm">{item.service_name}</p>
                                                    <p className="text-xs text-gray-500">Estimasi awal: {item.quantity} {item.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0.1"
                                                        required
                                                        className="w-20 px-2 py-1 text-right text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                        value={item.actual_quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...selectedOrder.items];
                                                            newItems[idx].actual_quantity = parseFloat(e.target.value) || '';
                                                            setSelectedOrder({ ...selectedOrder, items: newItems });
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-gray-600">{item.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full btn-primary bg-orange-600 hover:bg-orange-700 border-none">
                                        Update Berat & Minta Konfirmasi User
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
