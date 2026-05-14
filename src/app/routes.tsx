import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { LoginPage } from "./components/LoginPage";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { EmployeeScheduleView } from "./components/EmployeeScheduleView";
import { SchedulingPage } from "./components/SchedulingPage";
import { AutoSchedulingPage } from "./components/AutoSchedulingPage";
import { ScheduleGridView } from "./components/ScheduleGridView";
import { PTOManagement } from "./components/PTOManagement";
import { TimesheetManagement } from "./components/TimesheetManagement";
import { AttendanceDashboard } from "./components/AttendanceDashboard";
import { PayrollDashboard } from "./components/PayrollDashboard";
import { HRAdminDashboard } from "./components/HRAdminDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { EmployeeManagementPage } from "./components/EmployeeManagementPage";
import { NotFound } from "./components/NotFound";
import { SignupPage } from "./components/SignupPage";
import { TestPage } from "./components/TestPage";
import { InteractionTestPage } from "./components/InteractionTestPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import type { UserRole } from "./contexts/AuthContext";

function ProtectedScheduling() {
  return <ProtectedRoute element={SchedulingPage} allowedRoles={["team_leader", "hr_admin"]} />;
}

function ProtectedAutoScheduling() {
  return <ProtectedRoute element={AutoSchedulingPage} allowedRoles={["team_leader", "hr_admin"]} />;
}

function ProtectedGridView() {
  return <ProtectedRoute element={ScheduleGridView} allowedRoles={["team_leader", "hr_admin"]} />;
}

function ProtectedAttendance() {
  return <ProtectedRoute element={AttendanceDashboard} allowedRoles={["team_leader", "hr_admin"]} />;
}

function ProtectedPayroll() {
  return <ProtectedRoute element={PayrollDashboard} allowedRoles={["hr_admin"]} />;
}

function ProtectedHRAdmin() {
  return <ProtectedRoute element={HRAdminDashboard} allowedRoles={["hr_admin"]} />;
}

function ProtectedManager() {
  return <ProtectedRoute element={ManagerDashboard} allowedRoles={["team_leader"]} />;
}

function ProtectedEmployeeManagement() {
  return <ProtectedRoute element={EmployeeManagementPage} allowedRoles={["hr_admin"]} />;
}

function ProtectedSignup() {
  return <ProtectedRoute element={SignupPage} allowedRoles={["hr_admin"]} />;
}

function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "hr_admin") {
    return <HRAdminDashboard />;
  }

  if (user.role === "team_leader") {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        element: <RoleBasedDashboard />,
      },
      {
        path: "test",
        Component: TestPage,
      },
      {
        path: "interaction-test",
        Component: InteractionTestPage,
      },
      {
        path: "my-schedule",
        Component: EmployeeScheduleView,
      },
      {
        path: "scheduling",
        Component: ProtectedScheduling,
      },
      {
        path: "auto-scheduling",
        Component: ProtectedAutoScheduling,
      },
      {
        path: "schedule-grid",
        Component: ProtectedGridView,
      },
      {
        path: "pto",
        Component: PTOManagement,
      },
      {
        path: "timesheet",
        Component: TimesheetManagement,
      },
      {
        path: "attendance",
        Component: ProtectedAttendance,
      },
      {
        path: "payroll",
        Component: ProtectedPayroll,
      },
      {
        path: "hr-admin",
        Component: ProtectedHRAdmin,
      },
      {
        path: "manager",
        Component: ProtectedManager,
      },
      {
        path: "employees",
        Component: ProtectedEmployeeManagement,
      },
      {
        path: "signup",
        Component: ProtectedSignup,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
