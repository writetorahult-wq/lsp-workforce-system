import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreVertical,
  TrendingUp,
  Calendar,
  Clock,
  Building,
  Award,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useEmployees } from "../contexts/EmployeeContext";
import { QuickActionsPanel } from "./QuickActionsPanel";

export function HRAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate stats from fake users data
  const { employees } = useEmployees();

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((u) => u.role !== "hr_admin").length;
    const teamLeaders = employees.filter((u) => u.role === "team_leader").length;
    const departments = new Set(employees.map((u) => u.department)).size;

    return [
      { label: "Total Employees", value: totalEmployees.toString(), change: "Across all departments", color: "blue", link: "/employees" },
      { label: "Active Workforce", value: activeEmployees.toString(), change: `${((activeEmployees/totalEmployees)*100).toFixed(1)}% of total`, color: "green", link: "/attendance" },
      { label: "Team Leaders", value: teamLeaders.toString(), change: "Management staff", color: "purple", link: "/manager" },
      { label: "Departments", value: departments.toString(), change: "Organizational units", color: "orange", link: "/hr-admin" },
    ];
  }, []);

  // Use employees data for employee list view
  const employeeRows = useMemo(() => {
    return employees.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      position:
        user.role === "hr_admin"
          ? "HR Administrator"
          : user.role === "team_leader"
          ? "Team Leader"
          : "Employee",
      status: "active" as const,
      joinDate: "Jan 2024",
    }));
  }, [employees]);

  // Calculate department distribution from employee data
  const departmentData = useMemo(() => {
    const deptCount = employeeRows.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#06b6d4", "#dc2626"];
    return Object.entries(deptCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [employees]);

  // HR-specific metrics
  const hrMetrics = [
    { label: "Open Positions", value: "3", change: "Urgent hiring needed", color: "red", icon: AlertTriangle },
    { label: "Training Programs", value: "8", change: "Active this quarter", color: "blue", icon: Award },
    { label: "Policy Updates", value: "2", change: "Pending approval", color: "yellow", icon: CheckCircle },
    { label: "Compliance Rate", value: "98.5%", change: "+0.3% this month", color: "green", icon: Shield },
  ];

  const attendanceData = [
    { month: "Jan", attendance: 96.2, target: 95 },
    { month: "Feb", attendance: 95.8, target: 95 },
    { month: "Mar", attendance: 97.1, target: 95 },
    { month: "Apr", attendance: 96.5, target: 95 },
    { month: "May", attendance: 94.7, target: 95 },
  ];

  const ptoApprovals = [
    {
      employee: employeeRows.find((u) => u.id === 2)?.name || "Cho Sanghyeok",
      department: employeeRows.find((u) => u.id === 2)?.department || "Maintenance",
      dates: "May 20-22, 2026",
      days: 3,
      type: "Vacation",
    },
    {
      employee: employeeRows.find((u) => u.id === 3)?.name || "An Youngdo",
      department: employeeRows.find((u) => u.id === 3)?.department || "Maintenance",
      dates: "Jun 1-5, 2026",
      days: 5,
      type: "Vacation",
    },
    {
      employee: employeeRows.find((u) => u.id === 10)?.name || "Enrique",
      department: employeeRows.find((u) => u.id === 10)?.department || "Maintenance",
      dates: "May 15, 2026",
      days: 1,
      type: "Personal",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage employees and HR operations</p>
          <p className="text-sm text-gray-500 mt-1">Chicago Plant - Full System Access</p>
        </div>
        <Link
          to="/employees"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            yellow: "bg-yellow-50 text-yellow-600",
            purple: "bg-purple-50 text-purple-600",
            orange: "bg-orange-50 text-orange-600",
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

      {/* HR-Specific Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">HR Operations Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hrMetrics.map((metric) => {
            const colorClasses = {
              red: "bg-red-50 text-red-600",
              blue: "bg-blue-50 text-blue-600",
              yellow: "bg-yellow-50 text-yellow-600",
              green: "bg-green-50 text-green-600",
            }[metric.color];

            const IconComponent = metric.icon;

            return (
              <div key={metric.label} className="flex items-center gap-4">
                <div className={`inline-flex p-3 rounded-lg ${colorClasses}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                key="pie-department"
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip key="tooltip-department" />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {departmentData.map((dept) => (
              <div key={dept.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-sm text-gray-600">
                  {dept.name}: {dept.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid key="grid-hr-attendance" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-hr-attendance" dataKey="month" stroke="#6b7280" />
              <YAxis key="yaxis-hr-attendance" stroke="#6b7280" domain={[90, 100]} />
              <Tooltip
                key="tooltip-hr-attendance"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar key="bar-hr-attendance" dataKey="attendance" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PTO Approval Queue */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">PTO Approval Queue</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
              {ptoApprovals.length} Pending
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
          {ptoApprovals.map((request, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {request.employee.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.employee}</h3>
                    <p className="text-sm text-gray-500">{request.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Dates</p>
                    <p className="font-medium text-gray-900">{request.dates}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{request.days} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-gray-900">{request.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/pto")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => navigate("/pto")}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />

      {/* Employee Management Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
              <Link
                to="/employees"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => navigate("/employees")}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {employee.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {employee.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/employees");
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
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
