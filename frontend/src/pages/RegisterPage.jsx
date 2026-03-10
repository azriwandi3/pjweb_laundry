import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
    });
    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        clearError();
        setValidationError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Password tidak sama');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setValidationError('Password minimal 6 karakter');
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-accent-50">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-2xl">🧺</span>
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">Buat Akun Baru</h2>
                    <p className="mt-2 text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {(error || validationError) && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error || validationError}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input"
                                placeholder="nama@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                No. Telepon
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="input"
                                placeholder="0812-xxxx-xxxx"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat Lengkap
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows="2"
                                className="input resize-none"
                                placeholder="Jl. Contoh No. 123, Jakarta"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                Saya setuju dengan{' '}
                                <a href="#" className="text-primary-600 hover:underline">Syarat & Ketentuan</a>
                                {' '}dan{' '}
                                <a href="#" className="text-primary-600 hover:underline">Kebijakan Privasi</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
