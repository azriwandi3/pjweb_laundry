import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { servicesAPI, ordersAPI, settingsAPI } from '../../services/api';

export default function OrderPage() {
    const navigate = useNavigate();
    const { items, addItem, updateQuantity, removeItem, clearCart, getTotal, setPickupDetails, getOrderData } = useCartStore();

    const [services, setServices] = useState([]);
    const [deliveryFee, setDeliveryFee] = useState(15000);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState('self_service');
    const [pickupForm, setPickupForm] = useState({
        pickupDate: '',
        pickupAddress: '',
        notes: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, settingsRes] = await Promise.all([
                    servicesAPI.getAll(),
                    settingsAPI.getAll()
                ]);
                setServices(servicesRes.data.services);
                if (settingsRes.data.settings?.delivery_fee) {
                    setDeliveryFee(parseFloat(settingsRes.data.settings.delivery_fee));
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmitOrder = async () => {
        setIsSubmitting(true);
        try {
            setPickupDetails(pickupForm);
            const orderData = {
                ...getOrderData(),
                pickup_date: deliveryType === 'pickup_delivery' ? pickupForm.pickupDate : null,
                pickup_address: deliveryType === 'pickup_delivery' ? pickupForm.pickupAddress : null,
                notes: pickupForm.notes,
                delivery_type: deliveryType
            };

            await ordersAPI.create(orderData);
            clearCart();
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Gagal membuat pesanan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-2">
                        <span className="text-sm text-gray-600">
                            {step === 1 && 'Pilih Layanan'}
                            {step === 2 && 'Detail Pickup'}
                            {step === 3 && 'Konfirmasi'}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Select Services */}
                        {step === 1 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-6">Pilih Layanan</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {services.map((service) => {
                                        const cartItem = items.find(i => i.service_id === service.id);
                                        return (
                                            <div
                                                key={service.id}
                                                className={`border-2 rounded-xl p-4 transition-colors cursor-pointer ${cartItem
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-primary-300'
                                                    }`}
                                                onClick={() => !cartItem && addItem(service)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold">{service.name}</h3>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        /{service.unit}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {service.description || 'Layanan cucian berkualitas'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-primary-600">
                                                        Rp {parseInt(service.price).toLocaleString('id-ID')}
                                                    </span>
                                                    {cartItem ? (
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateQuantity(service.id, cartItem.quantity - 0.5);
                                                                }}
                                                                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-12 text-center font-medium">
                                                                {cartItem.quantity}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateQuantity(service.id, cartItem.quantity + 0.5);
                                                                }}
                                                                className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button className="btn-primary text-sm py-2 px-4">
                                                            Tambah
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pickup Details */}
                        {step === 2 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-6">Detail Pengiriman</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipe Pengantaran
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                className={`p-4 rounded-xl border-2 text-left transition-colors ${deliveryType === 'self_service'
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-primary-200'
                                                    }`}
                                                onClick={() => setDeliveryType('self_service')}
                                            >
                                                <div className="font-semibold text-gray-900">Antar/Ambil Sendiri</div>
                                                <div className="text-sm text-gray-500 mt-1">Gratis</div>
                                            </button>
                                            <button
                                                className={`p-4 rounded-xl border-2 text-left transition-colors ${deliveryType === 'pickup_delivery'
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-primary-200'
                                                    }`}
                                                onClick={() => setDeliveryType('pickup_delivery')}
                                            >
                                                <div className="font-semibold text-gray-900">Kurir Laundry</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    + Rp {deliveryFee.toLocaleString('id-ID')}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {deliveryType === 'pickup_delivery' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tanggal Penjemputan
                                                </label>
                                                <input
                                                    type="date"
                                                    className="input"
                                                    value={pickupForm.pickupDate}
                                                    onChange={(e) => setPickupForm({ ...pickupForm, pickupDate: e.target.value })}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Alamat Penjemputan
                                                </label>
                                                <textarea
                                                    className="input resize-none"
                                                    rows="3"
                                                    placeholder="Masukkan alamat lengkap..."
                                                    value={pickupForm.pickupAddress}
                                                    onChange={(e) => setPickupForm({ ...pickupForm, pickupAddress: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            className="input resize-none"
                                            rows="2"
                                            placeholder="Catatan khusus untuk kurir atau cucian..."
                                            value={pickupForm.notes}
                                            onChange={(e) => setPickupForm({ ...pickupForm, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-6">Konfirmasi Pesanan</h2>

                                <div className="space-y-4">
                                    <div className="border-b pb-4">
                                        <h3 className="font-semibold mb-2">Detail Layanan</h3>
                                        {items.map((item) => (
                                            <div key={item.service_id} className="flex justify-between text-sm py-1">
                                                <span>{item.name} x {item.quantity} {item.unit}</span>
                                                <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-b pb-4">
                                        <h3 className="font-semibold mb-2">Detail Pengiriman</h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Tipe:</span> {deliveryType === 'pickup_delivery' ? 'Antar-Jemput Kurir' : 'Ambil Sendiri'}</p>
                                            <p><span className="font-medium">Tanggal:</span> {deliveryType === 'pickup_delivery' ? (pickupForm.pickupDate || '-') : 'T/A'}</p>
                                            <p><span className="font-medium">Alamat:</span> {deliveryType === 'pickup_delivery' ? (pickupForm.pickupAddress || '-') : 'T/A'}</p>
                                            {pickupForm.notes && (
                                                <p><span className="font-medium">Catatan:</span> {pickupForm.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-primary-50 p-4 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">Estimasi Biaya Cuci</span>
                                            <span className="font-semibold">
                                                Rp {getTotal().toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {deliveryType === 'pickup_delivery' && (
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-semibold text-gray-700">Biaya Antar-Jemput</span>
                                                <span className="font-semibold">
                                                    Rp {deliveryFee.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="border-t border-primary-200 my-2 pt-2 flex justify-between items-center">
                                            <span className="font-bold text-lg">Total Estimasi</span>
                                            <span className="text-2xl font-bold text-primary-600">
                                                Rp {(getTotal() + (deliveryType === 'pickup_delivery' ? deliveryFee : 0)).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            *Harga final ditentukan setelah penimbangan oleh kasir/admin
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Ringkasan Pesanan</h3>

                            {items.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Belum ada layanan dipilih
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4">
                                        {items.map((item) => (
                                            <div key={item.service_id} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-gray-500">{item.quantity} {item.unit}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                                    <button
                                                        onClick={() => removeItem(item.service_id)}
                                                        className="text-red-500 text-xs hover:underline"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4 mb-4">
                                        <div className="flex justify-between font-bold text-lg mb-1">
                                            <span>Subtotal</span>
                                            <span className="text-gray-700">
                                                Rp {getTotal().toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {deliveryType === 'pickup_delivery' && (
                                            <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
                                                <span>Antar-Jemput</span>
                                                <span>+ Rp {deliveryFee.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-xl pt-2 border-t">
                                            <span>Estimasi Total</span>
                                            <span className="text-primary-600">
                                                Rp {(getTotal() + (deliveryType === 'pickup_delivery' ? deliveryFee : 0)).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="space-y-3">
                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        disabled={items.length === 0}
                                        className="w-full btn-primary disabled:opacity-50"
                                    >
                                        Lanjutkan
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isSubmitting}
                                        className="w-full btn-primary disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
                                    </button>
                                )}

                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="w-full btn-secondary"
                                    >
                                        Kembali
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
