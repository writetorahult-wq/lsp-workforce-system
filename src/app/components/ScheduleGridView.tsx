import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { fakeUsers } from "./fakeUsers";

type ShiftType = "day" | "night" | "off" | "vacation" | null;

interface ScheduleEntry {
  employeeId: number;
  date: string;
  shift: ShiftType;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  team?: string;
}

export function ScheduleGridView() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get schedule data from localStorage
  const schedules = useMemo(() => {
    const stored = localStorage.getItem("employeeSchedules");
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Get all employees
  const allEmployees: Employee[] = useMemo(
    () =>
      fakeUsers
        .filter((user) => user.role !== "hr_admin")
        .map((user) => ({
          id: user.id,
          name: user.name,
          department: user.department,
          team: user.team,
        })),
    []
  );

  // Get unique teams
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(allEmployees.map((e) => e.team).filter(Boolean))];
    return uniqueTeams.sort();
  }, [allEmployees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = selectedTeam === "all" || emp.team === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [allEmployees, searchTerm, selectedTeam]);

  // Get date range for current view
  const getDateRange = () => {
    if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start, end };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Generate array of dates for the view
  const dates = useMemo(() => {
    const dateArray = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dateArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dateArray;
  }, [startDate, endDate]);

  // Get shift for employee on specific date
  const getShift = (employeeId: number, date: Date) => {
    const dateStr = `${date.toLocaleString("default", {
      month: "long",
    })} ${date.getDate()}`;
    const schedule = schedules.find(
      (s: ScheduleEntry) => s.employeeId === employeeId && s.date === dateStr
    );
    return schedule?.shift || null;
  };

  // Calculate statistics
  const getEmployeeStats = (employeeId: number) => {
    const workDays = dates.filter((date) => {
      const shift = getShift(employeeId, date);
      return shift === "day" || shift === "night";
    }).length;
    const offDays = dates.filter((date) => {
      const shift = getShift(employeeId, date);
      return shift === "off";
    }).length;
    return { workDays, offDays };
  };

  // Get shift display
  const getShiftDisplay = (shift: ShiftType) => {
    if (!shift) return "-";
    if (shift === "vacation") return "V";
    if (shift === "off") return "OFF";
    if (shift === "day") return "D";
    if (shift === "night") return "N";
    return "-";
  };

  // Get shift color
  const getShiftColor = (shift: ShiftType) => {
    if (!shift || shift === "off") return "bg-gray-100 text-gray-700";
    if (shift === "vacation") return "bg-yellow-100 text-yellow-700";
    if (shift === "day" || shift === "night") return "bg-green-100 text-green-700";
    return "bg-gray-50 text-gray-600";
  };

  // Export to Excel (simplified CSV format)
  const handleExport = () => {
    let csv = "Employee,Team,Department";
    dates.forEach((date) => {
      const dayName = date.toLocaleString("default", { weekday: "short" });
      const dateNum = date.getDate();
      csv += `,${dayName} ${dateNum}`;
    });
    csv += ",Working Days,OFF Days\n";

    filteredEmployees.forEach((emp) => {
      const stats = getEmployeeStats(emp.id);
      csv += `"${emp.name}","${emp.team || "-"}","${emp.department}"`;
      dates.forEach((date) => {
        const shift = getShift(emp.id, date);
        csv += `,"${getShiftDisplay(shift)}"`;
      });
      csv += `,${stats.workDays},${stats.offDays}\n`;
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `schedule-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Export Complete", "Schedule exported as CSV");
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Navigate dates
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          Schedule Grid View
        </h1>
        <p className="text-gray-600 mt-2">View all employee schedules in one spreadsheet-style display</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Team Filter */}
        <div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode */}
        <div>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "week" | "month")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Weekly View</option>
            <option value="month">Monthly View</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={handlePrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === "week"
              ? `Week of ${startDate.toLocaleDateString()}`
              : `${startDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}`}
          </h3>
          <p className="text-sm text-gray-600">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition font-medium"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            {/* Header */}
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-left font-semibold min-w-[200px]">
                  Employee
                </th>
                <th className="sticky left-[200px] z-20 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center font-semibold min-w-[80px]">
                  Team
                </th>
                {dates.map((date) => (
                  <th
                    key={date.toISOString()}
                    className="px-3 py-3 text-center font-semibold min-w-[60px] whitespace-nowrap"
                  >
                    <div className="text-xs">
                      {date.toLocaleString("default", { weekday: "short" })}
                    </div>
                    <div className="text-sm font-bold">{date.getDate()}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold min-w-[80px] bg-gradient-to-r from-green-600 to-green-700">
                  Working
                </th>
                <th className="px-4 py-3 text-center font-semibold min-w-[80px] bg-gradient-to-r from-red-600 to-red-700">
                  OFF
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={dates.length + 4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const stats = getEmployeeStats(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      className={`border-b transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      {/* Employee Name (Sticky) */}
                      <td className="sticky left-0 z-10 px-4 py-3 font-medium text-gray-900 bg-inherit min-w-[200px]">
                        {emp.name}
                      </td>

                      {/* Team (Sticky) */}
                      <td className="sticky left-[200px] z-10 px-4 py-3 text-center text-sm font-medium bg-inherit min-w-[80px]">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {emp.team || "-"}
                        </span>
                      </td>

                      {/* Daily Shifts */}
                      {dates.map((date) => {
                        const shift = getShift(emp.id, date);
                        return (
                          <td
                            key={date.toISOString()}
                            className={`px-3 py-3 text-center font-semibold min-w-[60px] ${getShiftColor(
                              shift
                            )}`}
                          >
                            {getShiftDisplay(shift)}
                          </td>
                        );
                      })}

                      {/* Working Days */}
                      <td className="px-4 py-3 text-center font-bold text-green-700 bg-green-50">
                        {stats.workDays}
                      </td>

                      {/* OFF Days */}
                      <td className="px-4 py-3 text-center font-bold text-red-700 bg-red-50">
                        {stats.offDays}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-700 font-bold flex items-center justify-center rounded">
              D
            </span>
            <span className="text-sm text-gray-700">Day Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-700 font-bold flex items-center justify-center rounded">
              N
            </span>
            <span className="text-sm text-gray-700">Night Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-100 text-gray-700 font-bold flex items-center justify-center rounded">
              OFF
            </span>
            <span className="text-sm text-gray-700">Off Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-100 text-yellow-700 font-bold flex items-center justify-center rounded">
              V
            </span>
            <span className="text-sm text-gray-700">Vacation</span>
          </div>
        </div>
      </div>

      {/* Navigation Back */}
      <div className="mt-6 flex gap-2">
        <Link
          to="/scheduling"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
        >
          ← Back to Scheduling
        </Link>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .bg-gradient-to-br,
          button,
          .print\\:hidden {
            display: none !important;
          }
          table {
            font-size: 10px;
          }
          th {
            background-color: #2563eb !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          tr:nth-child(odd) {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
