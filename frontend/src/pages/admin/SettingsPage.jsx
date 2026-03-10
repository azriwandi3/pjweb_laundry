import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState({ delivery_fee: 15000 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsAPI.getAll();
                if (res.data.settings) {
                    setSettings({
                        ...settings,
                        ...res.data.settings
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await settingsAPI.update(settings);
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
                    <p className="text-gray-600">Atur konfigurasi aplikasi LaundryKu</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Delivery Settings */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Pengaturan Layanan</h2>
                            <div className="space-y-4">
                                <div className="max-w-md">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tarif Antar-Jemput (Rp)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-medium">Rp</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="delivery_fee"
                                            min="0"
                                            required
                                            value={settings.delivery_fee}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            placeholder="15000"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tarif flat yang dikenakan ke pelanggan jika memilih opsi "Kurir Laundry".
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-primary w-full sm:w-auto"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
