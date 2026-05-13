import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-900",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor } =
    config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-xl shadow-2xl p-4 max-w-md w-full animate-slideInRight`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${titleColor} text-sm`}>{title}</h3>
          {message && (
            <p className="text-sm text-gray-700 mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              type === "success"
                ? "bg-green-600"
                : type === "error"
                ? "bg-red-600"
                : type === "warning"
                ? "bg-yellow-600"
                : "bg-blue-600"
            } animate-shrink`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
