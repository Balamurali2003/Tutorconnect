import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, NotificationItem } from '../types';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  handleMarkRead: (id: string) => Promise<void>;
  handleMarkAllRead: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedTutorId: string | null;
  setSelectedTutorId: (id: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const tabToRoute: Record<string, string> = {
  'dashboard': '/',
  'all-tutors': '/tutors',
  'high-priority': '/tutors/high-priority',
  'low-priority': '/tutors/low-priority',
  'not-assigned': '/tutors/not-assigned',
  'new-applications': '/tutors/new-applications',
  'validated-tutors': '/tutors/validated',
  'appointed-tutors': '/tutors/appointed',
  'recruitment-doc-verification': '/recruitment/documents',
  'recruitment-interview': '/recruitment/interviews',
  'recruitment-demo': '/recruitment/demos',
  'recruitment-parent-approval': '/recruitment/parent-approval',
  'students-all': '/students',
  'student-requirements': '/students/requirements',
  'parents-all': '/parents',
  'import-tutors': '/import/teachers',
  'import-students': '/import/students',
  'import-parents': '/import/parents',
  'tutor-matching': '/matching',
  'reports': '/reports',
  'settings': '/settings',
  'whatsapp': '/whatsapp',
  'whatsapp-inbox': '/whatsapp/inbox',
  'whatsapp-messaging': '/whatsapp/messages',
  'whatsapp-templates': '/whatsapp/templates',
  'whatsapp-contacts': '/whatsapp/contacts',
  'whatsapp-settings': '/whatsapp/settings',
  'whatsapp-webhook-logs': '/whatsapp/webhook-logs',
  'whatsapp-api-logs': '/whatsapp/api-logs',
  'whatsapp-test': '/whatsapp/test'
};

const routeToTab: Record<string, string> = {
  '/': 'dashboard',
  '/tutors': 'all-tutors',
  '/tutors/high-priority': 'high-priority',
  '/tutors/low-priority': 'low-priority',
  '/tutors/not-assigned': 'not-assigned',
  '/tutors/new-applications': 'new-applications',
  '/tutors/validated': 'validated-tutors',
  '/tutors/appointed': 'appointed-tutors',
  '/recruitment/documents': 'recruitment-doc-verification',
  '/recruitment/interviews': 'recruitment-interview',
  '/recruitment/demos': 'recruitment-demo',
  '/recruitment/parent-approval': 'recruitment-parent-approval',
  '/students': 'students-all',
  '/students/requirements': 'student-requirements',
  '/parents': 'parents-all',
  '/import/teachers': 'import-tutors',
  '/import/students': 'import-students',
  '/import/parents': 'import-parents',
  '/matching': 'tutor-matching',
  '/reports': 'reports',
  '/settings': 'settings',
  '/whatsapp': 'whatsapp',
  '/whatsapp/inbox': 'whatsapp-inbox',
  '/whatsapp/messages': 'whatsapp-messaging',
  '/whatsapp/templates': 'whatsapp-templates',
  '/whatsapp/contacts': 'whatsapp-contacts',
  '/whatsapp/settings': 'whatsapp-settings',
  '/whatsapp/webhook-logs': 'whatsapp-webhook-logs',
  '/whatsapp/api-logs': 'whatsapp-api-logs',
  '/whatsapp/test': 'whatsapp-test'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const initialTab = routeToTab[initialPath] || 'dashboard';

  const [activeTab, setActiveTabState] = useState<string>(initialTab);
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const setActiveTab = (tab: string) => {
    const targetTab = routeToTab[tab] || tab;
    setActiveTabState(targetTab);
    const targetRoute = tabToRoute[targetTab] || tabToRoute[tab];
    if (targetRoute && typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = routeToTab[window.location.pathname] || 'dashboard';
      setActiveTabState(currentTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [refreshTrigger]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        notifications,
        unreadNotificationCount,
        handleMarkRead,
        handleMarkAllRead,
        toasts,
        addToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        selectedTutorId,
        setSelectedTutorId,
        refreshTrigger,
        triggerRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
