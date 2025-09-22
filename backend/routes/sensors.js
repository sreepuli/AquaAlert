import express from 'express';
import DemoSensorSimulation from '../services/demoSensorSimulation.js';
import WorkingSensorSimulation from '../services/workingSensorSimulation.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Initialize sensor simulation
let sensorSimulation = null;

// Helper function to ensure sensor simulation is initialized
const initializeSensorSimulation = async () => {
  if (!sensorSimulation) {
    try {
      console.log('🔥 Using Working Sensor Simulation with real sensor data');
      sensorSimulation = new WorkingSensorSimulation();
    } catch (error) {
      console.log('⚠️ Working simulation failed, falling back to demo');
      console.log('Error:', error.message);
      sensorSimulation = new DemoSensorSimulation();
    }
  }
  return sensorSimulation;
};

// Test environment variables
router.get('/sensors/env-test', (req, res) => {
  res.json({
    DEMO_MODE: process.env.DEMO_MODE,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    allEnvKeys: Object.keys(process.env).filter(key => !key.includes('PASSWORD') && !key.includes('SECRET'))
  });
});

// Debug endpoint to check simulation type
router.get('/sensors/simulation/debug', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    console.log('🐛 Debug: Simulation class =', simulation.constructor.name);
    console.log('🐛 Debug: Available methods =', Object.getOwnPropertyNames(Object.getPrototypeOf(simulation)));
    
    res.json({
      success: true,
      data: {
        simulationClass: simulation.constructor.name,
        availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(simulation)),
        simulationStatus: simulation.getSimulationStatus(),
        sensors: simulation.getDemoSensors(),
        recentReadings: simulation.getDemoReadings(null, 3)
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start sensor simulation
router.post('/sensors/simulation/start', async (req, res) => {
  try {
    console.log('🚀 Starting simulation - DEMO_MODE:', process.env.DEMO_MODE);
    const simulation = await initializeSensorSimulation();
    console.log('🚀 Simulation class:', simulation.constructor.name);
    
    // Start the simulation
    const result = await simulation.runSimulation();
    console.log('🚀 Simulation started:', result);
    
    res.json({
      success: true,
      message: 'Sensor simulation started successfully',
      status: simulation.getSimulationStatus(),
      mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'firebase'
    });
  } catch (error) {
    console.error('Failed to start sensor simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start sensor simulation',
      error: error.message
    });
  }
});

// Stop sensor simulation
router.post('/sensors/simulation/stop', (req, res) => {
  try {
    if (sensorSimulation) {
      sensorSimulation.stopSimulation();
    }
    
    res.json({
      success: true,
      message: 'Sensor simulation stopped successfully'
    });
  } catch (error) {
    console.error('Failed to stop sensor simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop sensor simulation',
      error: error.message
    });
  }
});

// Get simulation status
router.get('/sensors/simulation/status', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    const status = simulation.getSimulationStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Failed to get simulation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get simulation status',
      error: error.message
    });
  }
});

// Send daily summary report to all government officials
router.post('/sensors/send-daily-report', async (req, res) => {
  try {
    console.log('📊 Manual daily report request received');
    const simulation = await initializeSensorSimulation();
    
    // Check if simulation has the sendDailySummaryReport method
    if (typeof simulation.sendDailySummaryReport === 'function') {
      const result = await simulation.sendDailySummaryReport();
      
      res.json({
        success: true,
        message: 'Daily summary report sent successfully',
        data: result
      });
    } else {
      // Fallback for simulations that don't have this method
      res.json({
        success: true,
        message: 'Daily report feature not available in current simulation mode',
        data: { 
          recipientCount: 0, 
          note: 'Using demo simulation without email capability' 
        }
      });
    }
  } catch (error) {
    console.error('Failed to send daily report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send daily summary report',
      error: error.message
    });
  }
});

// Get sensor data (alias for /sensors endpoint)
router.get('/sensors/data', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    
    if (process.env.DEMO_MODE === 'true') {
      // Demo mode - return simulated sensors
      const sensors = simulation.getDemoSensors();
      return res.json({
        success: true,
        sensors: sensors,
        total: sensors.length,
        mode: 'demo'
      });
    }
    
    // Firebase mode
    const { db } = await import('../firebase-admin.js');
    const sensorsSnapshot = await db.collection('sensors').get();
    
    const sensors = [];
    sensorsSnapshot.forEach(doc => {
      sensors.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      sensors: sensors,
      total: sensors.length,
      mode: 'firebase'
    });
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor data',
      error: error.message
    });
  }
});

