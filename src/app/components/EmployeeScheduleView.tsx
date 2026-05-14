import { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon, Home, Plane, Send, AlertCircle, Bell, ArrowRight, Search, Filter } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEmployees, Employee } from "../contexts/EmployeeContext";

type ShiftType = "day" | "night" | "off" | "vacation" | null;

interface ScheduleEntry {
  employeeId: number;
  date: string;
  shift: ShiftType;
}

export function EmployeeScheduleView() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Current month
  });
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState(2); // Mock pending notifications
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [allSchedules, setAllSchedules] = useState<ScheduleEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const isManager = user?.role === "team_leader" || user?.role === "hr_admin";
  const isTeamLeader = user?.role === "team_leader";
  const currentEmployeeId = user?.id;

  const { employees } = useEmployees();

  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee])),
    [employees]
  );

  const scheduleByEmployee = useMemo(() => {
    const grouped: Record<number, { employee: Employee; shifts: ScheduleEntry[] }> = {};
    allSchedules.forEach((entry) => {
      const employee = employeeMap[entry.employeeId];
      if (!employee) return;
      if (!grouped[entry.employeeId]) {
        grouped[entry.employeeId] = { employee, shifts: [] };
      }
      grouped[entry.employeeId].shifts.push(entry);
    });
    return Object.values(grouped).map((item) => ({
      ...item,
      shifts: item.shifts.sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, [allSchedules, employeeMap]);

  const filteredScheduleByEmployee = useMemo(() => {
    return scheduleByEmployee.filter((item) => {
      const matchesSearch = item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === "all" || item.employee.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [scheduleByEmployee, searchTerm, departmentFilter]);

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((u) => u.department))];
    return ["all", ...depts];
  }, [employees]);

  const getNextShift = (shifts: ScheduleEntry[]) => {
    const today = new Date();
    const todayStr = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}`;

    // Find the next scheduled shift
    const futureShifts = shifts.filter(shift => {
      // Simple date comparison - in production you'd want proper date parsing
      return shift.date >= todayStr && shift.shift && shift.shift !== "off";
    });

    return futureShifts.length > 0 ? futureShifts[0] : null;
  };

  // Load schedule from localStorage and sync in real-time
  useEffect(() => {
    if (!currentEmployeeId) {
      return;
    }

    const loadSchedule = () => {
      const saved = localStorage.getItem("employeeSchedules");
      const allScheduleData: ScheduleEntry[] = saved ? JSON.parse(saved) : [];
      setAllSchedules(allScheduleData);
      setSchedule(allScheduleData.filter((s) => s.employeeId === currentEmployeeId));
    };

    // Initial load
    loadSchedule();

    // Sync every 500ms for real-time updates
    const intervalId = setInterval(loadSchedule, 500);

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = () => {
      loadSchedule();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentEmployeeId]);

  const handleViewNextWeek = () => {
    if (viewMode === "week") {
      setCurrentWeek(currentWeek + 1);
    } else {
      navigateMonth("next");
    }
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  // Get schedule for the selected month (from live data)
  const getMonthSchedule = (): ScheduleEntry[] => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const monthName = months[month];

    // Filter schedule entries for the current month
    return schedule.filter(entry => {
      return entry.date.startsWith(monthName);
    });
  };

  const monthSchedule = getMonthSchedule();

  // Get schedule for the current week (from live data)
  const getWeekSchedule = (): ScheduleEntry[] => {
    // Filter for the current week dates
    return schedule.filter(entry => dates.includes(entry.date));
  };

  const mySchedule = getWeekSchedule();

  const getMonthCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: Array<{ date: number | null; dateStr: string | null; shift: ShiftType | null }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateStr: null, shift: null });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthName = months[month];
      const dateStr = `${monthName} ${day}`;
      // Find shift from live schedule data
      const scheduleEntry = schedule.find(
  s => s.date === dateStr && s.employeeId === currentEmployeeId
);
      days.push({
        date: day,
        dateStr: dateStr,
        shift: scheduleEntry?.shift || null,
      });
    }

    return days;
  };

  const getShiftForDate = (date: string): ShiftType | null => {
    const entry = schedule.find(
  (s) => s.date === date && s.employeeId === currentEmployeeId
);
    return entry?.shift || null;
  };

  const getShiftDisplay = (shift: ShiftType | null) => {
    switch (shift) {
      case "day":
        return { label: "Day Shift", color: "bg-blue-500", textColor: "text-white", icon: Sun, time: "8:00 AM - 8:00 PM" };
      case "night":
        return { label: "Night Shift", color: "bg-gray-700", textColor: "text-white", icon: Moon, time: "8:00 PM - 8:00 AM" };
      case "off":
        return { label: "Off Day", color: "bg-green-500", textColor: "text-white", icon: Home, time: "Not Scheduled" };
      case "vacation":
        return { label: "Vacation", color: "bg-orange-500", textColor: "text-white", icon: Plane, time: "PTO Approved" };
      default:
        return { label: "Not Scheduled", color: "bg-gray-200", textColor: "text-gray-600", icon: AlertCircle, time: "" };
    }
  };

  const handleRequestChange = (date: string) => {
    setSelectedDate(date);
    setShowChangeRequestModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            {pendingNotifications > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingNotifications}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {isTeamLeader
              ? "Your personal schedule (managed by HR/higher management)"
              : `View your assigned shifts for ${user?.department}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">Chicago Plant</p>
        </div>
        <button
          onClick={handleViewNextWeek}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View Next {viewMode === "week" ? "Week" : "Month"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">
            {isTeamLeader ? "Personal Schedule - Read Only" : "Read-Only Schedule"}
          </h3>
          <p className="text-sm text-blue-700">
            {isTeamLeader
              ? "This is your personal work schedule, managed by HR or higher management. You can view your shifts and request changes if needed."
              : "You can view your assigned shifts here. If you need to change your schedule, click on any shift to request a change. Your team leader will review and approve the request."}
          </p>
          {viewMode === "month" && (
            <p className="text-sm text-blue-700 mt-2">
              💡 <strong>Tip:</strong> Click on any day in the calendar to request a schedule change.
            </p>
          )}
        </div>
      </div>

      {isManager && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Employee Schedules</h2>
              <p className="text-sm text-gray-500">
                Search and view all published schedules across the organization.
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-600">
              {allSchedules.length} Scheduled shifts
            </span>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Next Shift</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Shifts</th>
                </tr>
              </thead>
              <tbody>
                {filteredScheduleByEmployee.map((item) => {
                  const nextShift = getNextShift(item.shifts);
                  const getShiftDisplay = (shift: ShiftType) => {
                    switch (shift) {
                      case "day":
                        return { label: "Day Shift", color: "bg-blue-100 text-blue-800", icon: Sun };
                      case "night":
                        return { label: "Night Shift", color: "bg-gray-100 text-gray-800", icon: Moon };
                      case "off":
                        return { label: "Off Day", color: "bg-green-100 text-green-800", icon: Home };
                      case "vacation":
                        return { label: "Vacation", color: "bg-orange-100 text-orange-800", icon: Plane };
                      default:
                        return { label: "Not Scheduled", color: "bg-gray-100 text-gray-600", icon: AlertCircle };
                    }
                  };

                  const shiftDisplay = nextShift ? getShiftDisplay(nextShift.shift) : getShiftDisplay(null);
                  const ShiftIcon = shiftDisplay.icon;

                  return (
                    <tr key={item.employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.employee.name}</p>
                          <p className="text-sm text-gray-500">{item.employee.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.employee.department}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {nextShift ? (
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${shiftDisplay.color}`}>
                            <ShiftIcon className="w-4 h-4" />
                            {shiftDisplay.label}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No upcoming shifts</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {nextShift ? nextShift.date : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {item.shifts.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredScheduleByEmployee.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {viewMode === "month" ? (
              <>
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900">
                  {months[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </span>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900">Week of {dates[0]}, 2026</span>
                <button
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "week" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === "month" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Shift Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white rounded-lg p-3 flex items-center justify-center w-12 h-12">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Day Shift</p>
              <p className="text-sm text-gray-500">8:00 AM - 8:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-700 text-white rounded-lg p-3 flex items-center justify-center w-12 h-12">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Night Shift</p>
              <p className="text-sm text-gray-500">8:00 PM - 8:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-lg p-3 flex items-center justify-center w-12 h-12">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Off Day</p>
              <p className="text-sm text-gray-500">Not scheduled</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white rounded-lg p-3 flex items-center justify-center w-12 h-12">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Vacation</p>
              <p className="text-sm text-gray-500">PTO approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule View - Week or Month */}
      {viewMode === "week" ? (
        /* Weekly Schedule */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">My Weekly Schedule</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-y md:divide-y-0 border-t border-gray-200">
            {dates.map((date, idx) => {
              const shift = getShiftForDate(date);
              const display = getShiftDisplay(shift);
              const Icon = display.icon;

              return (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors min-h-[180px]">
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900">{weekDays[idx]}</p>
                    <p className="text-sm text-gray-500">{date}</p>
                  </div>

                  {shift && (
                    <div className={`${display.color} ${display.textColor} rounded-lg p-4 mb-3`}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold text-sm">{display.label}</span>
                      </div>
                      <p className="text-xs text-center opacity-90">{display.time}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRequestChange(date)}
                    className="w-full text-center px-3 py-2 text-sm border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Request Change
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Monthly Calendar View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">My Monthly Schedule</h2>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDaysShort.map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {getMonthCalendarDays().map((day, idx) => {
                if (!day.date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const display = getShiftDisplay(day.shift);
                const Icon = display?.icon;
                const isToday = day.date === 10 && selectedMonth.getMonth() === 4; // Mock today

                return (
                  <div
                    key={idx}
                    className={`aspect-square border rounded-lg p-2 hover:shadow-md transition-all cursor-pointer ${
                      isToday ? "border-blue-500 border-2" : "border-gray-200"
                    }`}
                    onClick={() => day.dateStr && handleRequestChange(day.dateStr)}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                        {day.date}
                      </div>
                      {day.shift && display && (
                        <div className={`${display.color} ${display.textColor} rounded p-1 flex-1 flex flex-col items-center justify-center`}>
                          {Icon && <Icon className="w-4 h-4 mb-1" />}
                          <span className="text-xs font-medium text-center leading-tight">{display.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Day Shifts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(viewMode === "month" ? monthSchedule : mySchedule).filter((s) => s.shift === "day").length}
          </p>
          <p className="text-sm text-gray-500 mt-1">{viewMode === "month" ? "This month" : "This week"}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-700">Night Shifts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(viewMode === "month" ? monthSchedule : mySchedule).filter((s) => s.shift === "night").length}
          </p>
          <p className="text-sm text-gray-500 mt-1">{viewMode === "month" ? "This month" : "This week"}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Off Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(viewMode === "month" ? monthSchedule : mySchedule).filter((s) => s.shift === "off").length}
          </p>
          <p className="text-sm text-gray-500 mt-1">{viewMode === "month" ? "This month" : "This week"}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Plane className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Vacations</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(viewMode === "month" ? monthSchedule : mySchedule).filter((s) => s.shift === "vacation").length}
          </p>
          <p className="text-sm text-gray-500 mt-1">{viewMode === "month" ? "This month" : "This week"}</p>
        </div>
      </div>

      {/* Schedule Change Request Modal */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Schedule Change</h2>
            <p className="text-sm text-gray-600 mb-6">
              Date: <span className="font-semibold text-gray-900">{selectedDate}</span>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowChangeRequestModal(false);
                setSelectedDate(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Shift
                </label>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600">
                  {selectedDate && getShiftDisplay(getShiftForDate(selectedDate)).label}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requested Change To
                </label>
                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select new shift...</option>
                  <option value="day">Day Shift (8AM-8PM)</option>
                  <option value="night">Night Shift (8PM-8AM)</option>
                  <option value="off">Off Day</option>
                  <option value="swap">Swap with another employee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Change Request
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please explain why you need this schedule change..."
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Your request will be sent to your team leader for approval.
                  You will be notified once it's reviewed.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangeRequestModal(false);
                    setSelectedDate(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
