import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Protected Route for authenticated users
export function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Admin-only route
export function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Redirect if already authenticated
export function GuestRoute({ children }) {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to={isAdmin() ? '/admin' : '/dashboard'} replace />;
    }

    return children;
}
