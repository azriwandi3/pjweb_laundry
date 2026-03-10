import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Route Guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';

// Customer Pages
import DashboardPage from './pages/customer/DashboardPage';
import OrderPage from './pages/customer/OrderPage';
import OrdersPage from './pages/customer/OrdersPage';
import TrackingPage from './pages/customer/TrackingPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderManagement from './pages/admin/OrderManagement';
import FinanceReport from './pages/admin/FinanceReport';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes with Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/services" element={<ServicesPage />} />

                    {/* Customer Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/order"
                        element={
                            <ProtectedRoute>
                                <OrderPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrdersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute>
                                <TrackingPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <AdminRoute>
                                <OrderManagement />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/reports"
                        element={
                            <AdminRoute>
                                <FinanceReport />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/settings"
                        element={
                            <AdminRoute>
                                <SettingsPage />
                            </AdminRoute>
                        }
                    />
                </Route>

                {/* Auth Routes (no layout) */}
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <LoginPage />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <RegisterPage />
                        </GuestRoute>
                    }
                />

                {/* 404 Fallback */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-4">Halaman tidak ditemukan</p>
                            <a href="/" className="btn-primary inline-block">Kembali ke Home</a>
                        </div>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;
