import { useEffect, useState, useMemo } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle, Calendar } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function NotificationPopup() {
  const { getNotificationsForUser, markAsRead, clearNotification } = useNotifications();
  const { user } = useAuth();
  const [visibleNotifications, setVisibleNotifications] = useState<number[]>([]);
  const navigate = useNavigate();

  // Use actual user ID from auth context
  const currentEmployeeId = user?.id || 1;

  // Get filtered notifications for current user - memoized to prevent re-renders
  const notifications = useMemo(() =>
    getNotificationsForUser(
      user?.role || "employee",
      currentEmployeeId,
      user?.department
    ),
    [getNotificationsForUser, user?.role, currentEmployeeId, user?.department]
  );

  useEffect(() => {
    // Show new unread notifications
    const newUnread = notifications
      .filter(n => !n.read)
      .slice(0, 3) // Show max 3 at a time
      .map(n => n.id);

    setVisibleNotifications(newUnread);

    // Auto-hide after 5 seconds
    if (newUnread.length > 0) {
      const timer = setTimeout(() => {
        setVisibleNotifications([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setVisibleNotifications(prev => prev.filter(id => id !== notification.id));
  };

  const handleClose = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
    markAsRead(notificationId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "pto_request":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "pto_request":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const visibleNotificationsList = notifications.filter(n =>
    visibleNotifications.includes(n.id)
  );

  if (visibleNotificationsList.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md">
      {visibleNotificationsList.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`${getBackgroundColor(notification.type)} border-2 rounded-xl shadow-2xl p-4 cursor-pointer hover:shadow-xl transition-all transform animate-slideIn`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  {notification.title}
                </h3>
                <button
                  onClick={(e) => handleClose(notification.id, e)}
                  className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
              {notification.employeeName && (
                <div className="mt-2 text-xs text-gray-600">
                  <strong>{notification.employeeName}</strong>
                  {notification.employeeDepartment && ` • ${notification.employeeDepartment}`}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
