import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { AuthProvider } from "./contexts/AuthContext";
import { PTOProvider } from "./contexts/PTOContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { EmployeeProvider } from "./contexts/EmployeeContext";
import { ToastProvider } from "./contexts/ToastContext";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <PTOProvider>
            <EmployeeProvider>
              <RouterProvider router={router} />
            </EmployeeProvider>
          </PTOProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}