import { useState } from "react";
import { Clock, Play, Square, CheckCircle, AlertCircle, Edit2, Save, Send, FileSpreadsheet } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function TimesheetManagement() {
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableHours, setEditableHours] = useState<{ [key: string]: number }>({});
  const [showExportModal, setShowExportModal] = useState(false);

  const [currentWeek, setCurrentWeek] = useState([
    { day: "Monday", date: "May 5", hours: 8, status: "approved" },
    { day: "Tuesday", date: "May 6", hours: 8.5, status: "approved" },
    { day: "Wednesday", date: "May 7", hours: 8, status: "approved" },
    { day: "Thursday", date: "May 8", hours: 7.5, status: "approved" },
    { day: "Friday", date: "May 9", hours: 6.5, status: "pending" },
    { day: "Saturday", date: "May 10", hours: 0, status: "not_worked" },
    { day: "Sunday", date: "May 11", hours: 0, status: "not_worked" },
  ]);

  const handleEditHours = (date: string, newHours: number) => {
    setEditableHours({ ...editableHours, [date]: newHours });
  };

  const handleSaveTimesheet = () => {
    // Apply edited hours to the current week
    const updatedWeek = currentWeek.map((day) => {
      if (editableHours[day.date] !== undefined) {
        return { ...day, hours: editableHours[day.date], status: "pending" };
      }
      return day;
    });
    setCurrentWeek(updatedWeek);
    setIsEditing(false);
    setEditableHours({});
    // In real app, this would submit to backend for team leader approval
  };

  const canEdit = user?.role === "employee";
  const isTeamLeader = user?.role === "team_leader";

  const approvedTimesheets = currentWeek.filter(day => day.status === "approved");
  const hasApprovedTimesheets = approvedTimesheets.length > 0;

  const handleExportToHR = () => {
    // In real app, this would send data to backend/HR system
    setShowExportModal(true);
    setTimeout(() => setShowExportModal(false), 3000);
  };

  const weekSummary = {
    regular: 38.5,
    overtime: 0,
    total: 38.5,
    target: 40,
  };

  const recentEntries = [
    {
      date: "May 9, 2026",
      clockIn: "8:00 AM",
      clockOut: "2:30 PM",
      break: "30 min",
      total: "6.5 hrs",
      status: "pending",
    },
    {
      date: "May 8, 2026",
      clockIn: "8:00 AM",
      clockOut: "4:00 PM",
      break: "30 min",
      total: "7.5 hrs",
      status: "approved",
    },
    {
      date: "May 7, 2026",
      clockIn: "8:00 AM",
      clockOut: "5:00 PM",
      break: "60 min",
      total: "8.0 hrs",
      status: "approved",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
          <p className="text-gray-600 mt-1">
            {isTeamLeader ? "Review and approve team timesheets" : "Track your hours and manage your timesheet"}
          </p>
          {canEdit && (
            <p className="text-sm text-gray-500 mt-1">
              You can modify your hours - changes require team leader approval
            </p>
          )}
          {isTeamLeader && (
            <p className="text-sm text-gray-500 mt-1">
              Export approved timesheets to HR for payroll processing
            </p>
          )}
        </div>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Edit2 className="w-5 h-5" />
            Edit Timesheet
          </button>
        )}
        {canEdit && isEditing && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditableHours({});
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTimesheet}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
            >
              <Save className="w-5 h-5" />
              Save & Submit for Approval
            </button>
          </div>
        )}
        {isTeamLeader && hasApprovedTimesheets && (
          <button
            onClick={handleExportToHR}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export to HR for Payroll
          </button>
        )}
      </div>

      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Editing Mode Active</h3>
            <p className="text-sm text-yellow-700">
              You can now modify your hours. Click on any hours field to edit. Changes will be sent to your team leader for approval.
              Approved hours cannot be edited.
            </p>
          </div>
        </div>
      )}

      {/* Clock In/Out Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current Status</h2>
            <p className="text-blue-100">
              {isClockedIn ? "You are currently clocked in" : "You are currently clocked out"}
            </p>
            {isClockedIn && (
              <p className="text-blue-100 mt-2">Time elapsed: 3h 24m</p>
            )}
          </div>
          <button
            onClick={() => setIsClockedIn(!isClockedIn)}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
              isClockedIn
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-6 h-6" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Total Hours</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{weekSummary.total}</p>
          <p className="text-sm text-gray-500 mt-1">This week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Regular</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{weekSummary.regular}</p>
          <p className="text-sm text-gray-500 mt-1">Standard hours</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-700">Overtime</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{weekSummary.overtime}</p>
          <p className="text-sm text-gray-500 mt-1">Extra hours</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-700">Remaining</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{weekSummary.target - weekSummary.total}</p>
          <p className="text-sm text-gray-500 mt-1">To reach target</p>
        </div>
      </div>

      {/* Weekly Timesheet */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">This Week</h2>
          <p className="text-sm text-gray-500 mt-1">May 5 - May 11, 2026</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentWeek.map((entry) => {
                const isApproved = entry.status === "approved";
                const canEditThisRow = isEditing && !isApproved;
                const displayHours = editableHours[entry.date] !== undefined
                  ? editableHours[entry.date]
                  : entry.hours;

                return (
                  <tr key={entry.day} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {entry.day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entry.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {canEditThisRow ? (
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={displayHours}
                          onChange={(e) => handleEditHours(entry.date, parseFloat(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        />
                      ) : (
                        <span>{entry.hours} hrs</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : entry.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {entry.status === "approved" && <CheckCircle className="w-3 h-3" />}
                        {entry.status === "pending" && <Clock className="w-3 h-3" />}
                        {entry.status === "approved"
                          ? "Approved"
                          : entry.status === "pending"
                          ? "Pending Approval"
                          : "Not Worked"}
                      </span>
                      {isApproved && isEditing && (
                        <p className="text-xs text-gray-500 mt-1">Cannot edit approved hours</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Break
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.clockIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.clockOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {entry.break}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {entry.status === "approved" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {entry.status === "approved" ? "Approved" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Success Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Successful!</h2>
              <p className="text-gray-600 mb-4">
                {approvedTimesheets.length} approved timesheet{approvedTimesheets.length !== 1 ? 's' : ''} sent to HR for payroll processing.
              </p>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
