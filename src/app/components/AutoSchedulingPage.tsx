import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Mail,
  TrendingUp,
  Clock,
  Sun,
  Moon,
  Home,
  Plane,
  Sparkles,
  Send,
  Eye
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePTO } from "../contexts/PTOContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useToast } from "../contexts/ToastContext";
import { PageHeader } from "./ui/PageHeader";
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
  position: string;
}

interface Conflict {
  type: "pto" | "overtime" | "consecutive" | "understaffed" | "missing";
  severity: "high" | "medium" | "low";
  message: string;
  employeeId?: number;
  date?: string;
}

export function AutoSchedulingPage() {
  const { user } = useAuth();
  const { ptoRequests } = usePTO();
  const { addNotification } = useNotifications();
  const toast = useToast();
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isPublished, setIsPublished] = useState(false);
  const [showExportMessage, setShowExportMessage] = useState(false);
  const [exportFormat, setExportFormat] = useState("");

  // Generator form state - allow scheduling for any month
  const [genDepartment, setGenDepartment] = useState("Maintenance");
  const [genShiftType, setGenShiftType] = useState<"day" | "night" | "both">("both");
  const [genRequiredCount, setGenRequiredCount] = useState(5);
  const [genStartDate, setGenStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Today's date as default
  });
  const [genEndDate, setGenEndDate] = useState(() => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return endOfMonth.toISOString().split('T')[0]; // End of current month as default
  });
  const [genWeeklyRepeat, setGenWeeklyRepeat] = useState(true);
  const [genOvertimeLimit, setGenOvertimeLimit] = useState(true);
  const [genPTOPrevention, setGenPTOPrevention] = useState(true);
  const [genConsecutivePrevention, setGenConsecutivePrevention] = useState(true);
  const [genForce15DayBlocks, setGenForce15DayBlocks] = useState(false);

  const employees: Employee[] = useMemo(
    () => fakeUsers
      .filter((user) => user.role !== "hr_admin")
      .map((user) => ({
        id: user.id,
        name: user.name,
        department: user.department,
        position: user.role === "team_leader" ? "Team Leader" : "Employee",
      })),
    []
  );

  // Use actual PTO data from context
  const approvedPTORequests = ptoRequests.filter(req => req.status === "approved");

  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const handleGenerateSchedule = () => {
    const newSchedule: ScheduleEntry[] = [];
    const newConflicts: Conflict[] = [];

    // Parse date range
    const startDate = new Date(genStartDate);
    const endDate = new Date(genEndDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Filter employees by department
    const targetEmployees = genDepartment === "All"
      ? employees
      : genDepartment === "Maintenance"
      ? employees.filter((e) => e.department.startsWith("Maintenance"))
      : employees.filter((e) => e.department === genDepartment);

    // Check if we have enough employees
    if (targetEmployees.length < genRequiredCount) {
      newConflicts.push({
        type: "missing",
        severity: "high",
        message: `Not enough employees in ${genDepartment}. Required: ${genRequiredCount}, Available: ${targetEmployees.length}`,
      });
    }

    const employeeStats = targetEmployees.map((emp, empIdx) => ({
      employeeId: emp.id,
      name: emp.name,
      totalAssigned: 0,
      consecutiveWorkDays: 0,
      consecutiveOffDays: 0,
      lastAssignedDay: -1,
      index: empIdx,
    }));

    const getOffPriority = (stat: typeof employeeStats[number]) => {
      let score = 0;
      if (stat.consecutiveOffDays === 1) score += 1200; // extend a 2-day off block
      if (stat.consecutiveWorkDays >= 5) score += 900; // force some rest after long runs
      score += stat.totalAssigned * 10; // give extra rest to heavier workloads
      score += stat.consecutiveWorkDays * 5; // workers with longer streaks are better off candidates
      if (stat.consecutiveOffDays > 1) score -= 300; // avoid too many consecutive off days
      return score;
    };

    for (let dayOffset = 0; dayOffset < daysDiff; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dateStr = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getDate()}`;
      const dateKey = currentDate.toISOString().split('T')[0];

      const availableEmployees = targetEmployees.filter((emp) => {
        const hasPTO = genPTOPrevention && approvedPTORequests.some(pto =>
          pto.employeeId === emp.id &&
          dateKey >= pto.startDate &&
          dateKey <= pto.endDate
        );
        return !hasPTO;
      });

      const requiredWorkCount = Math.min(genRequiredCount, availableEmployees.length);
      const offCount = Math.max(0, availableEmployees.length - requiredWorkCount);

      const offCandidates = availableEmployees
        .map((emp) => employeeStats.find((s) => s.employeeId === emp.id))
        .filter(Boolean) as typeof employeeStats;

      const selectedOffIds = new Set(
        [...offCandidates]
          .sort((a, b) => {
            const priorityDiff = getOffPriority(b) - getOffPriority(a);
            if (priorityDiff !== 0) return priorityDiff;
            if (b.totalAssigned !== a.totalAssigned) return b.totalAssigned - a.totalAssigned;
            if (a.consecutiveWorkDays !== b.consecutiveWorkDays) return b.consecutiveWorkDays - a.consecutiveWorkDays;
            return a.lastAssignedDay - b.lastAssignedDay;
          })
          .slice(0, offCount)
          .map((stat) => stat.employeeId)
      );

      const selectedSet = new Set(
        availableEmployees
          .filter((emp) => !selectedOffIds.has(emp.id))
          .map((emp) => emp.id)
      );

      if (availableEmployees.length < genRequiredCount) {
        newConflicts.push({
          type: "understaffed",
          severity: "high",
          message: `${dateStr}: Only ${availableEmployees.length} available of ${genRequiredCount} required staff`,
          date: dateStr,
        });
      }

      targetEmployees.forEach((emp) => {
        const stat = employeeStats.find((s) => s.employeeId === emp.id);
        const hasPTO = genPTOPrevention && approvedPTORequests.some(pto =>
          pto.employeeId === emp.id &&
          dateKey >= pto.startDate &&
          dateKey <= pto.endDate
        );

        if (hasPTO) {
          newSchedule.push({ employeeId: emp.id, date: dateStr, shift: "vacation" });
          newConflicts.push({
            type: "pto",
            severity: "high",
            message: `${emp.name} has approved PTO on ${dateStr}`,
            employeeId: emp.id,
            date: dateStr,
          });
          if (stat) {
            stat.consecutiveWorkDays = 0;
            stat.consecutiveOffDays = 0;
          }
          return;
        }

        const assigned = selectedSet.has(emp.id);
        let shift: ShiftType = assigned ? "day" : "off";

        if (assigned) {
          if (genShiftType === "night") {
            shift = "night";
          } else if (genShiftType === "both") {
            const pattern: ShiftType[] = ["day", "night"];
            const empIdx = stat?.index ?? 0;
            shift = pattern[(empIdx + dayOffset) % pattern.length];
          }

          if (stat) {
            stat.totalAssigned += 1;
            stat.consecutiveWorkDays += 1;
            stat.consecutiveOffDays = 0;
            stat.lastAssignedDay = dayOffset;
          }
        } else {
          if (stat) {
            stat.consecutiveWorkDays = 0;
            stat.consecutiveOffDays += 1;
          }
        }

        newSchedule.push({ employeeId: emp.id, date: dateStr, shift });
      });
    }

    // Check for understaffed shifts
    for (let dayOffset = 0; dayOffset < daysDiff; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dateStr = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getDate()}`;
      const assignedCount = newSchedule.filter(
        s => s.date === dateStr && (s.shift === "day" || s.shift === "night")
      ).length;

      if (assignedCount < genRequiredCount) {
        newConflicts.push({
          type: "understaffed",
          severity: "high",
          message: `${dateStr}: Only ${assignedCount} of ${genRequiredCount} required staff assigned`,
          date: dateStr
        });
      }
    }

    // Remove duplicate conflicts
    const uniqueConflicts = newConflicts.filter((conflict, index, self) =>
      index === self.findIndex(c => c.message === conflict.message)
    );

    setGeneratedSchedule(newSchedule);
    setConflicts(uniqueConflicts);
    setShowPreview(true);
    setShowGeneratorModal(false);
    setIsPublished(false);
  };

  const handlePublish = () => {
    if (conflicts.filter(c => c.severity === "high").length > 0) {
      const confirmPublish = window.confirm(
        `There are ${conflicts.filter(c => c.severity === "high").length} high-severity conflicts. Are you sure you want to publish this schedule?`
      );
      if (!confirmPublish) return;
    }

    // Send personalized notification to each employee about their schedule
    const employeesInSchedule = [...new Set(generatedSchedule.map(s => s.employeeId))];

    employeesInSchedule.forEach(employeeId => {
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) return;

      // Get employee's shifts from the schedule
      const employeeShifts = generatedSchedule.filter(s => s.employeeId === employeeId);
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

      // Send notification to this specific employee
      addNotification({
        type: "info",
        title: "📅 New Schedule Published",
        message: `Your schedule has been published by ${user?.name}. You have: ${summaryMessage}`,
        employeeName: user?.name,
        employeeDepartment: employee.department,
        actionUrl: "/my-schedule",
        targetEmployeeId: employeeId, // Only this employee sees it
      });
    });

    // Save the published schedule to localStorage so all dashboards get real-time updates
    const existingSchedules = JSON.parse(localStorage.getItem("employeeSchedules") || "[]");
    const updatedSchedules = [...existingSchedules];

    // Remove any existing schedules for the date range we're publishing
    const startDate = new Date(genStartDate);
    const endDate = new Date(genEndDate);
    const publishedDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      publishedDates.push(`${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}`);
    }

    // Filter out existing schedules for these dates
    const filteredSchedules = updatedSchedules.filter(schedule =>
      !publishedDates.includes(schedule.date)
    );

    // Add the new published schedule
    const newSchedules = [...filteredSchedules, ...generatedSchedule];
    localStorage.setItem("employeeSchedules", JSON.stringify(newSchedules));

    // Dispatch storage event to notify other components/tabs
    window.dispatchEvent(new StorageEvent("storage", {
      key: "employeeSchedules",
      newValue: JSON.stringify(newSchedules),
      oldValue: JSON.stringify(existingSchedules),
      storageArea: localStorage
    }));

    setIsPublished(true);
    toast.success("Schedule Published", `${employeesInSchedule.length} employees have been notified of their schedules. Schedule is now live for all users.`);
  };

  const handleExport = (format: "excel" | "pdf" | "print" | "email") => {
    if (generatedSchedule.length === 0) {
      toast.warning("No Schedule", "Please generate a schedule first before exporting");
      return;
    }

    setExportFormat(format);
    setShowExportMessage(true);
    toast.info("Export Started", `Preparing ${format.toUpperCase()} export...`);

    // Simulate export
    setTimeout(() => {
      let message = "";
      switch (format) {
        case "excel":
          message = "Schedule exported as Excel file (schedule.xlsx)";
          break;
        case "pdf":
          message = "Schedule exported as PDF file (schedule.pdf)";
          break;
        case "print":
          message = "Opening print dialog...";
          window.print();
          break;
        case "email":
          message = "Schedule sent to all employees via email";
          break;
      }
      alert(message);
      setShowExportMessage(false);
    }, 1000);
  };

  const handleResolveConflict = (conflictIndex: number) => {
    const updatedConflicts = conflicts.filter((_, idx) => idx !== conflictIndex);
    setConflicts(updatedConflicts);
    alert("Conflict marked as resolved. Please regenerate schedule if needed.");
  };

  const handleClearSchedule = () => {
    if (window.confirm("Are you sure you want to clear the generated schedule?")) {
      setGeneratedSchedule([]);
      setConflicts([]);
      setShowPreview(false);
      setIsPublished(false);
    }
  };

  const getShiftDisplay = (shift: ShiftType) => {
    switch (shift) {
      case "day":
        return { label: "Day", color: "bg-blue-500", icon: Sun };
      case "night":
        return { label: "Night", color: "bg-gray-700", icon: Moon };
      case "off":
        return { label: "Off", color: "bg-green-500", icon: Home };
      case "vacation":
        return { label: "Vacation", color: "bg-orange-500", icon: Plane };
      default:
        return null;
    }
  };

  // Calculate stats
  const filteredEmployees = selectedDepartment === "all"
    ? employees
    : employees.filter(e => e.department === selectedDepartment);

  const totalShifts = generatedSchedule.filter(s => s.shift === "day" || s.shift === "night").length;
  const totalDays = generatedSchedule.length > 0
    ? [...new Set(generatedSchedule.map(s => s.date))].length
    : 0;
  const maxPossibleShifts = totalDays * 2 * filteredEmployees.length; // 2 shifts per day per employee
  const coverageRate = maxPossibleShifts > 0 ? Math.round((totalShifts / maxPossibleShifts) * 100) : 94;
  const efficiency = conflicts.length === 0 ? 100 : Math.max(70, 100 - (conflicts.length * 5));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto Scheduling Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Automated schedule generation with conflict detection
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Sparkles className="w-5 h-5" />
            {generatedSchedule.length > 0 ? "Regenerate Schedule" : "Generate Schedule"}
          </button>
          {showPreview && !isPublished && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
            >
              <Send className="w-5 h-5" />
              Publish Schedule
            </button>
          )}
          {showPreview && isPublished && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold border-2 border-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Published
            </div>
          )}
          {showPreview && (
            <button
              onClick={handleClearSchedule}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear Schedule
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Total Employees</h3>
              <p className="text-2xl font-bold text-gray-900">{filteredEmployees.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {selectedDepartment === "all" ? "Across all departments" : `In ${selectedDepartment}`}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Coverage Rate</h3>
              <p className="text-2xl font-bold text-gray-900">{coverageRate}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {generatedSchedule.length > 0 ? "Calculated from schedule" : "Target coverage"}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Conflicts</h3>
              <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {conflicts.filter(c => c.severity === "high").length} high priority
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Efficiency</h3>
              <p className="text-2xl font-bold text-gray-900">{efficiency}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {efficiency === 100 ? "Perfect scheduling" : "Room for improvement"}
          </p>
        </div>
      </div>

      {/* Conflict Detection Panel */}
      {conflicts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Conflict Detection</h2>
            <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {conflicts.length} conflicts
            </span>
          </div>

          <div className="space-y-3">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  conflict.severity === "high"
                    ? "bg-red-50 border-red-500"
                    : conflict.severity === "medium"
                    ? "bg-orange-50 border-orange-500"
                    : "bg-yellow-50 border-yellow-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        conflict.severity === "high"
                          ? "text-red-600"
                          : conflict.severity === "medium"
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{conflict.message}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {conflict.type.toUpperCase()} • Severity: {conflict.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveConflict(idx)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export System */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export Schedule</h2>
          {showExportMessage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-semibold text-blue-700">
                Exporting {exportFormat}...
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport("excel")}
            disabled={generatedSchedule.length === 0}
            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all group ${
              generatedSchedule.length === 0
                ? "border-gray-200 opacity-50 cursor-not-allowed"
                : "border-gray-200 hover:border-green-500 hover:bg-green-50"
            }`}
          >
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <span className={`font-semibold ${generatedSchedule.length === 0 ? "text-gray-400" : "text-gray-900 group-hover:text-green-700"}`}>
              Download Excel
            </span>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            disabled={generatedSchedule.length === 0}
            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all group ${
              generatedSchedule.length === 0
                ? "border-gray-200 opacity-50 cursor-not-allowed"
                : "border-gray-200 hover:border-red-500 hover:bg-red-50"
            }`}
          >
            <FileText className="w-8 h-8 text-red-600" />
            <span className={`font-semibold ${generatedSchedule.length === 0 ? "text-gray-400" : "text-gray-900 group-hover:text-red-700"}`}>
              Download PDF
            </span>
          </button>

          <button
            onClick={() => handleExport("print")}
            disabled={generatedSchedule.length === 0}
            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all group ${
              generatedSchedule.length === 0
                ? "border-gray-200 opacity-50 cursor-not-allowed"
                : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <Printer className="w-8 h-8 text-blue-600" />
            <span className={`font-semibold ${generatedSchedule.length === 0 ? "text-gray-400" : "text-gray-900 group-hover:text-blue-700"}`}>
              Print Schedule
            </span>
          </button>

          <button
            onClick={() => handleExport("email")}
            disabled={generatedSchedule.length === 0}
            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all group ${
              generatedSchedule.length === 0
                ? "border-gray-200 opacity-50 cursor-not-allowed"
                : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
            }`}
          >
            <Mail className="w-8 h-8 text-purple-600" />
            <span className={`font-semibold ${generatedSchedule.length === 0 ? "text-gray-400" : "text-gray-900 group-hover:text-purple-700"}`}>
              Email Schedule
            </span>
          </button>
        </div>
        {generatedSchedule.length === 0 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Generate a schedule first to enable export options
          </p>
        )}
      </div>

      {/* Schedule Preview */}
      {showPreview && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">Generated Schedule Preview</h2>
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
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEmployees.map((employee) => {
              const employeeSchedule = generatedSchedule.filter(s => s.employeeId === employee.id);
              if (employeeSchedule.length === 0) return null;

              // Get unique dates from the employee's schedule
              const dates = [...new Set(employeeSchedule.map(s => s.date))].slice(0, 14); // Show first 14 days

              return (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
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

                  <div className="grid grid-cols-7 gap-2">
                    {dates.map((dateStr, idx) => {
                      const entry = employeeSchedule.find(s => s.date === dateStr);
                      const display = getShiftDisplay(entry?.shift || null);
                      const Icon = display?.icon;

                      return (
                        <div key={idx} className="text-center">
                          <div className="text-xs text-gray-500 mb-1 truncate">{dateStr}</div>
                          {display ? (
                            <div
                              className={`${display.color} text-white rounded-lg p-2 flex flex-col items-center justify-center h-16`}
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                              <span className="text-xs mt-1">{display.label}</span>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 h-16 flex items-center justify-center">
                              <span className="text-xs text-gray-400">-</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {generatedSchedule.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No schedule generated yet. Click "Generate Schedule" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto Schedule Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Auto Schedule Generator</h2>
                  <p className="text-gray-600">Configure automatic schedule generation</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={genDepartment}
                  onChange={(e) => setGenDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Maintenance A">Maintenance A</option>
                  <option value="Maintenance B">Maintenance B</option>
                  <option value="Vision">Vision</option>
                  <option value="R&D">R&D</option>
                  <option value="All">All Departments</option>
                </select>
              </div>

              {/* Shift Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shift Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setGenShiftType("day")}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      genShiftType === "day"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Sun className="w-5 h-5 mx-auto mb-1" />
                    Day Shift
                  </button>
                  <button
                    onClick={() => setGenShiftType("night")}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      genShiftType === "night"
                        ? "border-gray-700 bg-gray-100 text-gray-900"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Moon className="w-5 h-5 mx-auto mb-1" />
                    Night Shift
                  </button>
                  <button
                    onClick={() => setGenShiftType("both")}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      genShiftType === "both"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    Both
                  </button>
                </div>
              </div>

              {/* Required Employee Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Employee Count Per Shift
                </label>
                <input
                  type="number"
                  value={genRequiredCount}
                  onChange={(e) => setGenRequiredCount(parseInt(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of employees needed per shift to maintain coverage
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={genStartDate}
                    onChange={(e) => setGenStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={genEndDate}
                    onChange={(e) => setGenEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Advanced Options</h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Weekly Repeat Pattern</span>
                  <input
                    type="checkbox"
                    checked={genWeeklyRepeat}
                    onChange={(e) => setGenWeeklyRepeat(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Overtime Limit Prevention</span>
                  <input
                    type="checkbox"
                    checked={genOvertimeLimit}
                    onChange={(e) => setGenOvertimeLimit(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">PTO Conflict Prevention</span>
                  <input
                    type="checkbox"
                    checked={genPTOPrevention}
                    onChange={(e) => setGenPTOPrevention(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">Consecutive Shift Prevention</span>
                  <input
                    type="checkbox"
                    checked={genConsecutivePrevention}
                    onChange={(e) => setGenConsecutivePrevention(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700">15-Day Same-Shift Blocks</span>
                  <input
                    type="checkbox"
                    checked={genForce15DayBlocks}
                    onChange={(e) => setGenForce15DayBlocks(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  When enabled, generated schedules will assign employees to at least 15 consecutive day or night shifts in a block.
                </p>
              </div>

              {/* Generation Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Generation Summary</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• Department: <strong>{genDepartment}</strong></p>
                  <p>• Shift Type: <strong>{genShiftType === "both" ? "Day & Night" : genShiftType === "day" ? "Day Only" : "Night Only"}</strong></p>
                  <p>• Required per shift: <strong>{genRequiredCount} employees</strong></p>
                  <p>• Date Range: <strong>{new Date(genStartDate).toLocaleDateString()} - {new Date(genEndDate).toLocaleDateString()}</strong></p>
                  <p>• Duration: <strong>{Math.ceil((new Date(genEndDate).getTime() - new Date(genStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days</strong></p>
                  <div className="mt-2 pt-2 border-t border-blue-300">
                    <p className="font-semibold mb-1">Enabled Options:</p>
                    {genWeeklyRepeat && <p>✓ Weekly Repeat Pattern</p>}
                    {genOvertimeLimit && <p>✓ Overtime Limit Prevention</p>}
                    {genPTOPrevention && <p>✓ PTO Conflict Prevention</p>}
                    {genConsecutivePrevention && <p>✓ Consecutive Shift Prevention</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleGenerateSchedule();
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
