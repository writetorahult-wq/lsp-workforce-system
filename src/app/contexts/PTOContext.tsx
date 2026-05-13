import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface PTORequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeDepartment: string;
  startDate: string;
  endDate: string;
  days: number;
  type: "Vacation" | "Personal" | "Sick Leave" | "Family Emergency";
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  reason: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface PTOContextType {
  ptoRequests: PTORequest[];
  addPTORequest: (request: Omit<PTORequest, "id" | "submittedDate" | "status">) => void;
  approvePTORequest: (id: number, approvedBy: string) => void;
  rejectPTORequest: (id: number, rejectionReason: string, rejectedBy: string) => void;
  cancelPTORequest: (id: number) => void;
  getPendingRequestsCount: (role?: string, department?: string) => number;
  getPendingRequests: (role?: string, department?: string) => PTORequest[];
  getEmployeeRequests: (employeeId: number) => PTORequest[];
}

const PTOContext = createContext<PTOContextType | undefined>(undefined);

export function PTOProvider({ children }: { children: ReactNode }) {
  const defaultRequests: PTORequest[] = [
  {
    id: 1,
    employeeId: 3,
    employeeName: "Rahul",
    employeeDepartment: "Maintenance",
    startDate: "2026-05-20",
    endDate: "2026-05-22",
    days: 3,
    type: "Vacation",
    status: "approved",
    submittedDate: "2026-05-01",
    reason: "Family vacation",
    approvedBy: "Dong Jin",
    approvedDate: "2026-05-02"
  },
  {
    id: 2,
    employeeId: 4,
    employeeName: "Rahul 1",
    employeeDepartment: "Vision",
    startDate: "2026-06-10",
    endDate: "2026-06-10",
    days: 1,
    type: "Personal",
    status: "pending",
    submittedDate: "2026-05-08",
    reason: "Personal appointment"
  },
  {
    id: 3,
    employeeId: 5,
    employeeName: "Rahul2",
    employeeDepartment: "R&D",
    startDate: "2026-05-25",
    endDate: "2026-05-26",
    days: 2,
    type: "Sick Leave",
    status: "pending",
    submittedDate: "2026-05-10",
    reason: "Medical appointment"
  },
];

const [ptoRequests, setPTORequests] = useState<PTORequest[]>(() => {
  const saved = localStorage.getItem("ptoRequests");
  return saved ? JSON.parse(saved) : defaultRequests;
});

useEffect(() => {
  localStorage.setItem("ptoRequests", JSON.stringify(ptoRequests));
}, [ptoRequests]);
  const addPTORequest = useCallback((request: Omit<PTORequest, "id" | "submittedDate" | "status">) => {
    const newRequest: PTORequest = {
      ...request,
      id: Date.now(), // Use timestamp for unique ID
      submittedDate: new Date().toISOString().split('T')[0],
      status: "pending",
    };
    setPTORequests(prev => [...prev, newRequest]);
  }, []);

  const approvePTORequest = useCallback((id: number, approvedBy: string) => {
    setPTORequests(prev =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "approved" as const,
              approvedBy,
              approvedDate: new Date().toISOString().split('T')[0],
            }
          : req
      )
    );
  }, []);

  const rejectPTORequest = useCallback((id: number, rejectionReason: string, rejectedBy: string) => {
    setPTORequests(prev =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "rejected" as const,
              rejectionReason,
              approvedBy: rejectedBy,
              approvedDate: new Date().toISOString().split('T')[0],
            }
          : req
      )
    );
  }, []);

  const cancelPTORequest = useCallback((id: number) => {
    setPTORequests(prev => prev.filter((req) => req.id !== id));
  }, []);

  const getPendingRequestsCount = useCallback((role?: string, department?: string) => {
    let pending = ptoRequests.filter((req) => req.status === "pending");

    // Team leaders only see their department
    if (role === "team_leader" && department) {
      pending = pending.filter((req) => req.employeeDepartment === department);
    }

    return pending.length;
  }, [ptoRequests]);

  const getPendingRequests = useCallback((role?: string, department?: string) => {
    let pending = ptoRequests.filter((req) => req.status === "pending");

    // Team leaders only see their department
    if (role === "team_leader" && department) {
      pending = pending.filter((req) => req.employeeDepartment === department);
    }

    return pending;
  }, [ptoRequests]);

  const getEmployeeRequests = useCallback((employeeId: number) => {
    return ptoRequests.filter((req) => req.employeeId === employeeId);
  }, [ptoRequests]);

  return (
    <PTOContext.Provider
      value={{
        ptoRequests,
        addPTORequest,
        approvePTORequest,
        rejectPTORequest,
        cancelPTORequest,
        getPendingRequestsCount,
        getPendingRequests,
        getEmployeeRequests,
      }}
    >
      {children}
    </PTOContext.Provider>
  );
}

export function usePTO() {
  const context = useContext(PTOContext);
  if (context === undefined) {
    throw new Error("usePTO must be used within a PTOProvider");
  }
  return context;
}
