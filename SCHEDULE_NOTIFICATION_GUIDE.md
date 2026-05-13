# 📅 Schedule Publishing & Notification System

## Complete Workflow: Team Lead Publishes Schedule → Employees Get Notified

---

## 🎯 The Flow

```
TEAM LEAD/HR ADMIN publishes schedule
    ↓
EACH EMPLOYEE gets personalized notification
    ↓
    - Popup appears on right side
    - Bell icon gets badge
    - Shows their specific shift summary
    - Click to view full schedule
```

---

## 📋 Step-by-Step Testing Guide

### **SCENARIO 1: Auto-Scheduling System**

#### **Step 1: Login as Team Leader or HR Admin**

1. Go to `/login`
2. Select **Team Leader** or **HR Admin**
3. Login with credentials

#### **Step 2: Generate Schedule**

1. Navigate to **Auto Scheduling** (`/auto-scheduling`)
2. Click **"Generate Schedule"** button
3. Configure the generator:
   - Department: Select a department (e.g., "Maintenance")
   - Shift Type: "Both" (Day & Night)
   - Required Employee Count: 5
   - Start Date: 2026-06-01
   - End Date: 2026-06-30
   - Enable all prevention options
4. Click **"Generate Schedule"**

**✅ What Happens:**
- Schedule is generated for all employees
- Preview shows employee calendars
- Conflicts are detected (if any)
- Statistics update

#### **Step 3: Review Generated Schedule**

1. Scroll through the preview section
2. See each employee's schedule for the month
3. Review conflict detection panel
4. Check coverage statistics

#### **Step 4: Publish Schedule**

1. Click **"Publish Schedule"** button (green button at top)
2. If high-severity conflicts exist → Confirmation dialog appears
3. Confirm to proceed

**🔔 What Happens Immediately:**

**FOR EACH EMPLOYEE IN THE SCHEDULE:**

- **Popup notification appears** (right side of screen)
- **Title:** "📅 New Schedule Published"
- **Message:** "Your schedule has been published by [Your Name]. You have: X day shifts, Y night shifts, Z days off"
- **Personalized summary** of their shifts
- **Click notification** → navigates to `/my-schedule`

**Alert shows:**
"Schedule published successfully! 8 employees have been notified."

---

### **SCENARIO 2: Manual Scheduling Page**

#### **Step 1: Login as Team Leader or HR Admin**

Same as above

#### **Step 2: Create Manual Schedule**

1. Navigate to **Scheduling** (`/scheduling`)
2. Toggle to **Month View** (or keep Week View)
3. Assign shifts by hovering over employee cells
4. Click to assign:
   - Day Shift
   - Night Shift
   - Off Day
   - Vacation

#### **Step 3: Publish Manual Schedule**

1. After assigning shifts to employees
2. Click **"Publish Schedule"** button (blue button at top)

**🔔 What Happens Immediately:**

**FOR EACH EMPLOYEE WITH ASSIGNED SHIFTS:**

- **Popup notification appears**
- **Title:** "📅 New Schedule Published"
- **Message:** "Your schedule for [Week/Month] has been published by [Your Name]. You have: X day shifts, Y night shifts, Z days off"
- **Shows timeframe** (e.g., "Week of May 12" or "May 2026")
- **Personalized shift summary**

**Alert shows:**
"Schedule published successfully! X employees have been notified."

---

### **SCENARIO 3: Employee Receives Notification**

#### **Step 1: Be Logged in as Employee**

1. Login as **Employee**
2. Can be on any page

#### **Step 2: When Schedule is Published**

(Team Lead publishes schedule from Auto-Scheduling or Manual Scheduling)

**🔔 EMPLOYEE SEES IMMEDIATELY:**

1. **POPUP NOTIFICATION** (top right)
   - Blue info notification
   - 📅 Calendar icon
   - Title: "📅 New Schedule Published"
   - Message: Personalized with their shift counts
   - Example: "Your schedule has been published by Paul Na. You have: 12 day shifts, 8 night shifts, 5 days off, 2 vacation days"

2. **BELL ICON BADGE**
   - Red circle with count appears
   - Shows "1" (or more if multiple notifications)

3. **NOTIFICATION CENTER**
   - Click bell icon → dropdown opens
   - Notification listed with blue highlight
   - Timestamp shows "Just now"

4. **CLICK NOTIFICATION**
   - Automatically navigates to `/my-schedule`
   - Shows their full calendar
   - Can see all assigned shifts
   - Notification marked as read

---

## 🧪 Quick Test Using Test Page

### **Fastest Way to Test**

1. Navigate to **🧪 Test Interactions** (`/interaction-test`)

2. Click **"Test Schedule Publish"** button

