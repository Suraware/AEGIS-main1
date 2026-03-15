import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
});


api.interceptors.request.use(
    (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const { setAuth, logout } = useAuthStore.getState();

            try {
                
                const refreshRes = await axios.post(
                    `${BASE_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const { id, email: userEmail, displayName, accessToken: newToken } = refreshRes.data;
                const user = { id: String(id ?? userEmail), email: userEmail, displayName: displayName ?? '' };
                setAuth(user, newToken, null);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
