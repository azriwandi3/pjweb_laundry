import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { ordersAPI } from '../services/api';

export default function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const cartCount = useCartStore((state) => state.getCount());
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isAdmin()) {
            // Check for any unread updates in latest orders
            ordersAPI.getAll({ limit: 10 })
                .then(res => {
                    const unread = res.data.orders.some(o => o.has_unread_update === 1);
                    setHasUnread(unread);
                })
                .catch(console.error);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">🧺</span>
                        </div>
                        <span className="text-xl font-bold text-gradient">LaundryKu</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/services" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                            Layanan
                        </Link>
                        <Link to="/about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                            Tentang Kami
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Cart Button */}
                                {!isAdmin() && (
                                    <Link to="/order" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* User Menu */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {hasUnread && (
                                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                            </span>
                                        )}
                                        <span className="hidden sm:block text-sm font-medium text-gray-700">
                                            {user?.name}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                                        <div className="py-2">
                                            <Link to={isAdmin() ? '/admin' : '/dashboard'} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                Dashboard
                                            </Link>
                                            {isAdmin() && (
                                                <>
                                                    <Link to="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        📋 Kelola Pesanan
                                                    </Link>
                                                    <Link to="/admin/services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        🧺 Kelola Layanan
                                                    </Link>
                                                    <Link to="/admin/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        💰 Laporan Keuangan
                                                    </Link>
                                                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        ⚙️ Pengaturan
                                                    </Link>
                                                </>
                                            )}
                                            {!isAdmin() && (
                                                <>
                                                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                                        <span>Riwayat Pesanan</span>
                                                        {hasUnread && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                                    </Link>
                                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        👤 Profil Saya
                                                    </Link>
                                                </>
                                            )}
                                            <hr className="my-2 border-gray-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-secondary text-sm py-2">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2">
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
