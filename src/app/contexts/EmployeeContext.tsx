import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: "employee" | "team_leader" | "hr_admin";
  department: string;
  position: string;
  phoneNumber?: string;
  hireDate: string;
  status: "active" | "inactive";
  ptoBalance: number;
  sickLeaveBalance: number;
  address?: string;
  team?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  getEmployeeById: (id: number) => Employee | undefined;
  getEmployeesByDepartment: (department: string) => Employee[];
  searchEmployees: (query: string) => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "Dong Jin",
    email: "dj.ji@lsp.llc",
    role: "hr_admin",
    department: "Executive",
    position: "CEO / HR Admin",
    phoneNumber: "+1 (312) 555-0101",
    hireDate: "2020-01-15",
    status: "active",
    ptoBalance: 20,
    sickLeaveBalance: 10,
    address: "123 Executive Dr, Chicago, IL 60601",
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (312) 555-0199",
      relationship: "Spouse",
    },
  },
  {
    id: 2,
    name: "Daniel Kwon",
    email: "daniel.kwon@lsp.llc",
    role: "team_leader",
    department: "Manufacturing",
    position: "Team Leader",
    phoneNumber: "+1 (312) 555-0102",
    hireDate: "2021-03-20",
    status: "active",
    ptoBalance: 15,
    sickLeaveBalance: 8,
    address: "456 Manufacturing Ave, Chicago, IL 60602",
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (312) 555-0298",
      relationship: "Parent",
    },
  },
  {
    id: 3,
    name: "Rahul",
    email: "writetorahult@gmail.com",
    role: "employee",
    department: "Maintenance",
    position: "Maintenance Technician",
    phoneNumber: "+1 (312) 555-0103",
    hireDate: "2022-06-10",
    status: "active",
    ptoBalance: 12,
    sickLeaveBalance: 6,
    address: "789 Maintenance Rd, Chicago, IL 60603",
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (312) 555-0397",
      relationship: "Sibling",
    },
  },
  {
    id: 4,
    name: "Rahul 1",
    email: "rahul1@lsp.llc",
    role: "employee",
    department: "Vision",
    position: "Vision Specialist",
    phoneNumber: "+1 (312) 555-0104",
    hireDate: "2022-08-15",
    status: "active",
    ptoBalance: 10,
    sickLeaveBalance: 5,
    address: "321 Vision Blvd, Chicago, IL 60604",
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (312) 555-0496",
      relationship: "Parent",
    },
  },
  {
    id: 5,
    name: "Rahul2",
    email: "rahul2@lsp.llc",
    role: "employee",
    department: "R&D",
    position: "R&D Engineer",
    phoneNumber: "+1 (312) 555-0105",
    hireDate: "2023-01-10",
    status: "active",
    ptoBalance: 15,
    sickLeaveBalance: 7,
    address: "654 Research Pkwy, Chicago, IL 60605",
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (312) 555-0595",
      relationship: "Spouse",
    },
  },
];

const normalizeEmployee = (row: any): Employee => {
  let emergencyContact = undefined;

  if (typeof row.emergency_contact === "string") {
    try {
      emergencyContact = JSON.parse(row.emergency_contact);
    } catch {
      emergencyContact = undefined;
    }
  } else if (typeof row.emergency_contact === "object" && row.emergency_contact !== null) {
    emergencyContact = row.emergency_contact;
  }

  return {
    id: row.id,
    name: row.name || row.email,
    email: row.email,
    role: row.role || "employee",
    department: row.department || "Operations",
    position: row.position || (row.role === "hr_admin" ? "HR Administrator" : row.role === "team_leader" ? "Team Leader" : "Employee"),
    phoneNumber: row.phone_number ?? undefined,
    hireDate: row.hire_date ? row.hire_date.toString().slice(0, 10) : new Date().toISOString().split("T")[0],
    status: row.status === "inactive" ? "inactive" : "active",
    ptoBalance: row.pto_balance ?? 15,
    sickLeaveBalance: row.sick_leave_balance ?? 7,
    address: row.address ?? undefined,
    team: row.team ?? undefined,
    emergencyContact,
  };
};

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(
          "id, name, email, role, department, position, team, phone_number, hire_date, status, pto_balance, sick_leave_balance, address, emergency_contact"
        );

      if (error) {
        console.warn("[Supabase] Could not fetch employees:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setEmployees(data.map(normalizeEmployee));
      }
    };

    fetchEmployees();
  }, []);

  const addEmployee = useCallback(async (employee: Omit<Employee, "id">) => {
    const { data, error } = await supabase.from("employees").insert({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      position: employee.position,
      team: employee.team,
      phone_number: employee.phoneNumber,
      hire_date: employee.hireDate,
      status: employee.status,
      pto_balance: employee.ptoBalance,
      sick_leave_balance: employee.sickLeaveBalance,
      address: employee.address,
      emergency_contact: employee.emergencyContact,
    }).select("id, name, email, role, department, position, team, phone_number, hire_date, status, pto_balance, sick_leave_balance, address, emergency_contact").single();

    if (error) {
      console.warn("[Supabase] Could not add employee:", error.message);
      setEmployees((prev) => [
        ...prev,
        {
          ...employee,
          id: Math.max(...prev.map((e) => e.id), 0) + 1,
        },
      ]);
      return;
    }

    if (data) {
      setEmployees((prev) => [...prev, normalizeEmployee(data)]);
    }
  }, []);

  const updateEmployee = useCallback(async (id: number, updatedData: Partial<Employee>) => {
    const payload: any = {
      ...updatedData,
      phone_number: updatedData.phoneNumber,
      hire_date: updatedData.hireDate,
      pto_balance: updatedData.ptoBalance,
      sick_leave_balance: updatedData.sickLeaveBalance,
      emergency_contact: updatedData.emergencyContact,
    };

    delete payload.phoneNumber;
    delete payload.hireDate;
    delete payload.ptoBalance;
    delete payload.sickLeaveBalance;

    const { error } = await supabase.from("employees").update(payload).eq("id", id);

    if (error) {
      console.warn("[Supabase] Could not update employee:", error.message);
    }

    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp)));
  }, []);

  const deleteEmployee = useCallback(async (id: number) => {
    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      console.warn("[Supabase] Could not delete employee:", error.message);
    }

    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, []);

  const getEmployeeById = useCallback(
    (id: number) => {
      return employees.find((emp) => emp.id === id);
    },
    [employees]
  );

  const getEmployeesByDepartment = useCallback(
    (department: string) => {
      return employees.filter((emp) => emp.department === department);
    },
    [employees]
  );

  const searchEmployees = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(lowerQuery) ||
          emp.email.toLowerCase().includes(lowerQuery) ||
          emp.department.toLowerCase().includes(lowerQuery) ||
          emp.position.toLowerCase().includes(lowerQuery)
      );
    },
    [employees]
  );

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        getEmployeesByDepartment,
        searchEmployees,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within EmployeeProvider");
  }
  return context;
}
