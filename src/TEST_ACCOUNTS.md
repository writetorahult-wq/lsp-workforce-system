# LSP USA LLC - Test Accounts

## Login Instructions

Visit the login page and enter any of the email addresses below with **any password**.

The system will automatically determine your role and redirect you to the appropriate dashboard.

---

## 🔐 Test Accounts

### HR/Admin Access (Full System)

| Email | Name | Department | Access Level |
|-------|------|------------|--------------|
| `djceo@lsp.llc` | Dong Jin | Executive | CEO - Full System Access |
| `paulna@lsp.llc` | Paul Na | HR | HR Manager - Full System Access |
| `admin@lsp.llc` | HR Admin | HR | Administrator - Full System Access |

**Features:**
- Full employee management
- All schedules (company-wide)
- All approvals (PTO, timesheets, schedule changes)
- Payroll access
- Attendance analytics
- Reports and exports
- System configuration

---

### Team Leader Access

| Email | Name | Department | Access Level |
|-------|------|------------|--------------|
| `teamlead@lsp.llc` | Michael Chen | Maintenance | Team Leader |
| `supervisor@lsp.llc` | Sarah Johnson | Vision | Supervisor |
| `manager@lsp.llc` | Robert Martinez | R&D | Manager |

**Features:**
- Team schedule management (department only)
- Approve team PTO requests
- Approve team timesheets
- Approve schedule change requests
- Team attendance monitoring
- Team productivity dashboard
- Team management

---

### Employee Access

| Email | Name | Department | Access Level |
|-------|------|------------|--------------|
| `employee@lsp.llc` | John Doe | Manufacturing | Employee |
| `worker@lsp.llc` | Jane Smith | Manufacturing | Employee |

**Features:**
- Personal dashboard
- View schedule (read-only)
- Request schedule changes
- Request PTO
- Edit timesheets (requires approval)
- Clock in/out (network-restricted)

---

## 🎯 Quick Test Guide

### Test Employee Portal:
1. Login with: `employee@lsp.llc`
2. Try to clock in/out (network-restricted)
3. View schedule → Request a change
4. Go to Timesheet → Edit hours → Submit for approval
5. Request PTO

### Test Team Leader Portal:
1. Login with: `teamlead@lsp.llc`
2. Manage team schedules (drag-and-drop)
3. View pending approvals (PTO, timesheet, schedule changes)
4. Check team attendance dashboard
5. View team productivity metrics

### Test HR/Admin Portal:
1. Login with: `admin@lsp.llc`
2. Access all features (full system)
3. Manage all employees
4. View company-wide schedules
5. Access payroll dashboard
6. Generate reports

---

## 🔄 How It Works

### Auto Role Detection:
```
Email → System Lookup → Determine Role → Redirect to Dashboard
```

1. User enters email and password
2. System checks email against database
3. Automatically assigns correct role (Employee/Team Leader/HR Admin)
4. Routes to appropriate dashboard
5. Sidebar menu filtered by role permissions

### Email Domain:
All test accounts use `@lsp.llc` domain

### Password:
For demo purposes, **any password** works. In production, this would validate against a secure backend.

---

## 🚨 Important Notes

- **No Role Selection**: Users don't choose their role - it's determined by their email
- **Automatic Routing**: After login, users see only features they have access to
- **Real-World**: In production, this would query a backend API with proper authentication
- **Demo Mode**: Current implementation uses mock data for demonstration

---

## 📱 Production Implementation

In a real deployment, the login process would:

```typescript
POST /api/auth/login
{
  "email": "employee@lsp.llc",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "employee@lsp.llc",
    "role": "employee",
    "department": "Manufacturing",
    "permissions": [...]
  }
}
```

The backend would:
1. Verify email and password against database
2. Return user data with role
3. Issue JWT token for session management
4. Frontend stores token and user data
5. Subsequent requests include token for authorization

---

## 🔒 Security Notes

- All passwords hashed with bcrypt (production)
- JWT tokens with expiration
- Role-based access control enforced server-side
- Network-restricted clock in/out
- Audit logging for all actions
- Session timeout after inactivity
- Two-factor authentication (recommended for admin)

---

## 📞 Support

For issues or questions:
- Contact HR: paulna@lsp.llc
- System Admin: admin@lsp.llc
- IT Support: (Chicago Plant extension)
