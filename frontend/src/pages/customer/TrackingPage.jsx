import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

export default function TrackingPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getStatusSteps = () => {
        let steps = [
            { key: 'pending', label: 'Pesanan Dibuat', icon: '📝', desc: 'Menunggu konfirmasi admin' }
        ];

        if (order?.delivery_type === 'pickup_delivery') {
            steps.push({ key: 'kurir_menuju_lokasi', label: 'Kurir OTW', icon: '🛵', desc: 'Kurir menuju lokasi Anda' });
            steps.push({ key: 'picked_up', label: 'Selesai Dijemput', icon: '🚚', desc: 'Barang sedang dibawa kurir' });
        }

        steps.push({ key: 'barang_diterima', label: 'Barang Diterima', icon: '📦', desc: 'Cucian telah berada di Laundry' });
        steps.push({ key: 'menunggu_penimbangan', label: 'Menunggu Timbang', icon: '⚖️', desc: 'Kasir menimbang cucian' });
        steps.push({ key: 'menunggu_konfirmasi_berat', label: 'Konfirmasi Berat', icon: '⚠️', desc: 'Perlu persetujuan Anda' });
        steps.push({ key: 'washing', label: 'Dicuci', icon: '🧺', desc: 'Proses pencucian' });
        steps.push({ key: 'ironing', label: 'Disetrika', icon: '👔', desc: 'Proses setrika' });
        steps.push({ key: 'ready', label: 'Siap', icon: '✅', desc: 'Cucian siap' });

        if (order?.delivery_type === 'pickup_delivery') {
            steps.push({ key: 'delivering', label: 'Diantar', icon: '🛵', desc: 'Dalam perjalanan ke lokasi Anda' });
        }

        steps.push({ key: 'completed', label: 'Selesai', icon: '🎉', desc: 'Terima kasih!' });

        return steps;
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersAPI.getById(id);
                setOrder(response.data.order);
                // Mark as read in the background if there's an unread update
                if (response.data.order && response.data.order.has_unread_update === 1) {
                    ordersAPI.markAsRead(id).catch(console.error);
                }
            } catch (err) {
                setError('Pesanan tidak ditemukan');
                console.error('Error fetching order:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handleConfirmWeight = async () => {
        setIsLoading(true);
        try {
            await ordersAPI.confirmWeight(id);
            // Refresh order
            const response = await ordersAPI.getById(id);
            setOrder(response.data.order);
        } catch (err) {
            alert('Gagal mengkonfirmasi persetujuan harga final');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentStepIndex = () => {
        if (!order) return -1;
        if (order.status === 'cancelled') return -1;
        return getStatusSteps().findIndex(s => s.key === order.status);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">😕</span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Pesanan tidak ditemukan'}</h2>
                    <Link to="/dashboard" className="btn-primary inline-block mt-4">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
                        ← Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Tracking Pesanan #{order.id.toString().padStart(4, '0')}
                    </h1>
                    <p className="text-gray-600">
                        Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>

                {/* Cancelled Status */}
                {order.status === 'cancelled' && (
                    <div className="card p-6 mb-6 bg-red-50 border-red-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-4xl">❌</span>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Pesanan Dibatalkan</h3>
                                <p className="text-red-600">Pesanan ini telah dibatalkan</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Weight Status */}
                {order.status === 'menunggu_konfirmasi_berat' && (
                    <div className="card p-6 mb-6 bg-yellow-50 border-yellow-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                                <span className="text-4xl">⚖️</span>
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-800">Menunggu Konfirmasi Harga Final</h3>
                                    <p className="text-yellow-700">Laundry Anda telah ditimbang. Periksa kembali total harga baru sebelum kami memproses cucian Anda.</p>
                                    <p className="text-sm font-semibold text-red-600 mt-1">Batas waktu: 1x24 Jam dari sekarang</p>
                                </div>
                            </div>
                            <button
                                onClick={handleConfirmWeight}
                                className="btn-primary whitespace-nowrap"
                            >
                                Setujui & Lanjutkan
                            </button>
                        </div>
                    </div>
                )}

                {/* Timeline */}
                {order.status !== 'cancelled' && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-xl font-bold mb-6">Status Pesanan</h2>

                        <div className="relative">
                            {getStatusSteps().map((step, index) => {
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={step.key} className="flex items-start mb-8 last:mb-0">
                                        {/* Line */}
                                        {index < getStatusSteps().length - 1 && (
                                            <div
                                                className={`absolute left-6 w-0.5 h-16 mt-12 -ml-px ${index < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                                                    }`}
                                                style={{ top: `${index * 96}px` }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isCurrent
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50 scale-110'
                                            : isCompleted
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {step.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="ml-4 flex-grow">
                                            <div className={`font-semibold ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                                {isCurrent && (
                                                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full animate-pulse">
                                                        Saat ini
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* Check mark */}
                                        {isCompleted && !isCurrent && (
                                            <div className="flex-shrink-0 text-green-500">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div className="card p-6">
                        <h3 className="font-bold mb-4">Detail Layanan</h3>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium">{item.service_name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                                    </div>
                                    <p className="font-medium">
                                        Rp {parseInt(item.subtotal).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {order.delivery_type === 'pickup_delivery' && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-gray-700">
                                <span className="font-semibold">Ongkos Antar-Jemput</span>
                                <span className="font-medium">
                                    Rp {parseInt(order.delivery_fee || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                            <span className="font-bold">Total Akhir</span>
                            <span className="font-bold text-primary-600 text-lg">
                                Rp {parseInt(order.total_price).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="card p-6">
                        <h3 className="font-bold mb-4">Informasi Pesanan</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status Pembayaran</span>
                                <span className={`badge ${order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                </span>
                            </div>
                            {order.pickup_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal Pickup</span>
                                    <span>{new Date(order.pickup_date).toLocaleDateString('id-ID')}</span>
                                </div>
                            )}
                            {order.pickup_address && (
                                <div>
                                    <span className="text-gray-500 block mb-1">Alamat Pickup</span>
                                    <span className="text-gray-900">{order.pickup_address}</span>
                                </div>
                            )}
                            {order.notes && (
                                <div>
                                    <span className="text-gray-500 block mb-1">Catatan</span>
                                    <span className="text-gray-900">{order.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Help CTA */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 mb-2">Ada pertanyaan tentang pesanan?</p>
                    <a
                        href={`https://wa.me/6281234567890?text=Halo%20Admin%20Laundry,%20saya%20ingin%20bertanya%20terkait%20pesanan%20saya%20dengan%20ID%20%23${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200"
                    >
                        <span className="text-xl">💬</span>
                        <span>Hubungi CS via WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
