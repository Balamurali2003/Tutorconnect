import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, NotificationItem, AuthUser, LoginPayload } from '../types';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, loginUser, logoutUser } from '../services/api';

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
  currentUser: AuthUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
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
  // Auth
  'login': '/login',

  // Admin
  'dashboard': '/admin/dashboard',
  'all-tutors': '/admin/tutors',
  'high-priority': '/admin/tutors/high-priority',
  'low-priority': '/admin/tutors/low-priority',
  'not-assigned': '/admin/tutors/not-assigned',
  'new-applications': '/admin/tutors/new-applications',
  'validated-tutors': '/admin/tutors/validated',
  'appointed-tutors': '/admin/tutors/appointed',
  'admin-tutor-updates': '/admin/tutor-updates',
  'recruitment-doc-verification': '/admin/recruitment/documents',
  'recruitment-interview': '/admin/recruitment/interviews',
  'recruitment-demo': '/admin/recruitment/demos',
  'recruitment-parent-approval': '/admin/recruitment/parent-approval',
  'students-all': '/admin/students',
  'student-requirements': '/admin/students/requirements',
  'parents-all': '/admin/parents',
  'import-tutors': '/admin/import/teachers',
  'import-students': '/admin/import/students',
  'import-parents': '/admin/import/parents',
  'tutor-matching': '/admin/matching',
  'reports': '/admin/reports',
  'settings': '/admin/settings',
  'whatsapp': '/admin/whatsapp',
  'whatsapp-inbox': '/admin/whatsapp/inbox',
  'whatsapp-messaging': '/admin/whatsapp/messages',
  'whatsapp-templates': '/admin/whatsapp/templates',
  'whatsapp-contacts': '/admin/whatsapp/contacts',
  'whatsapp-settings': '/admin/whatsapp/settings',
  'whatsapp-webhook-logs': '/admin/whatsapp/webhook-logs',
  'whatsapp-api-logs': '/admin/whatsapp/api-logs',
  'whatsapp-test': '/admin/whatsapp/test',

  // Tutor
  'tutor-dashboard': '/tutor/dashboard',
  'tutor-students': '/tutor/students',
  'tutor-classes': '/tutor/classes',
  'tutor-history': '/tutor/history',
  'tutor-profile': '/tutor/profile',

  // Parent
  'parent-dashboard': '/parent/dashboard',
  'parent-student': '/parent/student',
  'parent-tutor-updates': '/parent/tutor-updates',
  'parent-classes': '/parent/classes'
};

