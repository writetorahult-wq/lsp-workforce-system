import { useState } from "react";
import { Calendar, Plus, CheckCircle, XCircle, Clock, Bell, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePTO } from "../contexts/PTOContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useToast } from "../contexts/ToastContext";
import { PageHeader } from "./ui/PageHeader";
import { ConfirmDialog } from "./ui/ConfirmDialog";

export function PTOManagement() {
  const { user } = useAuth();
  const {
    ptoRequests,
    addPTORequest,
    approvePTORequest,
    rejectPTORequest,
    cancelPTORequest,
    getPendingRequestsCount,
    getPendingRequests,
    getEmployeeRequests,
  } = usePTO();
  const { addNotification } = useNotifications();
  const toast = useToast();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Form state
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formType, setFormType] = useState<"Vacation" | "Personal" | "Sick Leave" | "Family Emergency">("Vacation");
  const [formReason, setFormReason] = useState("");

  const isManager = user?.role === "team_leader" || user?.role === "hr_admin";

  // Use actual user ID from auth context
  const currentEmployeeId = user?.id || 1;

  const myRequests = isManager ? [] : getEmployeeRequests(currentEmployeeId);
  const pendingApprovals = isManager ? getPendingRequests(user?.role, user?.department) : [];

  const ptoBalance = {
    total: 15,
    used: myRequests.filter(r => r.status === "approved").reduce((sum, r) => sum + r.days, 0),
    pending: myRequests.filter(r => r.status === "pending").reduce((sum, r) => sum + r.days, 0),
    remaining: 15 - myRequests.filter(r => r.status === "approved").reduce((sum, r) => sum + r.days, 0),
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStartDate || !formEndDate) {
      toast.error("Missing Information", "Please select start and end dates");
      return;
    }

    const startDate = new Date(formStartDate);
    const endDate = new Date(formEndDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysDiff <= 0) {
      toast.error("Invalid Dates", "End date must be after start date");
      return;
    }

    if (ptoBalance.remaining < daysDiff) {
      toast.error("Insufficient Balance", `You only have ${ptoBalance.remaining} days remaining`);
      return;
    }

    addPTORequest({
      employeeId: currentEmployeeId,
      employeeName: user?.name || "Employee",
      employeeDepartment: user?.department || "Unknown",
      startDate: formStartDate,
      endDate: formEndDate,
      days: daysDiff,
      type: formType,
      reason: formReason,
    });

    // Send notification ONLY to Team Leaders and HR Admins
    addNotification({
      type: "pto_request",
      title: "New PTO Request",
      message: `${user?.name} has requested ${daysDiff} day(s) of ${formType.toLowerCase()}`,
      employeeName: user?.name,
      employeeDepartment: user?.department,
      actionUrl: "/pto",
      targetRoles: ["team_leader", "hr_admin"], // Only these roles see it
    });

    // Reset form
    setFormStartDate("");
    setFormEndDate("");
    setFormType("Vacation");
    setFormReason("");
    setShowRequestModal(false);

    toast.success("Request Submitted", `Your ${formType.toLowerCase()} request for ${daysDiff} day(s) has been submitted to your manager`);
  };

  const handleApprove = (requestId: number) => {
    const request = ptoRequests.find(r => r.id === requestId);
    approvePTORequest(requestId, user?.name || "Manager");

    if (request) {
      // Send notification ONLY to the specific employee who requested
      addNotification({
        type: "success",
        title: "PTO Request Approved ✓",
        message: `Your ${request.type.toLowerCase()} request for ${request.days} day(s) has been approved by ${user?.name}`,
        employeeName: user?.name,
        actionUrl: "/pto",
        targetEmployeeId: request.employeeId, // Only this employee sees it
      });

      toast.success("Request Approved", `${request.employeeName}'s ${request.type} request has been approved`);
    }
  };

  const handleReject = (requestId: number) => {
    if (!rejectionReason.trim()) {
      toast.warning("Reason Required", "Please provide a reason for rejecting this request");
      return;
    }

    const request = ptoRequests.find(r => r.id === requestId);
    rejectPTORequest(requestId, rejectionReason, user?.name || "Manager");

    if (request) {
      // Send notification ONLY to the specific employee who requested
      addNotification({
        type: "error",
        title: "PTO Request Rejected ✗",
        message: `Your ${request.type.toLowerCase()} request has been rejected by ${user?.name}. Reason: ${rejectionReason}`,
        employeeName: user?.name,
        actionUrl: "/pto",
        targetEmployeeId: request.employeeId, // Only this employee sees it
      });
    }

    setRejectionReason("");
    setSelectedRequest(null);
    setShowApprovalModal(false);

    if (request) {
      toast.info("Request Rejected", `${request.employeeName}'s ${request.type} request has been rejected`);
    }
  };

  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const handleCancelRequest = (requestId: number) => {
    cancelPTORequest(requestId);
    toast.success("Request Cancelled", "Your PTO request has been cancelled");
    setConfirmCancel(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">PTO Management</h1>
            {isManager && pendingApprovals.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-orange-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {isManager
              ? "Approve or reject PTO requests from your team"
              : "Manage your time off requests and balance"}
          </p>
        </div>
        {!isManager && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            Request PTO
          </button>
        )}
      </div>

      {/* PTO Balance Cards - Only for employees */}
      {!isManager && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Total PTO</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ptoBalance.total}</p>
            <p className="text-sm text-gray-500 mt-1">Days per year</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Used</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ptoBalance.used}</p>
            <p className="text-sm text-gray-500 mt-1">Days taken</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ptoBalance.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Days awaiting approval</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Remaining</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{ptoBalance.remaining}</p>
            <p className="text-sm text-gray-500 mt-1">Days available</p>
          </div>
        </div>
      )}

      {/* Pending Approvals - Only for managers */}
      {isManager && pendingApprovals.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-orange-900">
              Pending Approvals ({pendingApprovals.length})
            </h2>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg p-4 border border-orange-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-semibold text-blue-600 text-sm">
                          {request.employeeName.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.employeeName}</p>
                        <p className="text-sm text-gray-500">{request.employeeDepartment}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-semibold text-gray-900">{request.days} day(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-500">From:</span>
                        <span className="ml-2 font-semibold text-gray-900">{formatDate(request.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <span className="ml-2 font-semibold text-gray-900">{formatDate(request.endDate)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request.id);
                        setShowApprovalModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PTO Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isManager ? "All PTO Requests" : "My PTO Requests"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isManager && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Submitted
                </th>
                {!isManager && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(isManager ? ptoRequests : myRequests).map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  {isManager && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-semibold text-blue-600 text-xs">
                            {request.employeeName.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.employeeName}</p>
                          <p className="text-xs text-gray-500">{request.employeeDepartment}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{request.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatDate(request.startDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatDate(request.endDate)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{request.days}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{formatDate(request.submittedDate)}</span>
                  </td>
                  {!isManager && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === "pending" && (
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {(isManager ? ptoRequests : myRequests).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No PTO requests found
            </div>
          )}
        </div>
      </div>

      {/* Request PTO Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Request PTO</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    min={formStartDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Vacation">Vacation</option>
                  <option value="Personal">Personal</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Family Emergency">Family Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Please provide a reason for your PTO request..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Available PTO:</strong> {ptoBalance.remaining} days
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showApprovalModal && selectedRequest !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reject PTO Request</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="Please provide a reason for rejecting this request..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
