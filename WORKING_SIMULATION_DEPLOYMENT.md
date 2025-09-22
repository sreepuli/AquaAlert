# 🚀 AquaAlert Working Simulation Deployment Guide

## Overview

This guide ensures the **working sensor simulation** (`server-working.js`) is properly deployed to Render with full functionality including:

- ✅ 1-minute sensor data generation
- ✅ Government official email alerts
- ✅ Professional dark-themed email UI
- ✅ Real-time simulation control via API
- ✅ Production-ready error handling

## 📋 Pre-Deployment Checklist

### ✅ Files Configured for Working Simulation:

1. **`backend/server-working.js`** - Main server with working simulation
2. **`backend/package.json`** - Updated to start server-working.js
3. **`render.yaml`** - Modified to use server-working.js
4. **`backend/services/workingSensorSimulation.js`** - Core simulation engine

### ✅ Key Configuration Changes:

```json
// backend/package.json
{
  "main": "server-working.js",
  "scripts": {
    "start": "node server-working.js"
  }
}
```

```yaml
# render.yaml
services:
  - type: web
    name: aquaalert-backend
    startCommand: cd backend && node server-working.js
```

## 🔧 Deployment Steps

### Step 1: Verify Local Setup

```bash
# Navigate to backend directory
cd backend

# Test the working simulation locally
node server-working.js

# In another terminal, test the endpoints:
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/sensors/simulation/start
```

### Step 2: Environment Variables Setup

In Render dashboard, configure these environment variables:

```env
# Core Settings
NODE_ENV=production
PORT=3001

# Email Configuration (REQUIRED for alerts)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
GOVERNMENT_EMAILS=srilakshmipulisri@gmail.com,sreepuli24@gmail.com,manidweep2005@gmail.com

# Application Settings
DEMO_MODE=true
SEND_DAILY_REPORTS=true

# URLs (auto-populated by Render)
FRONTEND_URL=https://your-frontend.onrender.com
CORS_ORIGIN=https://your-frontend.onrender.com
```

### Step 3: Deploy to Render

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Configure working simulation for deployment"
   git push origin main
   ```

2. **Create Render Service**:

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select `render.yaml` blueprint

3. **Monitor Deployment**:
   - Watch build logs for "Working Sensor Simulation initialized"
   - Check health endpoint: `https://your-backend.onrender.com/api/health`

## 🧪 Post-Deployment Testing

### Test Simulation Endpoints:

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Start simulation
curl -X POST https://your-backend.onrender.com/api/sensors/simulation/start

# Check simulation status
curl https://your-backend.onrender.com/api/sensors/simulation/status

# Get sensor data
curl https://your-backend.onrender.com/api/sensors

# Test email system
curl -X POST https://your-backend.onrender.com/api/test/email
```

### Expected Responses:

```json
// Health Check Response
{
  "status": "OK",
  "message": "AquaAlert Backend is running with Working Simulation",
  "simulation": "working",
  "environment": "production"
}

// Start Simulation Response
{
  "success": true,
  "message": "Sensor simulation started successfully - generating data every 1 minute",
  "status": {
    "isRunning": true,
    "interval": 60000,
    "dataGenerated": true
  }
}
```

## 🎯 Working Simulation Features

### 1. **Automatic Data Generation**

- Generates realistic sensor data every 60 seconds
- Includes pH, E.coli, turbidity, TDS, temperature readings
- Simulates normal and abnormal conditions

### 2. **Email Alert System**

- Sends professional emails for critical water quality issues
- Dark-themed HTML emails matching mobile UI
- Multiple government officials notification
- Detailed alert information and recommendations

### 3. **Real-time API Control**

- Start/stop simulation via API endpoints
- Get real-time status and data
- Frontend dashboard integration

### 4. **Production Optimizations**

- Auto-initialization in production environment
- Graceful shutdown handling
- Comprehensive error logging
- Health check endpoints for monitoring

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Simulation Not Starting**

```bash
# Check logs for initialization errors
# Verify WorkingSensorSimulation service exists
# Check environment variables
```

#### 2. **Email Alerts Not Sending**

```bash
# Verify EMAIL_USER and EMAIL_PASS are set
# Check Gmail App Password configuration
# Test with: curl -X POST /api/test/email
```

#### 3. **CORS Errors**

```bash
# Verify CORS_ORIGIN matches frontend URL exactly
# Check FRONTEND_URL environment variable
```

#### 4. **Health Check Failures**

```bash
# Ensure /health endpoint returns 200 status
# Check server startup logs
# Verify PORT configuration
```

## 📊 Monitoring Production

### Key Metrics to Monitor:

1. **Health Status**: `/api/health` should return 200
2. **Simulation Status**: Check if simulation is running
3. **Email Delivery**: Monitor email sending success
4. **API Response Times**: Ensure fast response times
5. **Error Rates**: Watch for 5xx errors in logs

### Logging Output:

```
🚀 AquaAlert Backend Server running on port 3001
🔥 Initializing Working Sensor Simulation...
✅ Working Sensor Simulation initialized
🔄 Auto-initializing working simulation for production...
📧 Email alerts configured for government officials
```

## 🎉 Success Indicators

Your deployment is successful when you see:

- ✅ Health check returns "Working Simulation" status
- ✅ Simulation can be started via API
- ✅ Sensor data is generated every minute
- ✅ Email alerts work for critical conditions
- ✅ Frontend can connect and control simulation
- ✅ No CORS errors in browser console

## 🔄 Continuous Deployment

Every time you push to GitHub:

1. Render automatically rebuilds
2. Uses `server-working.js` as main server
3. Initializes working simulation
4. Maintains email alert functionality
5. Preserves all simulation features

Your AquaAlert working simulation is now production-ready! 🎯

## 📞 Support

If you encounter issues:

1. Check Render deployment logs
2. Verify environment variables
3. Test individual API endpoints
4. Review email configuration
5. Monitor simulation status

**Working Simulation Deployment: Complete!** ✅
