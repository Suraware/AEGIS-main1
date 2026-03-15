import { create } from 'zustand';

export type NotificationType = 'alert' | 'success' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  country?: string;
  countryCode?: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  dndMode: boolean;
  toggleDnd: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  dndMode: false,
  toggleDnd: () => set(state => ({ dndMode: !state.dndMode })),

  addNotification: (n) => {
    const state = get();
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const isDuplicate = state.notifications.some(existing =>
      existing.title === n.title &&
      existing.timestamp > tenSecondsAgo
    );
    if (isDuplicate) return;

    const notification: Notification = {
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: state.notifications.find(n => n.id === id && !n.read)
      ? Math.max(0, state.unreadCount - 1)
      : state.unreadCount,
  })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
