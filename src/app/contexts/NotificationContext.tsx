import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "pto_request";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  employeeName?: string;
  employeeDepartment?: string;
  ptoRequestId?: number;
  targetRoles?: string[]; // Which roles should see this notification
  targetEmployeeId?: number; // Which specific employee should see this
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotification: (id: number) => void;
  clearAllNotifications: () => void;
  getUnreadNotifications: () => Notification[];
  getNotificationsForUser: (userRole: string, employeeId: number, department?: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("lspNotifications");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Array<Omit<Notification, "timestamp"> & { timestamp: string }>;
      return parsed.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lspNotifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Use timestamp for unique ID
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OahURALTqTj8LVgGgU2jdXyy3krBSF1xu/glEILElyx6OyrVhQJQ5zd8sFuIQUpfs7y3Ik3CBhluuvmnlARC0uj4/C1YBoFN4/X8s15KwUic8Xv4JJCC');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getNotificationsForUser = useCallback((userRole: string, employeeId: number, department?: string) => {
    return notifications.filter(notification => {
      // If notification is targeted to specific employee ID
      if (notification.targetEmployeeId !== undefined) {
        return notification.targetEmployeeId === employeeId;
      }

      // If notification is targeted to specific roles
      if (notification.targetRoles && notification.targetRoles.length > 0) {
        // Check if user's role is in target roles
        if (!notification.targetRoles.includes(userRole)) {
          return false;
        }

        // For team_leader, only show notifications from their department
        if (userRole === "team_leader" && notification.employeeDepartment) {
          return notification.employeeDepartment === department;
        }

        return true;
      }

      // If no targeting specified, show to everyone
      return true;
    });
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        getUnreadNotifications,
        getNotificationsForUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
