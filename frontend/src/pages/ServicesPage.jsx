import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addItem, items } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await servicesAPI.getAll();
                setServices(response.data.services);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const isInCart = (serviceId) => items.some(i => i.service_id === serviceId);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Daftar <span className="text-gradient">Layanan</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Pilih layanan yang sesuai dengan kebutuhan Anda. Semua layanan sudah termasuk antar-jemput gratis!
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="card p-6 flex flex-col hover:-translate-y-2">
                            {/* Service Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-3xl">
                                    {service.name.includes('Cuci') ? '🧺' :
                                        service.name.includes('Setrika') ? '👔' :
                                            service.name.includes('Sepatu') ? '👟' :
                                                service.name.includes('Bedcover') ? '🛏️' :
                                                    service.name.includes('Express') ? '⚡' :
                                                        service.name.includes('Dry') ? '✨' : '👕'}
                                </span>
                            </div>

                            {/* Service Info */}
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                                    <span className="badge bg-primary-100 text-primary-700">
                                        /{service.unit}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {service.description || 'Layanan cucian berkualitas tinggi dengan hasil maksimal.'}
                                </p>
                            </div>

                            {/* Price & Action */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-gray-500">Mulai dari</span>
                                        <div className="text-2xl font-bold text-primary-600">
                                            Rp {parseInt(service.price).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    {isAuthenticated ? (
                                        isInCart(service.id) ? (
                                            <Link to="/order" className="btn-secondary text-sm py-2 px-4">
                                                Lihat Keranjang
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => addItem(service)}
                                                className="btn-primary text-sm py-2 px-4"
                                            >
                                                + Tambah
                                            </button>
                                        )
                                    ) : (
                                        <Link to="/login" className="btn-primary text-sm py-2 px-4">
                                            Login untuk Pesan
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <div className="card p-8 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                        <h2 className="text-2xl font-bold mb-4">Butuh Layanan Khusus?</h2>
                        <p className="mb-6 text-white/80">
                            Hubungi kami untuk kebutuhan laundry korporat, hotel, atau layanan custom lainnya.
                        </p>
                        <a href="https://wa.me/6281234567890" className="btn bg-white text-primary-600 hover:bg-gray-100">
                            Hubungi via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
