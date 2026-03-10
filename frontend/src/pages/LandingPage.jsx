import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { servicesAPI } from '../services/api';

export default function LandingPage() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await servicesAPI.getAll();
                setServices(response.data.services.slice(0, 6));
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    const features = [
        { icon: '🚚', title: 'Jemput & Antar', desc: 'Gratis jemput dan antar ke lokasi Anda' },
        { icon: '⚡', title: 'Express 6 Jam', desc: 'Layanan kilat untuk kebutuhan mendesak' },
        { icon: '🧴', title: 'Deterjen Premium', desc: 'Menggunakan deterjen berkualitas tinggi' },
        { icon: '👕', title: 'Cucian Rapih', desc: 'Setrika dan lipat dengan rapi' },
        { icon: '📱', title: 'Tracking Real-time', desc: 'Pantau status cucian via aplikasi' },
        { icon: '💯', title: 'Garansi Kepuasan', desc: 'Cuci ulang gratis jika tidak puas' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-40 animate-float" />
                <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent-200 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-gray-600">Buka Setiap Hari 07.00 - 21.00</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                                Cucian Bersih,
                                <span className="text-gradient"> Hidup Lebih Mudah</span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-lg">
                                Layanan laundry profesional dengan jemput-antar gratis. Fokus pada aktivitas Anda, biar kami yang urus cucian!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/order" className="btn-primary text-center">
                                    Pesan Sekarang
                                </Link>
                                <Link to="/services" className="btn-secondary text-center">
                                    Lihat Layanan
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex space-x-8 pt-8">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600">5000+</div>
                                    <div className="text-gray-500">Pelanggan Puas</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600">99%</div>
                                    <div className="text-gray-500">Tepat Waktu</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600">4.9⭐</div>
                                    <div className="text-gray-500">Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative hidden lg:block">
                            <div className="relative w-full h-[600px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-500 rounded-3xl transform rotate-3 opacity-20" />
                                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
                                        <span className="text-9xl">🧺</span>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <div className="absolute -left-8 top-20 bg-white rounded-xl shadow-lg p-4 animate-float">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600">✓</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold">Pesanan Selesai</div>
                                            <div className="text-sm text-gray-500">Order #1234</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -right-8 bottom-32 bg-white rounded-xl shadow-lg p-4 animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600">🚚</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold">Sedang Diantar</div>
                                            <div className="text-sm text-gray-500">ETA: 15 menit</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Mengapa Pilih <span className="text-gradient">LaundryKu</span>?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Kami berkomitmen memberikan layanan laundry terbaik dengan standar kualitas tinggi
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card p-6 hover:-translate-y-2">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Layanan <span className="text-gradient">Kami</span></h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Berbagai pilihan layanan untuk memenuhi kebutuhan laundry Anda
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service.id} className="card p-6 hover:-translate-y-2">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold">{service.name}</h3>
                                    <span className="badge bg-primary-100 text-primary-700">
                                        {service.unit === 'kg' ? '/kg' : '/pcs'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{service.description || 'Layanan cucian berkualitas tinggi'}</p>
                                <div className="text-2xl font-bold text-primary-600">
                                    Rp {parseInt(service.price).toLocaleString('id-ID')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/services" className="btn-secondary">
                            Lihat Semua Layanan →
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Cara <span className="text-gradient">Pemesanan</span></h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Proses mudah dalam 4 langkah sederhana
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '01', icon: '📝', title: 'Pesan Online', desc: 'Pilih layanan dan jadwal pickup' },
                            { step: '02', icon: '🚚', title: 'Kami Jemput', desc: 'Kurir datang ke lokasi Anda' },
                            { step: '03', icon: '👔', title: 'Proses Cuci', desc: 'Cuci, setrika, dan lipat rapi' },
                            { step: '04', icon: '📦', title: 'Kami Antar', desc: 'Cucian bersih tiba di rumah' },
                        ].map((item, index) => (
                            <div key={index} className="text-center relative">
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-primary-400" />
                                )}
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg shadow-primary-500/25">
                                        {item.icon}
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary-600 to-accent-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl" />
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-2xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Siap Untuk Hidup Lebih Praktis?
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Daftar sekarang dan dapatkan diskon 20% untuk pesanan pertama Anda!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                            Daftar Gratis
                        </Link>
                        <a href="https://wa.me/6281234567890" className="btn border-2 border-white text-white hover:bg-white/10">
                            Hubungi via WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
