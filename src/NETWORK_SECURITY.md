# Network-Based Clock In/Out Security

## Overview

The LSP USA Workforce Management System implements **network-based access control** for the Clock In/Out feature to ensure accurate timesheet monitoring and prevent time theft.

## 🔒 Security Requirements

### Employees Can ONLY Clock In/Out When:
- ✅ Connected to **LSP Chicago Plant WiFi**
- ✅ Connected to **Company VPN**
- ✅ On **Company IP Address Range**
- ✅ Within **Company Network Infrastructure**

### Blocked When:
- ❌ On external/public WiFi
- ❌ Using mobile data
- ❌ Remote/home networks
- ❌ Any non-company network

## 📱 Current Implementation (Demo)

The current demo uses a **mock network detection** system located in:
```
/src/app/hooks/useCompanyNetwork.ts
```

### Demo Logic:
```typescript
// Considers these as "company network":
- localhost (for development)
- lsp.llc domain
- lsp-usa.local
- 192.168.1.x IP range
- 10.0.0.x IP range
```

## 🚀 Production Implementation

For production deployment, replace the mock logic with **real network verification**:

### Option 1: WiFi SSID Detection (Mobile App)
```typescript
// Check WiFi SSID name
const wifiSSID = await getWiFiSSID();
const allowedSSIDs = ["LSP-Chicago-Plant", "LSP-Guest"];
return allowedSSIDs.includes(wifiSSID);
```

### Option 2: IP Address Range Verification (Web/Mobile)
```typescript
// Check user's IP address against company ranges
const userIP = await getUserIPAddress();
const companyIPRanges = [
  "192.168.1.0/24",    // Chicago Plant
  "10.50.0.0/16",      // Company VPN
  "172.16.0.0/12"      // Company Network
];
return isIPInRange(userIP, companyIPRanges);
```

### Option 3: Server-Side Verification (Most Secure)
```typescript
// Server checks IP on each clock in/out request
POST /api/clock-in
Headers: {
  X-Real-IP: <user_ip_address>
  X-Forwarded-For: <user_ip_address>
}

Server validates:
1. IP is in company range
2. Timestamp is recent (prevent replay attacks)
3. Employee location matches assigned plant
```

### Option 4: Geofencing (GPS-Based)
```typescript
// For mobile apps - verify GPS location
const userLocation = await getCurrentPosition();
const chicagoPlantLocation = {
  latitude: 41.8781,
  longitude: -87.6298,
  radius: 100 // meters
};
return isWithinRadius(userLocation, chicagoPlantLocation);
```

## 🎯 Recommended Production Approach

### Multi-Layer Verification:
```typescript
async function verifyCompanyNetwork() {
  // Layer 1: IP Address Check
  const ipValid = await checkCompanyIP();
  
  // Layer 2: Server-Side Verification
  const serverVerified = await verifyWithServer();
  
  // Layer 3: WiFi SSID Check (mobile only)
  const wifiValid = await checkWiFiSSID();
  
  // Layer 4: GPS Location (optional, mobile only)
  const locationValid = await checkGeofence();
  
  return ipValid && serverVerified;
}
```

## 🔧 Implementation Steps

### 1. Backend API Endpoint
```typescript
// POST /api/verify-network
{
  "employeeId": 123,
  "timestamp": "2026-05-09T14:30:00Z",
  "deviceInfo": {
    "ip": "192.168.1.50",
    "userAgent": "Mozilla/5.0...",
    "location": { "lat": 41.8781, "lng": -87.6298 }
  }
}

Response:
{
  "allowed": true,
  "network": "LSP Chicago Plant",
  "reason": "Valid company IP range"
}
```

### 2. Update Hook
Replace mock logic in `useCompanyNetwork.ts`:
```typescript
const checkNetwork = async () => {
  const response = await fetch('/api/verify-network', {
    method: 'POST',
    body: JSON.stringify({
      employeeId: user.id,
      timestamp: new Date().toISOString(),
    })
  });
  
  const { allowed, network } = await response.json();
  setIsOnCompanyNetwork(allowed);
  setNetworkInfo(network);
};
```

### 3. Logging & Monitoring
```typescript
// Log all clock in/out attempts
{
  "timestamp": "2026-05-09T14:30:00Z",
  "employeeId": 123,
  "action": "clock_in",
  "network": "LSP Chicago Plant",
  "ip": "192.168.1.50",
  "location": { "lat": 41.8781, "lng": -87.6298 },
  "status": "success"
}
```

## 🛡️ Security Benefits

1. **Prevents Time Theft** - Employees can't clock in from home
2. **Accurate Location Tracking** - Ensures physical presence at work
3. **Audit Trail** - All attempts logged with IP/location
4. **Fraud Prevention** - Can't use VPN to bypass (with proper server-side checks)
5. **Compliance** - Meets labor law requirements for accurate time tracking

## ⚠️ Important Notes

- **Privacy**: Inform employees about network/location tracking
- **Offline Mode**: Consider offline clock-in with later sync/verification
- **VPN**: Legitimate VPN access should be whitelisted
- **Mobile Workers**: Special rules for field/remote workers
- **Backup**: Manual time entry process if system fails

## 📊 User Experience

### When ON Company Network:
- ✅ Green indicator: "Connected: LSP Chicago Plant Network"
- ✅ Clock In/Out buttons enabled
- ✅ Real-time status updates

### When OFF Company Network:
- ❌ Red indicator: "Not on company network"
- ❌ Clock In/Out buttons disabled
- ⚠️ Warning message: "You must be connected to the LSP Chicago Plant network..."

## 🔄 Auto-Refresh

Network status checks:
- On page load
- Every 30 seconds
- Before each clock in/out attempt
- After network change events

This ensures employees can't clock in if they leave the network during their shift.
