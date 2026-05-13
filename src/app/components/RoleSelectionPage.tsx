import { useNavigate } from "react-router-dom";
import { Users, UserCog, Shield, Factory } from "lucide-react";

export function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "employee",
      title: "Employee Login",
      description: "Access your dashboard, schedules, and timesheets",
      icon: Users,
      color: "from-blue-600 to-blue-700",
      features: ["Dashboard", "PTO Requests", "View Schedules", "Clock In/Out", "Timesheets"],
    },
    {
      id: "team_leader",
      title: "Team Leader Login",
      description: "Manage your team and approve requests",
      icon: UserCog,
      color: "from-purple-600 to-purple-700",
      features: ["Approve PTO", "Manage Schedules", "Team Attendance", "Team Reports"],
    },
    {
      id: "hr_admin",
      title: "HR/Admin Login",
      description: "Full system access and employee management",
      icon: Shield,
      color: "from-green-600 to-green-700",
      features: ["Employee Management", "All Approvals", "Reports", "Full System Access"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
            <span className="text-white font-bold text-3xl">LSP</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">LSP USA LLC</h1>
          <p className="text-xl text-gray-600">Workforce Management System</p>
          <p className="text-sm text-gray-500 mt-2">Chicago Plant</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => navigate(`/login/${role.id}`)}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 text-left group"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${role.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h2>
                <p className="text-gray-600 mb-6">{role.description}</p>
                <div className="space-y-2">
                  {role.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="text-blue-600 font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                    Continue
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-3">
            <Factory className="w-4 h-4" />
            <span>Manufacturing Workforce Management - Chicago Plant</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-2">
            <span>Day Shift: 8AM-8PM</span>
            <span>•</span>
            <span>Night Shift: 8PM-8AM</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 LSP USA LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
