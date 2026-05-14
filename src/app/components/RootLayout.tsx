import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Sparkles,
  TestTube,
  UserPlus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePTO } from "../contexts/PTOContext";
import { NotificationCenter } from "./NotificationCenter";
import { NotificationPopup } from "./NotificationPopup";

export function RootLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { getPendingRequestsCount } = usePTO();

  const pendingPTOCount = useMemo(() =>
    user?.role === "team_leader" || user?.role === "hr_admin"
      ? getPendingRequestsCount(user?.role, user?.department)
      : 0,
    [user?.role, user?.department, getPendingRequestsCount]
  );

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Define navigation items with role-based access
  const allNavigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: ["employee", "team_leader", "hr_admin"]
    },
    {
      name: "My Schedule",
      href: "/my-schedule",
      icon: Calendar,
      roles: ["employee", "team_leader"]
    },
    {
      name: "Manage Team Schedules",
      href: "/scheduling",
      icon: Users,
      roles: ["team_leader"]
    },
    {
      name: "Auto Scheduling",
      href: "/auto-scheduling",
      icon: Sparkles,
      roles: ["team_leader"]
    },
    {
      name: "All Schedules",
      href: "/scheduling",
      icon: Calendar,
      roles: ["hr_admin"]
    },
    {
      name: "Auto Scheduling",
      href: "/auto-scheduling",
      icon: Sparkles,
      roles: ["hr_admin"]
    },
    {
      name: "PTO",
      href: "/pto",
      icon: Calendar,
      roles: ["employee", "team_leader", "hr_admin"]
    },
    {
      name: "Timesheet",
      href: "/timesheet",
      icon: Clock,
      roles: ["employee", "team_leader", "hr_admin"]
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      roles: ["team_leader", "hr_admin"]
    },
    {
      name: "Payroll",
      href: "/payroll",
      icon: DollarSign,
      roles: ["hr_admin"]
    },
    {
      name: "HR Admin",
      href: "/hr-admin",
      icon: Users,
      roles: ["hr_admin"]
    },
    {
      name: "Create User",
      href: "/signup",
      icon: UserPlus,
      roles: ["hr_admin"]
    },
    {
      name: "Employee Management",
      href: "/employees",
      icon: UserCog,
      roles: ["hr_admin"]
    },
    {
      name: "Team Management",
      href: "/manager",
      icon: UserCog,
      roles: ["team_leader"]
    },
    {
      name: "🧪 Test Interactions",
      href: "/interaction-test",
      icon: TestTube,
      roles: ["employee", "team_leader", "hr_admin"]
    },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Popup */}
      <NotificationPopup />

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">LSP</span>
          </div>
          <span className="font-semibold text-gray-900">LSP USA</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-64 bg-white border-r border-gray-200
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">LSP</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">LSP USA</h1>
                  <p className="text-xs text-gray-500">Chicago Plant</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <NotificationCenter />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const showBadge = item.href === "/pto" && pendingPTOCount > 0;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative
                    ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {showBadge && (
                    <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {pendingPTOCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3 px-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-semibold text-blue-600">
                  {user?.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-20 lg:pt-0">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
