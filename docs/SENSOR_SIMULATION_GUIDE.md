# 🌊 AquaAlert IoT Sensor Simulation System

## Overview

The AquaAlert IoT Sensor Simulation System creates a realistic demonstration of water quality monitoring using simulated sensors. This system generates real-time water quality data, triggers intelligent alerts, and provides comprehensive monitoring dashboards.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install express-validator nodemailer

# If not already installed
npm install
```

### 2. Configure Environment

Create or update `backend/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email Configuration (for alerts)
EMAIL_USER=aquaalert.system@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Start the Systems

```bash
# Terminal 1: Start main backend server
cd backend
npm run dev

# Terminal 2: Start sensor simulation (optional - can also be started via API)
cd backend
npm run sensors:dev

# Terminal 3: Start frontend
cd ..
npm run dev
```

### 4. Access the Dashboard

1. Open the frontend: http://localhost:5173
2. Login as Government Official
3. Navigate to "Sensor Dashboard" tab
4. Use the "Test Panel" to control simulation

## 📊 Features

### Real-Time Sensor Simulation

- **3 Virtual Sensors** in Majuli villages
- **Water Quality Parameters**: pH, E.coli, Turbidity, TDS, Temperature, Flow Rate, Dissolved Oxygen
- **Realistic Data Patterns**: Seasonal variations, daily cycles, random noise
- **Equipment Simulation**: Battery levels, signal strength, connectivity status

### Intelligent Alert System

- **Critical Alerts**: Immediate health risks (high E.coli, dangerous pH)
- **Warning Alerts**: Moderate risks requiring attention
- **Maintenance Alerts**: Equipment issues (low battery, connectivity)
- **Email Notifications**: Automated alerts to health officials
- **Alert Management**: Acknowledgment and tracking system

### Comprehensive Dashboard

- **Real-Time Monitoring**: Live sensor data updates
- **Visual Status Indicators**: Color-coded parameter displays
- **Analytics**: Historical trends, performance statistics
- **Multi-Language Support**: English, Hindi, Assamese

## 🏗️ System Architecture

### Backend Components

```
backend/
├── services/
│   └── sensorSimulation.js     # Core simulation engine
├── routes/
│   └── sensors.js              # API endpoints
├── startSensors.js             # Standalone sensor runner
└── server.js                   # Main application server
```

### Frontend Components

```
src/
├── components/
│   ├── SensorDashboard.jsx     # Main sensor interface
│   └── SensorTestPanel.jsx     # Simulation control panel
└── dashboards/
    └── OfficialDashboard.jsx   # Government portal
```

### Database Schema (Firebase Firestore)

```
collections/
├── sensors/                    # Sensor configurations
│   └── {sensorId}/
│       ├── id: string
│       ├── name: string
│       ├── location: object
│       ├── status: string
│       └── lastReading: object
│
├── sensor_readings/            # Time-series data
│   └── {readingId}/
│       ├── sensorId: string
│       ├── timestamp: timestamp
│       ├── readings: object
│       ├── batteryLevel: number
│       └── signalStrength: number
│
└── alerts/                     # Alert records
    └── {alertId}/
        ├── sensorId: string
        ├── severity: string
        ├── alerts: array
        ├── status: string
        └── timestamp: timestamp
```

## 🔧 API Endpoints

### Simulation Control

- `POST /api/sensors/simulation/start` - Start simulation
- `POST /api/sensors/simulation/stop` - Stop simulation
- `GET /api/sensors/simulation/status` - Get simulation status

### Data Access

- `GET /api/sensors` - List all sensors
- `GET /api/sensors/:id/readings` - Get sensor readings
- `GET /api/alerts` - Get alerts with filtering
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert

### Analytics

- `GET /api/sensors/analytics` - Get sensor statistics
- `POST /api/sensors/test-alert` - Trigger test alert

## 🚨 Alert Configuration

### Critical Thresholds

- **pH**: < 5.5 or > 9.0
- **E.coli**: > 10 CFU/100ml
- **Turbidity**: > 15 NTU
- **TDS**: > 600 ppm

