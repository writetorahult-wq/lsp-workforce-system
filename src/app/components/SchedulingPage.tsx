import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, Filter, Send, Users, Sun, Moon, Home, Plane, FileSpreadsheet, FileText, Printer, Mail, Download, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useToast } from "../contexts/ToastContext";
import { PageHeader } from "./ui/PageHeader";
import { useEmployees } from "../contexts/EmployeeContext";

type ShiftType = "day" | "night" | "off" | "vacation" | null;

interface ScheduleEntry {
  employeeId: number;
  date: string;
  shift: ShiftType;
}

export function SchedulingPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const departments = [
    "All Departments",
    "Maintenance",
    "Maintenance A",
    "Maintenance B",
    "Vision",
    "R&D",
    "Manufacturing",
    "Executive",
  ];

  const { employees } = useEmployees();

  const schedulingEmployees = useMemo(
    () => employees
      .filter((user) => user.role !== "hr_admin")
      .map((user) => ({
        id: user.id,
        name: user.name,
        department: user.department,
        position: user.role === "team_leader" ? "Team Leader" : "Employee",
        team: user.team || "",
      })),
    [employees]
  );

  const getTeamRotationShift = (
    employee: { department: string; team?: string },
    dayIndex: number
  ): ShiftType => {
    if (!employee.team || !employee.department.startsWith("Maintenance")) {
      return null;
    }

    const weekIndex = Math.floor(dayIndex / 7);

    if (employee.team === "A") {
      return weekIndex % 2 === 0 ? "night" : "day";
    }

    if (employee.team === "B") {
      return weekIndex % 2 === 0 ? "day" : "night";
    }

    return null;
  };

  const getTeamShiftForDate = (employeeId: number, date: string): ShiftType => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee || !employee.department.startsWith("Maintenance")) {
      return null;
    }

    const day = parseInt(date.split(" ")[1], 10);
    if (Number.isNaN(day)) {
      return null;
    }

    const weekIndex = Math.floor((day - 1) / 7);
    if (employee.team === "A") {
      return weekIndex % 2 === 0 ? "night" : "day";
    }

    if (employee.team === "B") {
      return weekIndex % 2 === 0 ? "day" : "night";
    }

    return null;
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];

  // Generate month dates for calendar view
  const generateMonthDates = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const monthName = months[month];
      monthDates.push(`${monthName} ${day}`);
    }

    return monthDates;
  };

  const monthDates = generateMonthDates();

  const getMonthCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number | null; dateStr: string | null }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateStr: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const monthName = months[month];
      const dateStr = `${monthName} ${day}`;
      days.push({ date: day, dateStr: dateStr });
    }

    return days;
  };

  const defaultSchedule: ScheduleEntry[] = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const scheduleDates: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      scheduleDates.push(`${months[month]} ${day}`);
    }

    const shiftPattern: ShiftType[] = ["day", "night", "off", "day", "vacation", "day", "night"];

    return schedulingEmployees
      .flatMap((employee, employeeIndex) =>
        scheduleDates.map((date, dayIndex) => ({
          employeeId: employee.id,
          date,
          shift:
            getTeamRotationShift(employee, dayIndex) ??
            shiftPattern[(employeeIndex + dayIndex) % shiftPattern.length],
        }))
      );
  }, [selectedMonth]);

const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
  const saved = localStorage.getItem("employeeSchedules");

  return saved ? JSON.parse(saved) : defaultSchedule;
});

