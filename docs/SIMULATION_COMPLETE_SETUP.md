# 🌊 AquaAlert Sensor Simulation Setup Guide

## How the Simulation Works

The AquaAlert sensor simulation creates a realistic IoT environment by:

### 1. **Virtual Sensor Network**

- **3 Water Quality Sensors** placed in Majuli villages (Assam, India)
- Each sensor monitors **7 parameters**: pH, E.coli, Turbidity, TDS, Temperature, Flow Rate, Dissolved Oxygen
- Realistic **GPS coordinates** and village locations

### 2. **Intelligent Data Generation**

- **Seasonal Patterns**: Monsoon increases contamination risk
- **Daily Cycles**: Early morning = better quality, afternoon = worse
- **Random Variations**: Mimics real sensor noise and fluctuations
- **Equipment Status**: Battery levels, signal strength, connectivity

### 3. **Smart Alert System**

- **Critical Alerts**: Immediate health risks (E.coli > 10, pH < 5.5)
- **Warning Alerts**: Moderate concerns requiring attention
- **Maintenance Alerts**: Low battery, poor signal, offline sensors
- **Email Notifications**: Automatic alerts to health officials

### 4. **Real-time Data Flow**

```
Sensor Simulation → Firebase Firestore → React Dashboard → Government Officials
```

## 🚀 Complete Setup Process

### Step 1: Firebase Configuration

1. **Check Firebase Admin Setup**

```bash
cd backend
# Check if service account exists
ls service-account-key.json
```

2. **If Firebase isn't configured, set it up:**

- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project: `project-md-2acd4`
- Go to Project Settings → Service Accounts
- Generate new private key
- Download as `service-account-key.json`
- Place in `backend/` folder

### Step 2: Environment Configuration

Create `backend/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=project-md-2acd4
NODE_ENV=development

# Email Configuration (for alerts)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if needed)
cd ..
npm install
```

### Step 4: Start the System

**Option A: Integrated Server (Recommended)**

```bash
cd backend
npm run dev
```

**Option B: Separate Sensor Service**

```bash
# Terminal 1: Main backend
cd backend
npm start

# Terminal 2: Sensor simulation
cd backend
npm run sensors
```

### Step 5: Access the Dashboard

1. Start frontend: `npm run dev`
2. Open: http://localhost:5173
3. Login as Government Official
4. Navigate to "Sensor Dashboard"
5. Use "Test Panel" to control simulation

## 📊 How to Use the Simulation

### Starting Simulation

1. **Via Web Interface**:

   - Go to Sensor Dashboard → Test Panel
   - Click "🚀 Start Simulation"
   - Watch real-time data appear

2. **Via API**:
   ```bash
   curl -X POST http://localhost:3001/api/sensors/simulation/start
   ```

### Monitoring Data

- **Overview Tab**: Quick sensor status and recent alerts
- **Sensors Tab**: Detailed readings for all sensors
- **Alerts Tab**: Complete alert history and management

### Testing Alerts

1. Click "🚨 Test Alert" in Test Panel
2. This triggers a critical contamination scenario
3. Check email for alert notification
4. View alert in dashboard

### Stopping Simulation

```bash
curl -X POST http://localhost:3001/api/sensors/simulation/stop
```

## 🔬 Simulation Features

### Realistic Water Quality Data

**Normal Conditions:**

- pH: 6.5-8.5 (optimal: 7.2)
- E.coli: 0-5 CFU/100ml
- Turbidity: 0-10 NTU
- TDS: 200-500 ppm
- Temperature: 15-35°C

**Contamination Events (5% chance):**

- High E.coli: 10-30 CFU/100ml
- High turbidity: 15-25 NTU
- Acidic pH: 5.0-6.0

**Equipment Issues (2% chance):**

- Low battery: <20%
- Poor signal: <30%
- Offline status

### Seasonal Intelligence

- **Monsoon (Jun-Sep)**: Higher contamination risk
- **Post-monsoon (Oct-Nov)**: Gradual improvement
- **Winter (Dec-Feb)**: Best water quality
- **Summer (Mar-May)**: Moderate risk, higher temperature

### Daily Patterns

- **5-8 AM**: Best quality (fresh overnight settling)
- **12-4 PM**: Worst quality (heat, activity)
- **8-11 PM**: Moderate quality (evening usage)

