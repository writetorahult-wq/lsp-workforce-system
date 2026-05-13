# LSP USA LLC - Role-Based Access Control

## User Roles & Permissions

### 1. Employee 👤
**Access Level:** Basic Employee Portal

**Features:**
- ✅ **Dashboard** - View personal stats, notifications, current shift
  - Removed: Payroll card and Upcoming holidays section
  - Focus on schedule, PTO, attendance, and timesheet
- ✅ **My Schedule** - **READ-ONLY** - View assigned shifts (Day/Night/Off/Vacation)
  - 🔒 **Cannot edit schedules directly**
  - ✅ **Can request schedule changes** - Submit change requests to team leader
  - View current shift, next shift, and full week calendar
- ✅ **PTO Management** - Request time off, view PTO balance and history
- ✅ **Clock In/Out** - **NETWORK RESTRICTED** - Must be on company network/WiFi
  - 🔒 Only works on LSP Chicago Plant network
  - Prevents time theft and ensures accurate location tracking
  - Real-time network status display
  - Disabled when not on company network
- ✅ **Timesheet** - **EDITABLE** - Modify and adjust hours
  - ✏️ Can edit unapproved hours
  - Submit changes for team leader approval
  - Cannot edit already approved hours
  - All changes tracked and require approval
- ❌ **Payroll** - Removed from employee access

**Schedule Change Request Process:**
1. Employee views their schedule (read-only)
2. Clicks "Request Change" on any shift
3. Fills out change request form with reason
4. Submits to team leader for approval
5. Gets notified when approved/denied

**Restrictions:**
- ❌ Cannot edit schedules directly
- ❌ Cannot approve PTO requests
- ❌ Cannot approve schedule change requests
- ❌ Cannot view team attendance
- ❌ Cannot access HR admin features
- ❌ Cannot view other employees' data
- ❌ Cannot access payroll information
- ❌ Cannot clock in/out outside company network
- ❌ Cannot edit approved timesheet hours

---

### 2. Team Leader 👔
**Access Level:** Team Management & Approvals

**Features:**
- ✅ **Dashboard** - View team overview and personal stats
- ✅ **Team Schedules** - **FULL EDIT ACCESS** for team members
  - ✏️ Create and manage team shift schedules
  - Drag-and-drop shift assignment
  - Publish schedules to team
  - View schedule change requests from employees
- ✅ **PTO Approvals** - Approve or deny team member PTO requests
- ✅ **Attendance Management** - Monitor team attendance, late arrivals, overtime
- ✅ **Team Management Dashboard** - View team productivity, performance metrics
- ✅ **Timesheet** - View and approve team timesheets
- ✅ **Schedule Change Requests** - Approve or deny employee schedule change requests

**Restrictions:**
- ❌ Cannot access payroll information (except their own)
- ❌ Cannot access full HR admin features
- ❌ Cannot manage employees outside their team
- ❌ Limited to department-specific data

---

### 3. HR/Admin 🛡️
**Access Level:** Full System Access

**Features:**
- ✅ **Full Dashboard** - Complete system overview
- ✅ **Employee Management** - Add, edit, view all employees
- ✅ **All Schedules** - **FULL EDIT ACCESS** for all departments
  - ✏️ Manage all departments and shifts company-wide
  - Override any schedule
  - Approve all schedule change requests
  - Publish schedules for entire plant
- ✅ **All PTO Approvals** - Approve/deny any PTO request company-wide
- ✅ **All Timesheets** - View and approve all employee timesheets
- ✅ **Attendance Dashboard** - Company-wide attendance analytics
- ✅ **Payroll Dashboard** - Access all payroll data and reports
- ✅ **HR Admin Dashboard** - Employee directory, department analytics, PTO queue
- ✅ **Reports** - Generate and export all system reports
- ✅ **System Settings** - Configure departments, shifts, holidays

**Full Access to:**
- All employee data
- All departments
- All approvals
- All reports
- System configuration

---

## Access Control Summary

| Feature | Employee | Team Leader | HR/Admin |
|---------|----------|-------------|----------|
| View own data | ✅ | ✅ | ✅ |
| Clock in/out | ✅ | ✅ | ✅ |
| Request PTO | ✅ | ✅ | ✅ |
| **View schedule** | ✅ (read-only) | ✅ | ✅ |
| **Edit schedule** | ❌ | ✅ (team) | ✅ (all) |
| **Request schedule change** | ✅ | N/A | N/A |
| **Approve schedule changes** | ❌ | ✅ (team) | ✅ (all) |
| **Clock in/out** | ✅ (network-restricted) | ✅ | ✅ |
| **Edit timesheet** | ✅ (pending approval) | ✅ | ✅ |
| **Approve timesheet** | ❌ | ✅ (team) | ✅ (all) |
| View payroll | ❌ | ❌ | ✅ |
| Approve PTO | ❌ | ✅ (team) | ✅ (all) |
| View attendance | ❌ | ✅ (team) | ✅ (all) |
| Employee management | ❌ | ❌ | ✅ |
| Full reports | ❌ | ❌ | ✅ |

---

## Login Flow

1. **Single Login Page** (`/login`)
   - Enter company email and password
   - System automatically determines your role
   - No manual role selection needed
   
2. **Auto-Detection Process**
   ```
   Email → Database Lookup → Role Assignment → Dashboard Redirect
   ```
   
3. **Authenticated Dashboard**
   - Navigation filtered by role
   - Features restricted by permissions
   - Auto-redirect to login if not authenticated

### Example:
- Login with `employee@lsp.llc` → Employee Dashboard
- Login with `teamlead@lsp.llc` → Team Leader Dashboard  
- Login with `admin@lsp.llc` → HR/Admin Dashboard

---

## Navigation by Role

### Employee Navigation:
- Dashboard (Stats, Clock In/Out, Notifications)
- My Schedule (Read-Only with Change Request)
- PTO (Request Time Off)
- Timesheet (Edit & Submit for Approval)

### Team Leader Navigation:
- Dashboard
- Team Schedules
- PTO (with approval queue)
- Timesheet (with approval access)
- Attendance
- Team Management

### HR/Admin Navigation:
- Dashboard
- All Schedules
- PTO (all requests)
- Timesheet (all employees)
- Attendance
- Payroll
- HR Admin
- Reports

---

## Test Credentials

See `TEST_ACCOUNTS.md` for complete list of test accounts.

**Quick Test Accounts:**
- **Employee**: `employee@lsp.llc` (any password)
- **Team Leader**: `teamlead@lsp.llc` (any password)
- **HR/Admin**: `admin@lsp.llc` (any password)

The system automatically detects your role from your email address and routes you to the appropriate dashboard.
