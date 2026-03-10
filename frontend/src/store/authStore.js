import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login action
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.login({ email, password });
                    const { user, token } = response.data;

                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.error || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Register action
            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.register(data);
                    const { user, token } = response.data;

                    localStorage.setItem('token', token);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.error || 'Registration failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Logout action
            logout: () => {
                localStorage.removeItem('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Check if user is admin
            isAdmin: () => get().user?.role === 'admin',
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