**What Happens:**
- Simulates publishing a schedule
- Sends notifications to 3 mock employees (ID 1, 2, 3)
- Notifications staggered 0.5 seconds apart
- Each notification personalized with shift details

**Check Results:**
- If you're Employee ID 1, 2, or 3 → Popup appears
- Bell icon badge updates
- Test results show success message

---

## 📊 Notification Personalization

### **What Each Employee Sees**

The notification is **personalized** with:

1. **Manager's Name** (who published it)
2. **Timeframe** (week or month)
3. **Their Shift Summary:**
   - Number of day shifts
   - Number of night shifts
   - Number of days off
   - Number of vacation days

### **Example Notifications**

**Employee with mostly day shifts:**
```
📅 New Schedule Published

Your schedule for June 2026 has been published by Paul Na.
You have: 15 day shifts, 5 night shifts, 8 days off, 2 vacation days

Click to view your schedule →
```

**Employee with mixed schedule:**
```
📅 New Schedule Published

Your schedule for Week of May 12 has been published by Michael Chen.
You have: 3 day shifts, 2 night shifts, 2 days off

Click to view your schedule →
```

**Employee on vacation:**
```
📅 New Schedule Published

Your schedule for June 2026 has been published by Paul Na.
You have: 10 vacation days

Click to view your schedule →
```

---

## 🎯 Who Sees What

### **Auto-Scheduling Publish**

| User Type | What They See |
|-----------|---------------|
| **Team Lead** | Success message + count of employees notified |
| **HR Admin** | Success message + count of employees notified |
| **Employee in schedule** | 🔔 Popup notification with their shifts |
| **Employee not in schedule** | Nothing |

### **Manual Scheduling Publish**

| User Type | What They See |
|-----------|---------------|
| **Team Lead** | Success message + count of employees notified |
| **HR Admin** | Success message + count of employees notified |
| **Employee with assigned shifts** | 🔔 Popup notification with their shifts |
| **Employee without shifts** | Nothing |

---

## ✅ Complete Feature Checklist

### **Team Lead / HR Admin Actions**

- [x] Generate auto-schedule
- [x] Publish auto-schedule
- [x] Create manual schedule
- [x] Publish manual schedule
- [x] See confirmation of employees notified
- [x] Export schedules

### **Employee Actions**

- [x] Receive schedule publish notification
- [x] See personalized shift summary
- [x] Bell icon badge appears
- [x] Click notification to view schedule
- [x] Notification marked as read
- [x] View full schedule details

### **Notification Features**

- [x] Popup appears on right side
- [x] Auto-dismisses after 5 seconds
- [x] Manual close button (X)
- [x] Personalized message per employee
- [x] Shows manager who published
- [x] Shows timeframe (week/month)
- [x] Shows shift breakdown
- [x] Click navigates to My Schedule
- [x] Only target specific employees
- [x] Bell badge updates
- [x] Notification center lists it

---

## 🔄 Complete Interaction Loop

```
STEP 1: Team Lead Creates Schedule
   ├─ Auto-Scheduling: Generate → Review → Publish
   └─ Manual Scheduling: Assign shifts → Publish

STEP 2: System Sends Notifications
   ├─ Calculates each employee's shifts
   ├─ Creates personalized message
   ├─ Targets specific employee IDs
   └─ Sends notification to each

STEP 3: Employees Receive Notifications
   ├─ Popup appears (if online)
   ├─ Bell badge appears
   ├─ Notification saved in center
   └─ Can click to view schedule

STEP 4: Employees View Schedule
   ├─ Click notification
   ├─ Navigate to /my-schedule
   ├─ See full calendar view
   └─ Notification marked as read
```

---

## 🎨 Visual Examples

### **Popup Notification (Employee View)**

```
┌─────────────────────────────────────────┐
│  📅  New Schedule Published             │
│                                       ✕ │
├─────────────────────────────────────────┤
│                                         │
│  Your schedule for June 2026 has been  │
│  published by Paul Na. You have:       │
│  12 day shifts, 8 night shifts,        │
│  5 days off, 2 vacation days           │
│                                         │
│  From: Paul Na • HR Department         │
│  Just now                               │
└─────────────────────────────────────────┘
```

### **Bell Icon with Badge**

```
  🔔 (1)  ← Red badge showing 1 notification
```

### **Success Message (Team Lead View)**

```
✓ Schedule published successfully!
  8 employees have been notified.
```

---

## 🚀 All Interactions Working

**Every interaction is functional:**

1. ✅ Generate schedule
2. ✅ Publish schedule
3. ✅ Send notifications to each employee
4. ✅ Personalized shift summary
5. ✅ Popup appears for employees
6. ✅ Bell badge updates
7. ✅ Click to view schedule
8. ✅ Mark as read
9. ✅ Role-based targeting

**Test it now and see the complete workflow in action!**
