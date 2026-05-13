import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { fakeUsers } from "./fakeUsers";
import { QuickActionsPanel } from "./QuickActionsPanel";

export function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate team stats from fake users data
  const teamMembers = fakeUsers.filter(u => u.role === 'employee' && u.department === user?.department);
  const teamStats = [
    { label: "Team Members", value: teamMembers.length.toString(), change: "In your department", color: "blue", link: "/manager" },
    { label: "Present Today", value: Math.floor(teamMembers.length * 0.92).toString(), change: "92% attendance rate", color: "green", link: "/attendance" },
    { label: "Avg Performance", value: "89%", change: "+2% from last month", color: "purple", link: "/manager" },
    { label: "Pending Reviews", value: "3", change: "Due this week", color: "yellow", link: "/timesheet" },
  ];

  // Use fake users data for team members display
  const teamMemberData = teamMembers.slice(0, 6).map(member => ({
    name: member.name,
    position: member.team ? `Team ${member.team}` : 'Employee',
    status: Math.random() > 0.1 ? 'present' : 'pto', // Mock status
    performance: Math.floor(Math.random() * 20) + 80, // Mock performance 80-100
    hoursThisWeek: Math.floor(Math.random() * 8) + 32, // Mock hours 32-40
  }));

  const pendingApprovals = [
    {
      employee: "Michael Chen",
      type: "PTO Request",
      details: "Vacation - Jun 10-14 (5 days)",
      submittedDate: "May 8, 2026",
    },
    {
      employee: "Robert Martinez",
      type: "Timesheet",
      details: "Week of May 5-11 (40 hours)",
      submittedDate: "May 9, 2026",
    },
    {
      employee: "Jennifer Lee",
      type: "PTO Request",
      details: "Personal - May 15 (1 day)",
      submittedDate: "May 9, 2026",
    },
  ];

  const productivityData = [
    { week: "Week 1", productivity: 88 },
    { week: "Week 2", productivity: 90 },
    { week: "Week 3", productivity: 87 },
    { week: "Week 4", productivity: 92 },
    { week: "Week 5", productivity: 91 },
  ];

  const attendanceData = [
    { day: "Mon", attendance: 23 },
    { day: "Tue", attendance: 24 },
    { day: "Wed", attendance: 22 },
    { day: "Thu", attendance: 23 },
    { day: "Fri", attendance: 22 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "pto":
        return "bg-yellow-100 text-yellow-700";
      case "absent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-blue-600";
    if (performance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Leader Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your team's performance and manage approvals</p>
        <p className="text-sm text-gray-500 mt-1">{user?.department} Department</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat) => {
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            yellow: "bg-yellow-50 text-yellow-600",
            purple: "bg-purple-50 text-purple-600",
          }[stat.color];

          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
            >
              <div className={`inline-flex p-3 rounded-lg ${colorClasses} mb-4`}>
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </Link>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Productivity Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Productivity Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={productivityData}>
              <CartesianGrid key="grid-productivity" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-productivity" dataKey="week" stroke="#6b7280" />
              <YAxis key="yaxis-productivity" stroke="#6b7280" domain={[80, 100]} />
              <Tooltip
                key="tooltip-productivity"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                key="line-productivity"
                type="monotone"
                dataKey="productivity"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: "#9333ea", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Attendance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid key="grid-attendance" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-attendance" dataKey="day" stroke="#6b7280" />
              <YAxis key="yaxis-attendance" stroke="#6b7280" domain={[0, 24]} />
              <Tooltip
                key="tooltip-attendance"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar key="bar-attendance" dataKey="attendance" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              {pendingApprovals.length} Pending
            </span>
            <Link
              to="/pto"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingApprovals.map((approval, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {approval.employee.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{approval.employee}</h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {approval.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{approval.details}</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted: {approval.submittedDate}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/pto")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => navigate("/pto")}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />

      {/* Team Members Overview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hours This Week
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMemberData.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {member.status === "present" ? "Present" : "PTO"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600"
                          style={{ width: `${member.performance}%` }}
                        />
                      </div>
                      <span className={`font-semibold ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {member.hoursThisWeek} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