## 📧 Email Alert System

### Configuration

```env
EMAIL_USER=aquaalert.system@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # App password
```

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use 16-character app password in .env

### Alert Recipients

- `health.officer@jorhat.gov.in`
- `asha.coordinator@assam.gov.in`
- `water.quality@assam.gov.in`

### Alert Types

- 🚨 **Critical**: Immediate health risk
- ⚠️ **Warning**: Monitor closely
- 🔧 **Maintenance**: Equipment issues

## 🗄️ Database Structure

### Firestore Collections

**sensors/**

```json
{
  "SENSOR_001_MAJULI_V1": {
    "id": "SENSOR_001_MAJULI_V1",
    "name": "Majuli Village 1 Water Station",
    "location": {
      "lat": 26.97,
      "lng": 94.17,
      "village": "Majuli Village 1",
      "district": "Jorhat"
    },
    "status": "active",
    "batteryLevel": 85,
    "signalStrength": 78,
    "lastReading": {...},
    "createdAt": "timestamp"
  }
}
```

**sensor_readings/**

```json
{
  "reading_id": {
    "sensorId": "SENSOR_001_MAJULI_V1",
    "timestamp": "timestamp",
    "readings": {
      "ph": 7.2,
      "ecoli": 2,
      "turbidity": 3.5,
      "tds": 320,
      "temperature": 24.5,
      "flowRate": 2.8,
      "dissolvedOxygen": 8.2
    },
    "batteryLevel": 85,
    "signalStrength": 78,
    "status": "online"
  }
}
```

**alerts/**

```json
{
  "alert_id": {
    "sensorId": "SENSOR_001_MAJULI_V1",
    "severity": "critical",
    "alerts": [
      {
        "type": "critical",
        "parameter": "E.coli",
        "value": 15,
        "message": "Dangerous E.coli levels detected",
        "action": "Stop water consumption immediately"
      }
    ],
    "status": "active",
    "timestamp": "timestamp",
    "acknowledgedBy": null
  }
}
```

## 🎯 Demo Scenarios

### 1. Normal Operations Demo

- Start simulation
- Show all 3 sensors online
- Display normal water quality readings
- Demonstrate real-time updates every 30 seconds

### 2. Contamination Crisis Demo

- Trigger test alert
- Show critical E.coli levels
- Demonstrate email notification
- Show alert management in dashboard

### 3. Multi-language Demo

- Switch between English/Hindi/Assamese
- Show localized interface
- Demonstrate rural accessibility

### 4. Analytics Demo

- View sensor performance statistics
- Show historical trends
- Display equipment health monitoring

## 🛠️ Troubleshooting

### Common Issues

**Simulation not starting:**

```bash
# Check Firebase connection
node -e "console.log('Firebase Project:', process.env.FIREBASE_PROJECT_ID)"

# Test Firebase admin
cd backend && node -e "
const { initializeFirebaseAdmin } = require('./firebase-admin.js');
initializeFirebaseAdmin();
"
```

**No real-time updates:**

- Check Firebase security rules
- Verify Firestore permissions
- Check browser console for errors

**Email alerts not working:**

- Verify Gmail app password
- Check spam folder
- Test with personal email first

**Frontend not showing data:**

- Check CORS settings in backend
- Verify API endpoints are accessible
- Check network tab in browser

### Debug Commands

```bash
# Test API endpoints
curl http://localhost:3001/api/sensors/simulation/status

# Check sensor data
curl http://localhost:3001/api/sensors

# View alerts
curl http://localhost:3001/api/alerts

# Trigger test alert
curl -X POST http://localhost:3001/api/sensors/test-alert \
  -H "Content-Type: application/json" \
  -d '{"sensorId":"SENSOR_001_MAJULI_V1","alertType":"critical","recipientEmail":"test@example.com"}'
```

## 🚀 Ready for Production

### Deployment Checklist

- [ ] Firebase Admin SDK configured
- [ ] Environment variables set
- [ ] Email service configured
- [ ] Security rules updated
- [ ] API authentication enabled
- [ ] Data retention policies set

### Scaling Options

- Increase sensor count (5-10 sensors)
- Reduce reading frequency (5-15 minutes)
- Add more water parameters
- Implement ML predictions
- Add mobile app support

---

**Your simulation is now ready to impress government officials with realistic IoT water quality monitoring!** 🎉