// Get all sensors (Firebase handles real-time updates, this is for REST API access)
router.get('/sensors', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    
    // Use working simulation or demo sensors
    const sensors = simulation.getDemoSensors();
    
    res.json({
      success: true,
      data: sensors,
      total: sensors.length,
      mode: simulation.constructor.name === 'WorkingSensorSimulation' ? 'working' : 'demo'
    });
  } catch (error) {
    console.error('Failed to fetch sensors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensors',
      error: error.message
    });
  }
});

// Get sensor readings with filtering and pagination
router.get('/sensors/:sensorId/readings', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { limit = 50 } = req.query;
    
    const simulation = await initializeSensorSimulation();
    
    // Use working simulation readings
    const readings = simulation.getDemoReadings(sensorId, parseInt(limit));
    
    res.json({
      success: true,
      data: readings,
      total: readings.length,
      hasMore: false,
      mode: simulation.constructor.name === 'WorkingSensorSimulation' ? 'working' : 'demo'
    });
  } catch (error) {
    console.error('Failed to fetch sensor readings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor readings',
      error: error.message
    });
  }
});

// Get alerts with filtering
router.get('/alerts', async (req, res) => {
  try {
    const { severity, limit = 20, sensorId } = req.query;
    
    const simulation = await initializeSensorSimulation();
    
    // Use working simulation alerts
    const alerts = simulation.getDemoAlerts(parseInt(limit), severity, sensorId);
    
    res.json({
      success: true,
      data: alerts,
      total: alerts.length,
      mode: simulation.constructor.name === 'WorkingSensorSimulation' ? 'working' : 'demo'
    });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// Acknowledge alert
router.patch('/alerts/:alertId/acknowledge', [
  body('acknowledgedBy').notEmpty().withMessage('acknowledgedBy is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { alertId } = req.params;
    const { acknowledgedBy, notes } = req.body;
    
    const { db } = await import('../firebase-admin.js');
    const admin = await import('firebase-admin');
    
    await db.collection('alerts').doc(alertId).update({
      status: 'acknowledged',
      acknowledgedBy,
      acknowledgedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: notes || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
});

// Get sensor analytics/statistics
router.get('/sensors/analytics', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const { db } = await import('../firebase-admin.js');
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case 'today':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get sensor count
    const sensorsSnapshot = await db.collection('sensors').get();
    const totalSensors = sensorsSnapshot.size;
    const onlineSensors = sensorsSnapshot.docs.filter(doc => 
      doc.data().status === 'online' || doc.data().status === 'active'
    ).length;
    
    // Get alerts count
    const alertsSnapshot = await db.collection('alerts')
      .where('timestamp', '>=', startTime)
      .get();
    
    const alerts = [];
    alertsSnapshot.forEach(doc => alerts.push(doc.data()));
    
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    
    // Get readings for water quality averages
    const readingsSnapshot = await db.collection('sensor_readings')
      .where('timestamp', '>=', startTime)
      .get();
    
    const readings = [];
    readingsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.readings) {
        readings.push(data.readings);
      }
    });
    
    // Calculate averages
    const averages = {};
    if (readings.length > 0) {
      const parameters = ['ph', 'turbidity', 'tds', 'ecoli', 'temperature', 'flowRate', 'dissolvedOxygen'];
      
      parameters.forEach(param => {
        const values = readings.map(r => r[param]).filter(v => v !== undefined && v !== null);
        if (values.length > 0) {
          averages[param] = {
            average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2),
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2),
            count: values.length
          };
        }
      });
    }
    
    // Alert trends (group by day)
    const alertTrends = {};
    alerts.forEach(alert => {
      const date = alert.timestamp?.toDate ? 
        alert.timestamp.toDate().toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      if (!alertTrends[date]) {
        alertTrends[date] = { total: 0, critical: 0, warning: 0 };
      }
      
      alertTrends[date].total++;
      if (alert.severity === 'critical') {
        alertTrends[date].critical++;
      } else if (alert.severity === 'warning') {
        alertTrends[date].warning++;
      }
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalSensors,
          onlineSensors,
          offlineSensors: totalSensors - onlineSensors,
          totalAlerts,
          criticalAlerts,
          activeAlerts,
          averageUptime: ((onlineSensors / totalSensors) * 100).toFixed(1)
        },
        waterQualityAverages: averages,
        alertTrends: Object.entries(alertTrends).map(([date, data]) => ({
          date,
          ...data
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        timeframe,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch sensor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor analytics',
      error: error.message
    });
  }
});

// Test email alerts (for testing purposes)
router.post('/sensors/test-alert', [
  body('sensorId').notEmpty().withMessage('sensorId is required'),
  body('alertType').isIn(['critical', 'warning', 'maintenance']).withMessage('Invalid alert type'),
  body('recipientEmail').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { sensorId, alertType, recipientEmail } = req.body;
    const simulation = await initializeSensorSimulation();
    
    // Create test reading with alert condition
    const testReading = {
      sensorId,
      timestamp: new Date(),
      location: { village: 'Test Village', district: 'Test District' },
      readings: {
        ph: alertType === 'critical' ? 4.5 : 6.0, // Critical or warning pH
        ecoli: alertType === 'critical' ? 15 : 3,
        turbidity: alertType === 'critical' ? 20 : 8,
        tds: 350,
        temperature: 25,
        flowRate: 2.5,
        dissolvedOxygen: 8.0
      },
      batteryLevel: alertType === 'maintenance' ? 15 : 85,
      signalStrength: 75,
      status: 'online'
    };
    
    // Trigger alert analysis
    const alerts = await simulation.analyzeAndAlert(testReading);
    
    res.json({
      success: true,
      message: `Test ${alertType} alert sent successfully`,
      alertsGenerated: alerts.length,
      testData: testReading
    });
  } catch (error) {
    console.error('Failed to send test alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test alert',
      error: error.message
    });
  }
});