useEffect(() => {
  const interval = setInterval(() => {
    const saved = localStorage.getItem("employeeSchedules");

    if (saved) {
      setSchedule(JSON.parse(saved));
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

const getShiftForEmployee = (
  employeeId: number,
  date: string
): ShiftType => {
  const entry = schedule.find(
    (s) => s.employeeId === employeeId && s.date === date
  );

  return entry?.shift ?? getTeamShiftForDate(employeeId, date);
};

const setShiftForEmployee = (
  employeeId: number,
  date: string,
  shift: ShiftType
) => {
  setSchedule((prev) => {
    console.log("Updating Shift", employeeId, date, shift);

    const filtered = prev.filter(
      (s) => !(s.employeeId === employeeId && s.date === date)
    );

    const updated = shift
      ? [...filtered, { employeeId, date, shift }]
      : filtered;

    // Save immediately
    localStorage.setItem(
      "employeeSchedules",
      JSON.stringify(updated)
    );

    // Notify other pages/components
    window.dispatchEvent(new Event("storage"));

    return updated;
  });
};

  const applyMaintenanceRotation = () => {
    const rotationEntries: ScheduleEntry[] = [];

    monthDates.forEach((date, dayIndex) => {
      schedulingEmployees
        .filter((user) => user.department.startsWith("Maintenance"))
        .forEach((employee) => {
          const shift = getTeamRotationShift(employee, dayIndex);
          if (shift) {
            rotationEntries.push({
              employeeId: employee.id,
              date,
              shift,
            });
          }
        });
    });

    const preservedEntries = schedule.filter((entry) => {
      const employee = employees.find((emp) => emp.id === entry.employeeId);
      return employee ? !employee.department.startsWith("Maintenance") : true;
    });

    const updatedSchedule = [...preservedEntries, ...rotationEntries];
    setSchedule(updatedSchedule);
    localStorage.setItem("employeeSchedules", JSON.stringify(updatedSchedule));
    window.dispatchEvent(new Event("storage"));
    toast.success("Rotation Applied", "Maintenance A/B team shifts have been updated with the current team rotation template.");
  };

  const getShiftDisplay = (shift: ShiftType) => {
    switch (shift) {
      case "day":
        return { label: "Day", color: "bg-blue-500", textColor: "text-white", icon: Sun, time: "8AM-8PM" };
      case "night":
        return { label: "Night", color: "bg-gray-700", textColor: "text-white", icon: Moon, time: "8PM-8AM" };
      case "off":
        return { label: "Off", color: "bg-green-500", textColor: "text-white", icon: Home, time: "" };
      case "vacation":
        return { label: "Vacation", color: "bg-orange-500", textColor: "text-white", icon: Plane, time: "" };
      default:
        return null;
    }
  };

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : selectedDepartment === "Maintenance"
      ? employees.filter((e) => e.department.startsWith("Maintenance"))
      : employees.filter((e) => e.department === selectedDepartment);

  const ShiftCell = ({ employeeId, date }: { employeeId: number; date: string }) => {
    const shift = getShiftForEmployee(employeeId, date);
    const display = getShiftDisplay(shift);
    const isHistoryMode = showHistory;

    return (
      <div className="relative group">
        {display ? (
          <div
            className={`${display.color} ${display.textColor} rounded-lg p-3 text-center ${!isHistoryMode ? 'cursor-pointer hover:shadow-lg' : ''} transition-all`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              {display.icon && <display.icon className="w-4 h-4" />}
              <span className="font-semibold text-sm">{display.label}</span>
            </div>
            {display.time && <span className="text-xs opacity-90">{display.time}</span>}
          </div>
        ) : (
          <div className={`border-2 border-dashed border-gray-200 rounded-lg p-3 text-center ${!isHistoryMode ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer' : ''} transition-all`}>
            <span className="text-xs text-gray-400">-</span>
          </div>
        )}

        {/* Quick assign dropdown - only show in current mode */}
        {!isHistoryMode && (
          <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
            <button
              onClick={() => setShiftForEmployee(employeeId, date, "day")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
            >
              <Sun className="w-4 h-4 text-blue-600" />
              <span>Day Shift</span>
            </button>
            <button
              onClick={() => setShiftForEmployee(employeeId, date, "night")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100"
            >
              <Moon className="w-4 h-4 text-gray-700" />
              <span>Night Shift</span>
            </button>
            <button
              onClick={() => setShiftForEmployee(employeeId, date, "off")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2 border-b border-gray-100"
            >
              <Home className="w-4 h-4 text-green-600" />
              <span>Off Day</span>
            </button>
            <button
              onClick={() => setShiftForEmployee(employeeId, date, "vacation")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-2 border-b border-gray-100"
            >
              <Plane className="w-4 h-4 text-orange-600" />
              <span>Vacation</span>
            </button>
            <button
              onClick={() => setShiftForEmployee(employeeId, date, null)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleExport = (format: "excel" | "pdf" | "print" | "email") => {
    toast.success("Export Started", `Exporting schedule as ${format.toUpperCase()}...`);
  };

  const handlePublishSchedule = () => {
    // Get unique employees from current schedule
    const employeesInSchedule = [...new Set(schedule.map(s => s.employeeId))];

    // Persist the published schedule so all dashboards update.
    const oldValue = localStorage.getItem("employeeSchedules");
    localStorage.setItem("employeeSchedules", JSON.stringify(schedule));

    // Dispatch storage event to notify other components/tabs
    window.dispatchEvent(new StorageEvent("storage", {
      key: "employeeSchedules",
      newValue: JSON.stringify(schedule),
      oldValue: oldValue,
      storageArea: localStorage
    }));

    // Send personalized notification to each employee
    employeesInSchedule.forEach(employeeId => {
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;

      // Get employee's shifts from the schedule (based on current view mode)
      const relevantDates = viewMode === "month" ? monthDates : dates;
      const employeeShifts = schedule.filter(
        s => s.employeeId === employeeId && relevantDates.includes(s.date)
      );

      const dayShifts = employeeShifts.filter(s => s.shift === "day").length;
      const nightShifts = employeeShifts.filter(s => s.shift === "night").length;
      const offDays = employeeShifts.filter(s => s.shift === "off").length;
      const vacationDays = employeeShifts.filter(s => s.shift === "vacation").length;

      // Create summary message
      let scheduleDetails = [];
      if (dayShifts > 0) scheduleDetails.push(`${dayShifts} day shift${dayShifts > 1 ? 's' : ''}`);
      if (nightShifts > 0) scheduleDetails.push(`${nightShifts} night shift${nightShifts > 1 ? 's' : ''}`);
      if (offDays > 0) scheduleDetails.push(`${offDays} day${offDays > 1 ? 's' : ''} off`);
      if (vacationDays > 0) scheduleDetails.push(`${vacationDays} vacation day${vacationDays > 1 ? 's' : ''}`);

      const summaryMessage = scheduleDetails.length > 0
        ? scheduleDetails.join(", ")
        : "No shifts assigned";

      const timeframe = viewMode === "month"
        ? `${months[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`
        : `Week of ${dates[0]}`;

      // Send notification to this specific employee
      addNotification({
        type: "info",
        title: "📅 New Schedule Published",
        message: `Your schedule for ${timeframe} has been published by ${user?.name}. You have: ${summaryMessage}`,
        employeeName: user?.name,
        employeeDepartment: employee.department,
        actionUrl: "/my-schedule",
        targetEmployeeId: employeeId, // Only this employee sees it
      });
    });

    toast.success("Schedule Published", `${employeesInSchedule.length} employees have been notified of their schedules`);
  };

  const historyButtonClass = showHistory
    ? "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
    : "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-blue-600 text-blue-600 hover:bg-blue-50";

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Link to="/auto-scheduling" className="flex items-center gap-2 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
          <Sparkles className="w-5 h-5" />
          Auto Schedule
        </Link>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={historyButtonClass}
        >
          <Calendar className="w-5 h-5" />
          {showHistory ? "Current Week" : "View History"}
        </button>
        {!showHistory && (
          <>
            <button
              onClick={applyMaintenanceRotation}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-600/20"
            >
              <Sparkles className="w-5 h-5" />
              Apply Team Rotation
            </button>
            <button
              onClick={handlePublishSchedule}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              <Send className="w-5 h-5" />
              Publish Schedule
            </button>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {viewMode === "month" ? (
              <div className="flex items-center gap-2">
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
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}

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

          <div className="flex items-center gap-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Maintenance A">Maintenance A</option>
              <option value="Maintenance B">Maintenance B</option>
              <option value="Vision">Vision</option>
              <option value="R&D">R&D</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Executive">Executive</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
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

      {/* History Info Banner */}
      {showHistory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Schedule History View</h3>
            <p className="text-sm text-blue-700">
              Viewing past schedules for {months[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}.
              This is read-only mode - you cannot edit historical schedules.
            </p>
          </div>
        </div>
      )}

      {/* Schedule View - Week or Month */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {viewMode === "week" ? (
          /* Week View Table */
          <>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {showHistory ? "Historical Schedule" : "Weekly Schedule"}
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Employee
                    </th>
                    {weekDays.map((day, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]"
                      >
                        <div>{day}</div>
                        <div className="text-gray-500 font-normal mt-1">{dates[idx]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold text-blue-600">
                              {employee.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.department}</p>
                          </div>
                        </div>
                      </td>
                      {dates.map((date) => (
                        <td key={date} className="px-4 py-4">
                          <ShiftCell employeeId={employee.id} date={date} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Month View - Employee Cards with Calendars */
          <div className="space-y-4 p-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Employee Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-semibold text-blue-600">
                    {employee.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.department} - {employee.position}</p>
                </div>
              </div>

              {/* Month Calendar */}
              <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDaysShort.map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-600 text-xs py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthCalendarDays().map((day, idx) => {
                    if (!day.date || !day.dateStr) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const shift = getShiftForEmployee(employee.id, day.dateStr);
                    const display = getShiftDisplay(shift);
                    const Icon = display?.icon;
                    const isHistoryMode = showHistory;

                    return (
                      <div
                        key={idx}
                        className={`aspect-square border rounded ${
                          !isHistoryMode ? "cursor-pointer hover:shadow-md" : "cursor-default"
                        } transition-all ${
                          shift ? "border-gray-300" : "border-gray-200"
                        }`}
                      >
                        <div className="h-full flex flex-col p-1">
                          <div className="text-xs font-semibold text-gray-700 mb-0.5">
                            {day.date}
                          </div>
                          {shift && display && (
                            <div
                              className={`${display.color} ${display.textColor} rounded flex-1 flex flex-col items-center justify-center relative group`}
                            >
                              {Icon && <Icon className="w-3 h-3" />}

                              {/* Quick edit dropdown - only in non-history mode */}
                              {!isHistoryMode && (
                                <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-20 min-w-[120px]">
                                  <button
                                    onClick={() => setShiftForEmployee(employee.id, day.dateStr!, "day")}
                                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-blue-50 flex items-center gap-1 border-b border-gray-100"
                                  >
                                    <Sun className="w-3 h-3 text-blue-600" />
                                    <span>Day</span>
                                  </button>
                                  <button
                                    onClick={() => setShiftForEmployee(employee.id, day.dateStr!, "night")}
                                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-gray-100 flex items-center gap-1 border-b border-gray-100"
                                  >
                                    <Moon className="w-3 h-3 text-gray-700" />
                                    <span>Night</span>
                                  </button>
                                  <button
                                    onClick={() => setShiftForEmployee(employee.id, day.dateStr!, "off")}
                                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-green-50 flex items-center gap-1 border-b border-gray-100"
                                  >
                                    <Home className="w-3 h-3 text-green-600" />
                                    <span>Off</span>
                                  </button>
                                  <button
                                    onClick={() => setShiftForEmployee(employee.id, day.dateStr!, "vacation")}
                                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-orange-50 flex items-center gap-1 border-b border-gray-100"
                                  >
                                    <Plane className="w-3 h-3 text-orange-600" />
                                    <span>Vacation</span>
                                  </button>
                                  <button
                                    onClick={() => setShiftForEmployee(employee.id, day.dateStr!, null)}
                                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-red-50 text-red-600"
                                  >
                                    Clear
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {!shift && !isHistoryMode && (
                            <div className="flex flex-col gap-1 mt-1">
                              <button
                                onClick={() =>
                                  setShiftForEmployee(employee.id, day.dateStr!, "day")
                                }
                                className="bg-blue-500 text-white text-xs rounded px-1 py-1 hover:bg-blue-600"
                              >
                                Day
                              </button>

                              <button
                                onClick={() =>
                                  setShiftForEmployee(employee.id, day.dateStr!, "night")
                                }
                                className="bg-gray-700 text-white text-xs rounded px-1 py-1 hover:bg-gray-800"
                              >
                                Night
                              </button>

                              <button
                                onClick={() =>
                                  setShiftForEmployee(employee.id, day.dateStr!, "off")
                                }
                                className="bg-green-500 text-white text-xs rounded px-1 py-1 hover:bg-green-600"
                              >
                                Off
                              </button>

                              <button
                                onClick={() =>
                                  setShiftForEmployee(employee.id, day.dateStr!, "vacation")
                                }
                                className="bg-orange-500 text-white text-xs rounded px-1 py-1 hover:bg-orange-600"
                              >
                                Vacation
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty row for spacing */}
                <div className="h-4"></div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Day Shifts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {schedule.filter((s) => {
              const validDates = viewMode === "month" ? monthDates : dates;
              return s.shift === "day" && validDates.includes(s.date);
            }).length}
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
            {schedule.filter((s) => {
              const validDates = viewMode === "month" ? monthDates : dates;
              return s.shift === "night" && validDates.includes(s.date);
            }).length}
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
            {schedule.filter((s) => {
              const validDates = viewMode === "month" ? monthDates : dates;
              return s.shift === "off" && validDates.includes(s.date);
            }).length}
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
            {schedule.filter((s) => {
              const validDates = viewMode === "month" ? monthDates : dates;
              return s.shift === "vacation" && validDates.includes(s.date);
            }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">{viewMode === "month" ? "This month" : "This week"}</p>
        </div>
      </div>

      {/* Export System */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Export Schedule</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport("excel")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <span className="font-semibold text-gray-900 group-hover:text-green-700">
              Download Excel
            </span>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
          >
            <FileText className="w-8 h-8 text-red-600" />
            <span className="font-semibold text-gray-900 group-hover:text-red-700">
              Download PDF
            </span>
          </button>

          <button
            onClick={() => handleExport("print")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Printer className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-gray-900 group-hover:text-blue-700">
              Print Schedule
            </span>
          </button>

          <button
            onClick={() => handleExport("email")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <Mail className="w-8 h-8 text-purple-600" />
            <span className="font-semibold text-gray-900 group-hover:text-purple-700">
              Email Schedule
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
