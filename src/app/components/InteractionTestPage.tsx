import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePTO } from "../contexts/PTOContext";
import { useNotifications } from "../contexts/NotificationContext";
import { CheckCircle, XCircle, Bell, Calendar, AlertCircle, Send } from "lucide-react";

export function InteractionTestPage() {
  const { user } = useAuth();
  const { ptoRequests, addPTORequest, approvePTORequest, rejectPTORequest } = usePTO();
  const { notifications, addNotification, unreadCount } = useNotifications();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string, success: boolean) => {
    setTestResults(prev => [...prev, `${success ? "✅" : "❌"} ${message}`]);
  };

  const testPTOSubmission = () => {
    try {
      // Simulate employee submitting PTO
      addPTORequest({
        employeeId: 1,
        employeeName: "Test Employee",
        employeeDepartment: "Maintenance",
        startDate: "2026-06-01",
        endDate: "2026-06-03",
        days: 3,
        type: "Vacation",
        reason: "Test vacation request",
      });

      // Add notification ONLY for Team Leaders and HR Admins
      addNotification({
        type: "pto_request",
        title: "New PTO Request",
        message: "Test Employee has requested 3 day(s) of vacation",
        employeeName: "Test Employee",
        employeeDepartment: "Maintenance",
        actionUrl: "/pto",
        targetRoles: ["team_leader", "hr_admin"], // Only managers see this
      });

      addResult("PTO submission sent - Check if you're Team Leader/HR Admin to see notification", true);
    } catch (error) {
      addResult("PTO submission failed: " + error, false);
    }
  };

  const testApproval = () => {
    try {
      const pendingRequest = ptoRequests.find(r => r.status === "pending");
      if (!pendingRequest) {
        addResult("No pending requests to approve", false);
        return;
      }

      approvePTORequest(pendingRequest.id, user?.name || "Test Manager");

      // Notification ONLY to the specific employee
      addNotification({
        type: "success",
        title: "PTO Request Approved ✓",
        message: `Your vacation request for ${pendingRequest.days} day(s) has been approved by ${user?.name}`,
        employeeName: user?.name,
        actionUrl: "/pto",
        targetEmployeeId: pendingRequest.employeeId, // Only this employee
      });

      addResult("PTO approved - Employee ID " + pendingRequest.employeeId + " will see notification", true);
    } catch (error) {
      addResult("PTO approval failed: " + error, false);
    }
  };

  const testRejection = () => {
    try {
      const pendingRequest = ptoRequests.find(r => r.status === "pending");
      if (!pendingRequest) {
        addResult("No pending requests to reject", false);
        return;
      }

      rejectPTORequest(pendingRequest.id, "Test rejection reason", user?.name || "Test Manager");

      // Notification ONLY to the specific employee
      addNotification({
        type: "error",
        title: "PTO Request Rejected ✗",
        message: `Your vacation request has been rejected by ${user?.name}. Reason: Test rejection reason`,
        employeeName: user?.name,
        actionUrl: "/pto",
        targetEmployeeId: pendingRequest.employeeId, // Only this employee
      });

      addResult("PTO rejected - Employee ID " + pendingRequest.employeeId + " will see notification", true);
    } catch (error) {
      addResult("PTO rejection failed: " + error, false);
    }
  };

  const testNotificationPopup = () => {
    try {
      // This notification will show to everyone (no targeting)
      addNotification({
        type: "pto_request",
        title: "Test Popup Notification",
        message: "This should appear as a popup on the right side of the screen for everyone",
        employeeName: "Test User",
        employeeDepartment: "Test Department",
        actionUrl: "/pto",
      });
      addResult("Popup notification created - Check top right corner (visible to all)", true);
    } catch (error) {
      addResult("Popup notification failed: " + error, false);
    }
  };

  const testMultipleNotifications = () => {
    try {
      // Notification 1 - Only for Team Leader & HR Admin
      setTimeout(() => {
        addNotification({
          type: "pto_request",
          title: "PTO Request 1 (Managers Only)",
          message: "Employee 1 has requested PTO - Only Team Leaders & HR Admins see this",
          employeeName: "Employee 1",
          employeeDepartment: "Maintenance",
          actionUrl: "/pto",
          targetRoles: ["team_leader", "hr_admin"],
        });
      }, 1000);

      // Notification 2 - Only for Employee ID 1
      setTimeout(() => {
        addNotification({
          type: "success",
          title: "Approval Notification (Employee Only)",
          message: "Your PTO was approved - Only Employee ID 1 sees this",
          employeeName: "Manager",
          actionUrl: "/pto",
          targetEmployeeId: 1,
        });
      }, 2000);

      // Notification 3 - For everyone (no targeting)
      setTimeout(() => {
        addNotification({
          type: "info",
          title: "System Announcement (Everyone)",
          message: "This notification is visible to all users",
          actionUrl: "/pto",
        });
      }, 3000);

      addResult("3 notifications will appear over 3 seconds (different targeting)", true);
    } catch (error) {
      addResult("Multiple notifications failed: " + error, false);
    }
  };

  const testSchedulePublish = () => {
    try {
      // Simulate publishing a schedule - send to 3 mock employees
      const mockEmployees = [
        { id: 1, name: "John Doe", dept: "Maintenance" },
        { id: 2, name: "Jane Smith", dept: "Vision" },
        { id: 3, name: "Bob Johnson", dept: "R&D" }
      ];

      mockEmployees.forEach((emp, index) => {
        setTimeout(() => {
          addNotification({
            type: "info",
            title: "📅 New Schedule Published",
            message: `Your schedule has been published by ${user?.name}. You have: 5 day shifts, 2 night shifts, 1 day off`,
            employeeName: user?.name,
            employeeDepartment: emp.dept,
            actionUrl: "/my-schedule",
            targetEmployeeId: emp.id,
          });
        }, index * 500);
      });

      addResult("Schedule published - 3 employees notified (staggered over 1.5 seconds)", true);
    } catch (error) {
      addResult("Schedule publish failed: " + error, false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Interaction Test Page</h1>
        <p className="text-gray-600 mt-1">Test all system interactions and notifications</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">PTO Requests</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{ptoRequests.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {ptoRequests.filter(r => r.status === "pending").length} pending
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Current User</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {user?.role.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testPTOSubmission}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-bold">Test PTO Submission</p>
                <p className="text-sm opacity-90">Submit a test PTO request</p>
              </div>
            </div>
          </button>

          <button
            onClick={testApproval}
            className="px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-bold">Test PTO Approval</p>
                <p className="text-sm opacity-90">Approve a pending request</p>
              </div>
            </div>
          </button>

          <button
            onClick={testRejection}
            className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5" />
              <div>
                <p className="font-bold">Test PTO Rejection</p>
                <p className="text-sm opacity-90">Reject a pending request</p>
              </div>
            </div>
          </button>

          <button
            onClick={testNotificationPopup}
            className="px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-bold">Test Popup Notification</p>
                <p className="text-sm opacity-90">Show a popup notification</p>
              </div>
            </div>
          </button>

          <button
            onClick={testMultipleNotifications}
            className="px-6 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-bold">Test Multiple Notifications</p>
                <p className="text-sm opacity-90">Send 3 notifications over 3 seconds</p>
              </div>
            </div>
          </button>

          <button
            onClick={testSchedulePublish}
            className="px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5" />
              <div>
                <p className="font-bold">Test Schedule Publish</p>
                <p className="text-sm opacity-90">Notify 3 employees about new schedule</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
          <button
            onClick={() => setTestResults([])}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Clear Results
          </button>
        </div>

        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tests run yet. Click the buttons above to test interactions.
          </p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  result.startsWith("✅")
                    ? "bg-green-50 border-green-200 text-green-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <p className="font-mono text-sm">{result}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">How to Test</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Check the notification bell icon in the top navigation - it should show a red badge when there are unread notifications</li>
          <li>Click "Test PTO Submission" - a popup should appear if you're a Team Leader or HR Admin</li>
          <li>Click "Test Schedule Publish" - simulates publishing a schedule to 3 employees</li>
          <li>Click "Test Popup Notification" - verify the popup appears and auto-dismisses after 5 seconds</li>
          <li>Open the notification center (bell icon) to see all notifications</li>
          <li>Test approving and rejecting PTO requests to see the complete workflow</li>
          <li>Switch between different user roles (Employee, Team Leader, HR Admin) to test role-based functionality</li>
          <li>Note: Each notification is targeted to specific users - you'll only see notifications meant for your role/employee ID</li>
        </ol>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Notifications ({notifications.length})
        </h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {notification.employeeName && (
                      <p className="text-xs text-gray-500 mt-2">
                        From: {notification.employeeName}
                        {notification.employeeDepartment && ` (${notification.employeeDepartment})`}
                      </p>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