// Patient records endpoint for government dashboard
router.get('/patients', async (req, res) => {
  try {
    // For demo purposes, return mock patient data
    const mockPatients = [
      {
        id: 1,
        name: "Ravi Kumar",
        age: 45,
        gender: "male",
        location: "Majuli Village 1",
        contact: "+91-98765-43210",
        condition: "Waterborne illness",
        symptoms: "Diarrhea, fever, dehydration",
        riskLevel: "high",
        dateAdded: "2025-09-18T10:30:00Z",
        waterQualityExposure: {
          ph: 4.2,
          turbidity: 18.5,
          ecoli: 25,
          exposureDate: "2025-09-17"
        }
      },
      {
        id: 2,
        name: "Priya Sharma",
        age: 32,
        gender: "female",
        location: "Majuli Village 2",
        contact: "+91-87654-32109",
        condition: "Stomach infection",
        symptoms: "Nausea, vomiting",
        riskLevel: "medium",
        dateAdded: "2025-09-19T14:15:00Z",
        waterQualityExposure: {
          ph: 5.8,
          turbidity: 12.0,
          ecoli: 8,
          exposureDate: "2025-09-18"
        }
      },
      {
        id: 3,
        name: "Manoj Bora",
        age: 28,
        gender: "male",
        location: "Majuli Village 3",
        contact: "+91-76543-21098",
        condition: "Preventive checkup",
        symptoms: "None",
        riskLevel: "low",
        dateAdded: "2025-09-20T09:00:00Z",
        waterQualityExposure: {
          ph: 7.1,
          turbidity: 3.2,
          ecoli: 0,
          exposureDate: "2025-09-19"
        }
      }
    ];

    const statistics = {
      total: mockPatients.length,
      highRisk: mockPatients.filter(p => p.riskLevel === 'high').length,
      recentCases: mockPatients.filter(p => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(p.dateAdded) > weekAgo;
      }).length,
      criticalConditions: mockPatients.filter(p => p.riskLevel === 'high' && p.symptoms !== 'None').length
    };

    res.json({
      success: true,
      patients: mockPatients,
      statistics: statistics
    });
  } catch (error) {
    console.error('Failed to fetch patient records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient records',
      error: error.message
    });
  }
});

export default router;