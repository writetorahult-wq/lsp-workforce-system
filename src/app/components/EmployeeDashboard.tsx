import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Bell,
  CalendarDays,
  Sun,
  Moon,
  Play,
  Square,
  Wifi,
  WifiOff,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCompanyNetwork } from "../hooks/useCompanyNetwork";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { useToast } from "../contexts/ToastContext";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { isOnCompanyNetwork, networkInfo, isChecking } = useCompanyNetwork();
  const toast = useToast();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const currentShift = "day"; // day or night

  const handleClockAction = () => {
    if (!isOnCompanyNetwork) {
      toast.error("Network Required", "You must be on the company network to clock in/out");
      return;
    }

    const newState = !isClockedIn;
    setIsClockedIn(newState);

    if (newState) {
      toast.success("Clocked In", "Your shift has started. Have a productive day!");
    } else {
      toast.success("Clocked Out", "Your shift has ended. Great work today!");
    }
  };
  const stats = [
    {
      label: "PTO Balance",
      value: "12.5 days",
      change: "+2.5 this month",
      icon: Calendar,
      color: "blue",
      link: "/pto",
    },
    {
      label: "Hours This Week",
      value: "38.5 hrs",
      change: "1.5 hrs remaining",
      icon: Clock,
      color: "green",
      link: "/timesheet",
    },
    {
      label: "Attendance",
      value: "98.5%",
      change: "Excellent",
      icon: CheckCircle,
      color: "teal",
      link: "/",
    },
    {
      label: "Current Shift",
      value: currentShift === "day" ? "Day" : "Night",
      change: currentShift === "day" ? "8AM - 8PM" : "8PM - 8AM",
      icon: currentShift === "day" ? Sun : Moon,
      color: "purple",
      link: "/scheduling",
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "PTO Request Approved",
      message: "Your PTO request for May 20-22 has been approved",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Timesheet Pending",
      message: "Please submit your timesheet for last week",
      time: "1 day ago",
    },
    {
      id: 3,
      type: "info",
      title: "Payroll Processed",
      message: "Your payroll for April has been processed",
      time: "2 days ago",
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-gray-600 mt-1">LSP USA LLC - Chicago Plant</p>
        <p className="text-sm text-gray-500 capitalize">
          {user?.role.replace("_", " ")} - {user?.department}
        </p>
      </div>

      {/* Clock In/Out and Current Shift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock In/Out Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          {/* Network Status Banner */}
          <div className={`mb-4 p-3 rounded-lg border ${
            isChecking
              ? "bg-yellow-500/20 border-yellow-400/30"
              : isOnCompanyNetwork
              ? "bg-green-500/20 border-green-400/30"
              : "bg-red-500/20 border-red-400/30"
          }`}>
            <div className="flex items-center gap-2">
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span className="text-sm font-medium">Checking network...</span>
                </>
              ) : isOnCompanyNetwork ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Connected: {networkInfo}</span>
                    <p className="text-xs opacity-90 mt-0.5">Clock in/out enabled</p>
                  </div>
                  <Shield className="w-4 h-4" />
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Not on company network</span>
                    <p className="text-xs opacity-90 mt-0.5">Clock in/out disabled</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Clock In/Out</h2>
              <p className="text-blue-100">
                {isClockedIn ? "You are currently clocked in" : "Ready to start your shift?"}
              </p>
              {isClockedIn && (
                <p className="text-blue-100 mt-2 font-semibold">Time elapsed: 3h 24m</p>
              )}
            </div>
            <button
              onClick={handleClockAction}
              disabled={!isOnCompanyNetwork || isChecking}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                !isOnCompanyNetwork || isChecking
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : isClockedIn
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              {isClockedIn ? (
                <>
                  <Square className="w-5 h-5" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Clock In
                </>
              )}
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm text-blue-100 mb-1">Current Time</p>
            <p className="text-2xl font-bold">2:30 PM</p>
          </div>

          {!isOnCompanyNetwork && !isChecking && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-3">
              <p className="text-sm font-medium">⚠️ Clock In/Out Restricted</p>
              <p className="text-xs opacity-90 mt-1">
                You must be connected to the LSP Chicago Plant network or company WiFi to clock in/out.
              </p>
            </div>
          )}
        </div>

        {/* Current Shift Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Shift</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                currentShift === "day" ? "bg-blue-500" : "bg-gray-700"
              } text-white`}>
                {currentShift === "day" ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentShift === "day" ? "Day Shift" : "Night Shift"}
                </p>
                <p className="text-gray-600">
                  {currentShift === "day" ? "8:00 AM - 8:00 PM" : "8:00 PM - 8:00 AM"}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Next Shift:</span>
                <span className="font-semibold text-gray-900">Tomorrow - Day Shift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-semibold text-gray-900">{user?.department}</span>
              </div>
            </div>
            <Link
              to="/my-schedule"
              className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              View Full Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            purple: "bg-purple-50 text-purple-600",
            teal: "bg-teal-50 text-teal-600",
          }[stat.color];

          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </Link>
          );
        })}
      </div>

      {/* Notifications - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <span className="text-sm text-blue-600 font-medium cursor-pointer hover:text-blue-700">
            View All
          </span>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                <div
                  className={`mt-1 w-2 h-2 rounded-full ${
                    notif.type === "success"
                      ? "bg-green-500"
                      : notif.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />
    </div>
  );
}
