# 🔐 LSP USA LLC Chicago Plant - Login Credentials

## Real User Data

### **HR Admin / CEO**
- **Name:** Dong Jin
- **Email:** `dj.ji@lsp.llc`
- **Password:** `any` (accepts any password for demo)
- **Role:** HR Admin
- **Department:** Executive
- **ID:** 1

**Access:**
- ✅ View all employees across all departments
- ✅ Approve/Reject all PTO requests
- ✅ Create and publish schedules for all departments
- ✅ Auto-scheduling with full access
- ✅ Payroll dashboard
- ✅ HR Admin dashboard
- ✅ All system features

---

### **Team Leader**
- **Name:** Daniel Kwon
- **Email:** `daniel.kwon@lsp.llc`
- **Password:** `any` (accepts any password for demo)
- **Role:** Team Leader
- **Department:** Manufacturing
- **ID:** 2

**Access:**
- ✅ View team members in Manufacturing department
- ✅ Approve/Reject PTO requests (Manufacturing only)
- ✅ Create and publish team schedules
- ✅ Auto-scheduling for team
- ✅ Team management dashboard
- ✅ Attendance tracking

---

### **Employee - Maintenance**
- **Name:** Rahul
- **Email:** `writetorahult@gmail.com`
- **Password:** `any` (accepts any password for demo)
- **Role:** Employee
- **Department:** Maintenance
- **Position:** Maintenance Technician
- **ID:** 3

**Access:**
- ✅ View personal schedule
- ✅ Submit PTO requests
- ✅ View PTO balance and history
- ✅ Clock in/out
- ✅ Manage timesheet
- ✅ Request schedule changes

---

### **Employee - Vision**
- **Name:** Rahul 1
- **Email:** `rahul1@lsp.llc`
- **Password:** `any` (accepts any password for demo)
- **Role:** Employee
- **Department:** Vision
- **Position:** Vision Specialist
- **ID:** 4

**Access:**
- ✅ View personal schedule
- ✅ Submit PTO requests
- ✅ View PTO balance and history
- ✅ Clock in/out
- ✅ Manage timesheet
- ✅ Request schedule changes

---

### **Employee - R&D**
- **Name:** Rahul2
- **Email:** `rahul2@lsp.llc`
- **Password:** `any` (accepts any password for demo)
- **Role:** Employee
- **Department:** R&D
- **Position:** R&D Engineer
- **ID:** 5

**Access:**
- ✅ View personal schedule
- ✅ Submit PTO requests
- ✅ View PTO balance and history
- ✅ Clock in/out
- ✅ Manage timesheet
- ✅ Request schedule changes

---

## Quick Login Guide

1. **Go to:** `/login` page
2. **Enter email** from the list above
3. **Enter any password** (system accepts any password for demo)
4. **Click "Sign In"**

---

## Testing Workflows

### **Test PTO Request Workflow:**

1. **Login as Employee** (writetorahult@gmail.com)
2. Submit PTO request
3. **Logout and login as Team Leader** (daniel.kwon@lsp.llc)
4. See notification popup
5. Approve or reject
6. **Logout and login as Employee** again
7. See approval/rejection notification

### **Test Schedule Publishing:**

1. **Login as Team Leader** (daniel.kwon@lsp.llc)
2. Go to Auto-Scheduling
3. Generate schedule
4. Publish schedule
5. **Logout and login as Employee** (writetorahult@gmail.com)
6. See schedule notification popup

### **Test HR Admin Access:**

1. **Login as HR Admin** (dj.ji@lsp.llc)
2. See all departments
3. See all PTO requests (from all departments)
4. Create schedules for any department
5. Full system access

---

## Department Structure

```
LSP USA LLC - Chicago Plant
│
├── Executive
│   └── Dong Jin (CEO/HR Admin)
│
├── Manufacturing
│   └── Daniel Kwon (Team Leader)
│
├── Maintenance
│   └── Rahul (Employee)
│
├── Vision
│   └── Rahul 1 (Employee)
│
└── R&D
    └── Rahul2 (Employee)
```

---

## Email Mapping

| Person | Primary Email | Department | Role |
|--------|--------------|------------|------|
| Dong Jin | dj.ji@lsp.llc | Executive | HR Admin |
| Daniel Kwon | daniel.kwon@lsp.llc | Manufacturing | Team Leader |
| Rahul | writetorahult@gmail.com | Maintenance | Employee |
| Rahul 1 | rahul1@lsp.llc | Vision | Employee |
| Rahul2 | rahul2@lsp.llc | R&D | Employee |

---

## Notification Targeting

**When Rahul (writetorahult@gmail.com) submits PTO:**
- ✅ Daniel Kwon gets notified (if Maintenance is his department)
- ✅ Dong Jin gets notified (HR Admin sees all)

**When Daniel Kwon publishes schedule:**
- ✅ Only employees in Manufacturing department get notified

**When Dong Jin publishes schedule:**
- ✅ All employees in selected departments get notified

---

## System Features by Role

### **HR Admin (Dong Jin)**
- ✅ All Schedules
- ✅ Auto Scheduling
- ✅ PTO Management (All)
- ✅ Timesheet Management
- ✅ Attendance Dashboard
- ✅ Payroll Dashboard
- ✅ HR Admin Dashboard
- ✅ Test Interactions

### **Team Leader (Daniel Kwon)**
- ✅ Dashboard
- ✅ My Schedule
- ✅ Manage Team Schedules
- ✅ Auto Scheduling (Team)
- ✅ PTO Management (Team)
- ✅ Timesheet
- ✅ Attendance (Team)
- ✅ Team Management
- ✅ Test Interactions

### **Employee (Rahul, Rahul 1, Rahul2)**
- ✅ Dashboard
- ✅ My Schedule
- ✅ PTO Management (Personal)
- ✅ Timesheet
- ✅ Test Interactions

---

## 🎯 All Real Data Implemented!

**The system now uses:**
- ✅ Real employee names
- ✅ Real email addresses
- ✅ Real departments
- ✅ Real positions
- ✅ Consistent employee IDs
- ✅ Proper role-based access
- ✅ Proper notification targeting

**Ready for production testing!** 🚀
