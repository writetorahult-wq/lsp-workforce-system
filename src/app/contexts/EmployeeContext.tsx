import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: number, employee: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  getEmployeeById: (id: number) => Employee | undefined;
  getEmployeesByDepartment: (department: string) => Employee[];
  searchEmployees: (query: string) => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([
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
  ]);

  const addEmployee = useCallback((employee: Omit<Employee, "id">) => {
    setEmployees(prev => [
      ...prev,
      {
        ...employee,
        id: Math.max(...prev.map(e => e.id), 0) + 1,
      },
    ]);
  }, []);

  const updateEmployee = useCallback((id: number, updatedData: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, ...updatedData } : emp))
    );
  }, []);

  const deleteEmployee = useCallback((id: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  }, []);

  const getEmployeeById = useCallback(
    (id: number) => {
      return employees.find(emp => emp.id === id);
    },
    [employees]
  );

  const getEmployeesByDepartment = useCallback(
    (department: string) => {
      return employees.filter(emp => emp.department === department);
    },
    [employees]
  );

  const searchEmployees = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return employees.filter(
        emp =>
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