### Warning Thresholds

- **pH**: < 6.0 or > 8.8
- **E.coli**: > 5 CFU/100ml
- **Turbidity**: > 12 NTU
- **TDS**: > 550 ppm

### Equipment Alerts

- **Battery**: < 20%
- **Signal**: < 30%
- **Connectivity**: Offline status

## 📧 Email Alert Configuration

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication
2. Generate App Password
3. Update environment variables:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Alert Recipients

Default recipients in simulation:

- `health.officer@jorhat.gov.in`
- `asha.coordinator@assam.gov.in`
- `water.quality@assam.gov.in`

## 🎯 Demo Scenarios

### 1. Normal Operations

- All sensors online with normal readings
- Gradual variations within safe ranges
- Regular battery and signal updates

### 2. Water Contamination Event

- High E.coli levels (>10 CFU/100ml)
- Increased turbidity
- Critical alerts triggered
- Email notifications sent

### 3. Equipment Malfunction

- Sensor goes offline
- Low battery warnings
- Maintenance alerts generated

### 4. Seasonal Patterns

- Monsoon: Higher contamination risk
- Summer: Increased temperature, higher TDS
- Winter: Generally better water quality

## 🔍 Testing Guide

### Via Web Interface

1. Go to Sensor Dashboard → Test Panel
2. Click "Start Simulation"
3. Monitor real-time data updates
4. Test critical alerts with "Test Alert" button

### Via API (Postman/curl)

```bash
# Start simulation
curl -X POST http://localhost:3001/api/sensors/simulation/start

# Check status
curl http://localhost:3001/api/sensors/simulation/status

# Get sensor data
curl http://localhost:3001/api/sensors

# Trigger test alert
curl -X POST http://localhost:3001/api/sensors/test-alert \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "SENSOR_001_MAJULI_V1",
    "alertType": "critical",
    "recipientEmail": "test@example.com"
  }'
```

### Firebase Console Verification

1. Open Firebase Console
2. Navigate to Firestore Database
3. Check collections: `sensors`, `sensor_readings`, `alerts`
4. Verify real-time data updates

## 🛠️ Troubleshooting

### Common Issues

**Simulation not starting:**

- Check Firebase configuration
- Verify environment variables
- Ensure backend server is running

**No email alerts:**

- Verify email configuration
- Check spam folder
- Ensure App Password is correct

**Frontend not showing data:**

- Check CORS configuration
- Verify API endpoints are accessible
- Check browser console for errors

**Data not persisting:**

- Verify Firestore rules allow writes
- Check Firebase service account permissions
- Monitor Firebase logs

### Debug Commands

```bash
# Check simulation status
npm run sensors

# View backend logs
npm run dev

# Test Firebase connection
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"
```

## 🚀 Production Deployment

### Environment Setup

1. **Firebase Project**: Create production project
2. **Email Service**: Configure production email service
3. **Environment Variables**: Update for production
4. **Security**: Enable authentication for API endpoints

### Scaling Considerations

- **Reading Frequency**: Adjust from 30s to 5-15 minutes
- **Data Retention**: Implement data cleanup policies
- **Alert Throttling**: Prevent alert spam
- **Load Balancing**: Multiple sensor simulation instances

## 📈 Future Enhancements

### Real IoT Integration

- Replace simulation with actual sensor APIs
- Support multiple sensor protocols (LoRaWAN, WiFi, Cellular)
- Edge computing capabilities

### Advanced Analytics

- Machine learning predictions
- Anomaly detection algorithms
- Predictive maintenance

### Mobile Application

- React Native mobile app
- Push notifications for alerts
- Offline data synchronization

### Government Integration

- API integration with existing health systems
- Compliance reporting features
- Multi-tenant architecture

## 📞 Support

For technical support or questions:

- Email: support@aquaalert.gov.in
- GitHub Issues: [Project Repository]
- Documentation: [Wiki/Docs]

---

**AquaAlert Sensor Simulation System** - Demonstrating the future of water quality monitoring in rural India 🇮🇳