const routeToTab: Record<string, string> = {
  '/login': 'login',
  '/': 'login',

  // Admin routes
  '/admin/dashboard': 'dashboard',
  '/admin/tutors': 'all-tutors',
  '/admin/tutors/high-priority': 'high-priority',
  '/admin/tutors/low-priority': 'low-priority',
  '/admin/tutors/not-assigned': 'not-assigned',
  '/admin/tutors/new-applications': 'new-applications',
  '/admin/tutors/validated': 'validated-tutors',
  '/admin/tutors/appointed': 'appointed-tutors',
  '/admin/tutor-updates': 'admin-tutor-updates',
  '/admin/recruitment/documents': 'recruitment-doc-verification',
  '/admin/recruitment/interviews': 'recruitment-interview',
  '/admin/recruitment/demos': 'recruitment-demo',
  '/admin/recruitment/parent-approval': 'recruitment-parent-approval',
  '/admin/students': 'students-all',
  '/admin/students/requirements': 'student-requirements',
  '/admin/parents': 'parents-all',
  '/admin/import/teachers': 'import-tutors',
  '/admin/import/students': 'import-students',
  '/admin/import/parents': 'import-parents',
  '/admin/matching': 'tutor-matching',
  '/admin/reports': 'reports',
  '/admin/settings': 'settings',
  '/admin/whatsapp': 'whatsapp',
  '/admin/whatsapp/inbox': 'whatsapp-inbox',
  '/admin/whatsapp/messages': 'whatsapp-messaging',
  '/admin/whatsapp/templates': 'whatsapp-templates',
  '/admin/whatsapp/contacts': 'whatsapp-contacts',
  '/admin/whatsapp/settings': 'whatsapp-settings',
  '/admin/whatsapp/webhook-logs': 'whatsapp-webhook-logs',
  '/admin/whatsapp/api-logs': 'whatsapp-api-logs',
  '/admin/whatsapp/test': 'whatsapp-test',

  // Backward-compatible older root-relative routes for admin
  '/tutors': 'all-tutors',
  '/tutors/validated': 'validated-tutors',
  '/tutors/appointed': 'appointed-tutors',

  // Tutor routes
  '/tutor/dashboard': 'tutor-dashboard',
  '/tutor/students': 'tutor-students',
  '/tutor/classes': 'tutor-classes',
  '/tutor/history': 'tutor-history',
  '/tutor/profile': 'tutor-profile',

  // Parent routes
  '/parent/dashboard': 'parent-dashboard',
  '/parent/student': 'parent-student',
  '/parent/tutor-updates': 'parent-tutor-updates',
  '/parent/classes': 'parent-classes'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read saved user and token from localStorage
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  });

  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  const isAuthenticated = Boolean(currentUser && authToken);

  // Determine initial role based on user
  const initialRole: UserRole =
    currentUser?.role === 'ADMIN'
      ? 'Admin'
      : currentUser?.role === 'TUTOR'
      ? 'Tutor'
      : currentUser?.role === 'PARENT'
      ? 'Parent'
      : 'Admin';

  const [userRole, setUserRole] = useState<UserRole>(initialRole);

  // Initial route determination
  const getInitialTab = (): string => {
    if (typeof window === 'undefined') return 'login';
    const path = window.location.pathname;

    // If NOT authenticated, force login regardless of path
    if (!currentUser || !authToken) {
      if (path !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      return 'login';
    }

    // If authenticated and on root / or /login, redirect to appropriate role dashboard
    if (path === '/' || path === '/login') {
      if (currentUser.role === 'ADMIN') {
        window.history.replaceState(null, '', '/admin/dashboard');
        return 'dashboard';
      }
      if (currentUser.role === 'TUTOR') {
        window.history.replaceState(null, '', '/tutor/dashboard');
        return 'tutor-dashboard';
      }
      if (currentUser.role === 'PARENT') {
        window.history.replaceState(null, '', '/parent/dashboard');
        return 'parent-dashboard';
      }
    }

    // Match path to tab, guarding role boundaries
    const mappedTab = routeToTab[path];
    if (mappedTab) {
      if (currentUser.role === 'TUTOR' && !mappedTab.startsWith('tutor-')) {
        window.history.replaceState(null, '', '/tutor/dashboard');
        return 'tutor-dashboard';
      }
      if (currentUser.role === 'PARENT' && !mappedTab.startsWith('parent-')) {
        window.history.replaceState(null, '', '/parent/dashboard');
        return 'parent-dashboard';
      }
      if (currentUser.role === 'ADMIN' && (mappedTab.startsWith('tutor-') || mappedTab.startsWith('parent-'))) {
        window.history.replaceState(null, '', '/admin/dashboard');
        return 'dashboard';
      }
      return mappedTab;
    }

    // Default fallback based on role
    if (currentUser.role === 'TUTOR') return 'tutor-dashboard';
    if (currentUser.role === 'PARENT') return 'parent-dashboard';
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Tab switcher with path sync & role protection
  const setActiveTab = (tab: string) => {
    // If not authenticated, force login
    if (!currentUser || !authToken) {
      setActiveTabState('login');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      return;
    }

    // Protect Tutor role from accessing admin or parent tabs
    if (currentUser.role === 'TUTOR' && !tab.startsWith('tutor-') && tab !== 'login') {
      tab = 'tutor-dashboard';
    }

    // Protect Parent role from accessing admin or tutor tabs
    if (currentUser.role === 'PARENT' && !tab.startsWith('parent-') && tab !== 'login') {
      tab = 'parent-dashboard';
    }

    setActiveTabState(tab);
    const targetRoute = tabToRoute[tab];
    if (targetRoute && typeof window !== 'undefined' && window.location.pathname !== targetRoute) {
      window.history.pushState(null, '', targetRoute);
    }
  };

  // Browser back/forward navigation listener
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!currentUser || !authToken) {
        setActiveTabState('login');
        if (path !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
        return;
      }
      const currentTab = routeToTab[path] || (currentUser.role === 'TUTOR' ? 'tutor-dashboard' : currentUser.role === 'PARENT' ? 'parent-dashboard' : 'dashboard');
      setActiveTab(currentTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, authToken]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Load notifications (for admin/users)
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [refreshTrigger, isAuthenticated]);

  // Auth: Login
  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await loginUser(payload);
    setCurrentUser(res.user);
    setAuthTokenState(res.token);

    if (res.user.role === 'ADMIN') {
      setUserRole('Admin');
      setActiveTabState('dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/admin/dashboard');
      }
    } else if (res.user.role === 'TUTOR') {
      setUserRole('Tutor');
      setActiveTabState('tutor-dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/tutor/dashboard');
      }
    } else if (res.user.role === 'PARENT') {
      setUserRole('Parent');
      setActiveTabState('parent-dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/parent/dashboard');
      }
    }
    return res.user;
  };

  // Auth: Logout
  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthTokenState(null);
    setUserRole('Admin');
    setActiveTabState('login');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/login');
    }
  };

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
        currentUser,
        authToken,
        isAuthenticated,
        login,
        logout,
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
