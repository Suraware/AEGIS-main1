import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface WatchlistItem {
    id: string;
    countryCode: string;
    countryName: string;
}

interface UserPreferences {
    defaultLayers: string[];
    theme: string;
}

interface UserState {
    watchlist: WatchlistItem[];
    preferences: UserPreferences | null;
    isLoading: boolean;
    fetchUserData: (userId: string) => Promise<void>;
    toggleWatchlist: (userId: string, countryCode: string, countryName: string) => Promise<void>;
    updatePreferences: (userId: string, layers: string[], theme: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            watchlist: [],
            preferences: null,
            isLoading: false,

            fetchUserData: async (userId) => {
                set({ isLoading: true });
                try {
                    const [watchlistRes, prefsRes] = await Promise.all([
                        axios.get(`http://localhost:8085/api/user/${userId}/watchlist`),
                        axios.get(`http://localhost:8085/api/user/${userId}/preferences`)
                    ]);
                    set({ watchlist: watchlistRes.data, preferences: prefsRes.data, isLoading: false });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    set({ isLoading: false });
                }
            },

            toggleWatchlist: async (userId, countryCode, countryName) => {
                const { watchlist } = get();
                const exists = watchlist.find(item => item.countryCode === countryCode);

                try {
                    if (exists) {
                        await axios.delete(`http://localhost:8085/api/user/${userId}/watchlist/${countryCode}`);
                        set({ watchlist: watchlist.filter(item => item.countryCode !== countryCode) });
                    } else {
                        const res = await axios.post(`http://localhost:8085/api/user/${userId}/watchlist`, { countryCode, countryName });
                        set({ watchlist: [...watchlist, res.data] });
                    }
                } catch (error) {
                    console.error('Error toggling watchlist:', error);
                }
            },

            updatePreferences: async (userId, layers, theme) => {
                try {
                    const res = await axios.put(`http://localhost:8085/api/user/${userId}/preferences`, { defaultLayers: layers, theme });
                    set({ preferences: res.data });
                } catch (error) {
                    console.error('Error updating preferences:', error);
                }
            }
        }),
        { name: 'aegis-user-storage' }
    )
);
