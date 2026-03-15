import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    displayName: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, _refreshToken: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true }),
            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
        }),
        {
            name: 'aegis-auth-storage',
            
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
