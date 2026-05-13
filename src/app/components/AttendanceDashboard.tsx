import { Clock, TrendingUp, AlertCircle, CheckCircle, Users, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useAuth } from "../contexts/AuthContext";

export function AttendanceDashboard() {
  const { user } = useAuth();
  const stats = [
    { label: "Present Today", value: "234", change: "94.7% attendance", color: "green" },
    { label: "Late Arrivals", value: "8", change: "3.2% of workforce", color: "yellow" },
    { label: "Overtime Hours", value: "127", change: "This week", color: "purple" },
    { label: "Absent", value: "13", change: "5.3% of workforce", color: "red" },
  ];

  const weeklyAttendance = [
    { day: "Mon", present: 236, absent: 11, late: 5 },
    { day: "Tue", present: 240, absent: 7, late: 3 },
    { day: "Wed", present: 232, absent: 15, late: 8 },
    { day: "Thu", present: 238, absent: 9, late: 6 },
    { day: "Fri", present: 234, absent: 13, late: 8 },
  ];

  const overtimeTrend = [
    { week: "Week 1", hours: 98 },
    { week: "Week 2", hours: 112 },
    { week: "Week 3", hours: 105 },
    { week: "Week 4", hours: 127 },
  ];

  const attendanceRecords = [
    {
      employee: "Dong Jin",
      department: "Manufacturing",
      clockIn: "7:55 AM",
      clockOut: "8:05 PM",
      status: "present",
      hours: 12.2,
      overtime: 4.2,
    },
    {
      employee: "Paul Na",
      department: "HR",
      clockIn: "8:00 AM",
      clockOut: "8:00 PM",
      status: "present",
      hours: 12,
      overtime: 4,
    },
    {
      employee: "Michael Chen",
      department: "Maintenance",
      clockIn: "8:15 AM",
      clockOut: "8:10 PM",
      status: "late",
      hours: 11.9,
      overtime: 3.9,
    },
    {
      employee: "Emily Davis",
      department: "Vision",
      clockIn: "8:00 AM",
      clockOut: "8:00 PM",
      status: "present",
      hours: 12,
      overtime: 4,
    },
    {
      employee: "Robert Martinez",
      department: "Maintenance",
      clockIn: "-",
      clockOut: "-",
      status: "absent",
      hours: 0,
      overtime: 0,
    },
    {
      employee: "Jennifer Lee",
      department: "R&D",
      clockIn: "8:30 AM",
      clockOut: "7:45 PM",
      status: "late",
      hours: 11.3,
      overtime: 3.3,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <CheckCircle className="w-3 h-3" />
          Present
        </span>;
      case "late":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
          <AlertCircle className="w-3 h-3" />
          Late
        </span>;
      case "absent":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          <AlertCircle className="w-3 h-3" />
          Absent
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor employee attendance and clock records</p>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === "hr_admin" ? "All Departments" : `${user?.department} Department`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const colorClasses = {
            green: "bg-green-50 text-green-600",
            yellow: "bg-yellow-50 text-yellow-600",
            purple: "bg-purple-50 text-purple-600",
            red: "bg-red-50 text-red-600",
          }[stat.color];

          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className={`inline-flex p-3 rounded-lg ${colorClasses} mb-4`}>
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid key="grid-weekly" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-weekly" dataKey="day" stroke="#6b7280" />
              <YAxis key="yaxis-weekly" stroke="#6b7280" />
              <Tooltip
                key="tooltip-weekly"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar key="bar-present" dataKey="present" fill="#16a34a" radius={[8, 8, 0, 0]} name="Present" />
              <Bar key="bar-late" dataKey="late" fill="#eab308" radius={[8, 8, 0, 0]} name="Late" />
              <Bar key="bar-absent" dataKey="absent" fill="#dc2626" radius={[8, 8, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overtime Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Overtime Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overtimeTrend}>
              <CartesianGrid key="grid-overtime" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-overtime" dataKey="week" stroke="#6b7280" />
              <YAxis key="yaxis-overtime" stroke="#6b7280" />
              <Tooltip
                key="tooltip-overtime"
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                key="line-hours"
                type="monotone"
                dataKey="hours"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: "#9333ea", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Attendance Records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Today's Attendance</h2>
          </div>
          <span className="text-sm text-gray-500">May 9, 2026</span>
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
                  Clock In
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {record.employee.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{record.employee}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.clockIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.clockOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.hours} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                    {record.overtime} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Late Arrivals Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Late Arrivals Today</h3>
            <p className="text-sm text-yellow-700">
              8 employees arrived late today. Michael Chen (8:15 AM), Jennifer Lee (8:30 AM), and 6 others.
              Consider sending automated reminders for shift start times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
