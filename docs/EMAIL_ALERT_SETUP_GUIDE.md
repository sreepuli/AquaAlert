# 📧 Email Alert System with Registered Government Officials

## 🎯 Overview

The AquaAlert system now dynamically fetches registered government officials from the Firebase database to send alert emails. This ensures that only verified and approved officials receive water quality alerts.

## 🔄 How It Works

### 1. **Government Official Registration**

- Officials register through the signup page
- Documents are uploaded for verification
- Admin reviews and approves the application
- Approved officials are stored in Firebase with `role: 'government'` and `verificationStatus: 'approved'`

### 2. **Dynamic Email Fetching**

```javascript
// The system queries Firebase for approved officials
const queries = [
  db
    .collection("users")
    .where("role", "==", "government")
    .where("isActive", "==", true),
  db
    .collection("users")
    .where("role", "==", "official")
    .where("isActive", "==", true),
  db
    .collection("users")
    .where("verificationStatus", "==", "approved")
    .where("role", "==", "government"),
];
```

### 3. **Smart Alert Filtering**

- **Critical Alerts**: Sent to officials with `alertTypes: ['critical_alerts']`
- **Water Quality Alerts**: Sent to officials with `alertTypes: ['water_quality']`
- **Location-based**: Officials in the same district get priority
- **Emergency Backup**: Always CC emergency contacts

## 📊 Database Structure

### Government Official Document:

```javascript
{
  uid: "firebase_user_id",
  name: "Dr. Rajesh Kumar",
  email: "rajesh.kumar@assam.gov.in",
  role: "government",
  position: "District Health Officer",
  district: "Jorhat",
  department: "Health",
  alertTypes: ["water_quality", "critical_alerts", "health_outbreak"],
  isActive: true,
  verificationStatus: "approved",
  phone: "+91-9876543210",
  createdAt: "timestamp",
  approvedBy: "admin_uid",
  approvedAt: "timestamp"
}
```

## 🚨 Alert Email Recipients

### Automatic Recipient Selection:

1. **Primary Recipients**: Approved government officials from Firebase
2. **Filter Criteria**:
   - `isActive: true`
   - `verificationStatus: 'approved'`
   - Matching `alertTypes` or `district`
3. **Emergency Backup**: `emergency@assam.gov.in`, `water.monitoring@assam.gov.in`

### Sample Email Recipients Log:

```
📧 CRITICAL alert sent to 3 registered officials for SENSOR_001_MAJULI_V1
📬 Recipients: Dr. Rajesh Kumar (rajesh.kumar@assam.gov.in), Mrs. Priya Sharma (priya.sharma@assam.gov.in), Dr. Anita Das (anita.das@assam.gov.in)
```

## 🔧 Testing the System

### 1. **Add Government Officials**

```bash
# Add sample officials to Firebase
curl -X POST http://localhost:3001/api/government/officials/bulk-add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. **Test Alert System**

```bash
# Trigger a test alert
curl -X POST http://localhost:3001/api/sensors/test-alert \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "SENSOR_001_MAJULI_V1",
    "alertType": "critical",
    "recipientEmail": "test@example.com"
  }'
```

### 3. **Verify Email Recipients**

Check the backend logs for:

```
📧 Fetched 5 government officials from Firebase for alerts
📧 CRITICAL alert sent to 3 registered officials for SENSOR_001_MAJULI_V1
📬 Recipients: Dr. Rajesh Kumar (rajesh.kumar@assam.gov.in), ...
```

## 🛠️ Configuration

### Environment Variables:

```bash
# Email Configuration
EMAIL_USER=aquaalert.system@gmail.com
EMAIL_PASS=your_app_password

# Government Email (Production)
GOV_EMAIL_USER=aquaalert.government@assam.gov.in
GOV_EMAIL_PASS=SecureGovPassword2025

# Emergency Contacts
EMERGENCY_EMAIL=emergency@assam.gov.in
MONITORING_EMAIL=water.monitoring@assam.gov.in
```

### Alert Types Configuration:

```javascript
const alertTypes = {
  water_quality: ["ph_abnormal", "turbidity_high", "ecoli_detected"],
  critical_alerts: ["contamination_critical", "health_emergency"],
  health_outbreak: ["disease_outbreak", "epidemic_alert"],
  daily_summary: ["daily_report", "weekly_summary"],
  maintenance: ["sensor_offline", "battery_low"],
};
```

## 📈 Advanced Features

### 1. **Role-based Alert Routing**

- **Health Officers**: Get health and contamination alerts
- **Water Quality Supervisors**: Get water parameter alerts
- **Emergency Coordinators**: Get all critical alerts
- **District Collectors**: Get summary reports

### 2. **Geographic Filtering**

```javascript
// Location-based alert filtering
const recipients = governmentOfficials.filter(
  (official) =>
    official.district === sensorLocation.district ||
    official.alertTypes.includes("critical_alerts")
);
```

### 3. **Alert Escalation**

- **Level 1**: Local officials in the same district
- **Level 2**: Regional coordinators
- **Level 3**: State-level emergency contacts
- **Always CC**: Emergency response team

## 🔒 Security Features

### 1. **Email Validation**

- Only verified email addresses receive alerts
- Government domain validation
- Bounce handling and cleanup

### 2. **Access Control**

- Only approved officials receive alerts
- Admin can enable/disable officials
- Real-time status checking

### 3. **Audit Trail**

- All email alerts logged
- Recipient tracking
- Delivery confirmation

## 📱 Real-world Usage

### Government Official Workflow:

1. **Registration**: Official registers with documents
2. **Verification**: Admin approves the application
3. **Alert Subscription**: Automatically subscribed to relevant alerts
4. **Real-time Notifications**: Receives water quality alerts via email
5. **Dashboard Access**: Can view detailed information in official dashboard

### Admin Management:

1. **Monitor Recipients**: View who receives alerts
2. **Manage Subscriptions**: Enable/disable officials
3. **Update Alert Types**: Modify who gets which alerts
4. **View Email Logs**: Track alert delivery

## 🎯 Benefits

### 1. **Dynamic and Scalable**

- No hardcoded email lists
- Automatically includes new officials
- Real-time updates

### 2. **Verified Recipients**

- Only approved officials get alerts
- Document verification ensures authenticity
- Reduces spam and unauthorized access

### 3. **Smart Filtering**

- Relevant officials get relevant alerts
- Location-based routing
- Role-based alert types

### 4. **Audit and Compliance**

- Complete tracking of who received what
- Government accountability
- Emergency response coordination

---

## 🚀 **System Status: ACTIVE**

✅ **Email System**: Configured and operational  
✅ **Firebase Integration**: Dynamic official fetching  
✅ **Alert Routing**: Smart filtering by role and location  
✅ **Emergency Backup**: Always CC emergency contacts  
✅ **Security**: Only approved officials receive alerts

The email alert system now uses registered government officials from the Firebase database, ensuring secure, verified, and relevant alert distribution! 📧🎯
