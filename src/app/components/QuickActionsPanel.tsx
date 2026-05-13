import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Sparkles,
  UserCog,
  DollarSign,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function QuickActionsPanel() {
  const { user } = useAuth();

  const getActionsForRole = () => {
    const isEmployee = user?.role === "employee";
    const isTeamLeader = user?.role === "team_leader";
    const isHRAdmin = user?.role === "hr_admin";

    if (isEmployee) {
      return [
        {
          icon: Calendar,
          label: "View Schedule",
          description: "Check your shifts",
          link: "/my-schedule",
          color: "blue",
        },
        {
          icon: Calendar,
          label: "Request PTO",
          description: "Submit time off",
          link: "/pto",
          color: "purple",
        },
        {
          icon: Clock,
          label: "Timesheet",
          description: "Log your hours",
          link: "/timesheet",
          color: "green",
        },
      ];
    }

    if (isTeamLeader) {
      return [
        {
          icon: Users,
          label: "Team Schedules",
          description: "Manage team shifts",
          link: "/scheduling",
          color: "blue",
        },
        {
          icon: Sparkles,
          label: "Auto Schedule",
          description: "Generate schedules",
          link: "/auto-scheduling",
          color: "purple",
        },
        {
          icon: FileSpreadsheet,
          label: "Grid View",
          description: "View all schedules",
          link: "/schedule-grid",
          color: "indigo",
        },
        {
          icon: FileText,
          label: "Approve PTO",
          description: "Review requests",
          link: "/pto",
          color: "orange",
        },
        {
          icon: ClipboardCheck,
          label: "Attendance",
          description: "Track team attendance",
          link: "/attendance",
          color: "green",
        },
      ];
    }

    if (isHRAdmin) {
      return [
        {
          icon: UserCog,
          label: "Employees",
          description: "Manage staff",
          link: "/employees",
          color: "blue",
        },
        {
          icon: Sparkles,
          label: "Auto Schedule",
          description: "Generate schedules",
          link: "/auto-scheduling",
          color: "purple",
        },
        {
          icon: FileSpreadsheet,
          label: "Grid View",
          description: "View all schedules",
          link: "/schedule-grid",
          color: "indigo",
        },
        {
          icon: DollarSign,
          label: "Payroll",
          description: "Process payments",
          link: "/payroll",
          color: "green",
        },
        {
          icon: Calendar,
          label: "All Schedules",
          description: "Department schedules",
          link: "/scheduling",
          color: "cyan",
        },
      ];
    }

    return [];
  };

  const actions = getActionsForRole();

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500 hover:bg-blue-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      green: "bg-green-500 hover:bg-green-600",
      orange: "bg-orange-500 hover:bg-orange-600",
      indigo: "bg-indigo-500 hover:bg-indigo-600",
      cyan: "bg-cyan-500 hover:bg-cyan-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className={`grid grid-cols-1 ${
        actions.length > 3 ? "md:grid-cols-4" : "md:grid-cols-3"
      } gap-4`}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.link}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200 border border-white/20 hover:scale-105 hover:shadow-lg group"
            >
              <Icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-semibold">{action.label}</h3>
              <p className="text-sm text-white/80 mt-1">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
