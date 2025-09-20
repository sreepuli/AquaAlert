import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { CronJob } from 'cron';

// Import services
import { checkForOutbreakAlerts, checkWaterQualityAlerts } from './alert-service.js';
import GovernmentAlertService from './services/governmentAlertService.js';
import { 
  submitHealthReport, 
  getHealthReportsEndpoint,
  submitWaterQualityReport,
  getWaterQualityReportsEndpoint,
  getAlertsEndpoint,
  acknowledgeAlertEndpoint,
  getDashboardAnalytics,
  getPredictionAnalytics,
  getTrendAnalytics,
  authenticateUser,
  requireRole
} from './api-routes.js';

// Import sensor routes
import sensorRoutes from './routes/sensors.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const governmentAlerts = new GovernmentAlertService();

// ==================== MIDDLEWARE ====================

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AquaAlert Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Public routes
app.post('/api/auth/register', authenticateUser, submitHealthReport);
app.post('/api/auth/login', authenticateUser, submitHealthReport);

// Health data routes
app.post('/api/health/report', authenticateUser, submitHealthReport);
app.get('/api/health/reports', authenticateUser, getHealthReportsEndpoint);

// Water quality routes  
app.post('/api/water/report', authenticateUser, submitWaterQualityReport);
app.get('/api/water/reports', authenticateUser, getWaterQualityReportsEndpoint);

// Alerts routes
app.get('/api/alerts', authenticateUser, getAlertsEndpoint);
app.post('/api/alerts/:id/acknowledge', authenticateUser, acknowledgeAlertEndpoint);

// Analytics routes
app.get('/api/analytics/dashboard', authenticateUser, getDashboardAnalytics);
app.get('/api/analytics/prediction', authenticateUser, requireRole(['asha', 'official']), getPredictionAnalytics);
app.get('/api/analytics/trends', authenticateUser, requireRole(['asha', 'official']), getTrendAnalytics);

// Sensor routes
app.use('/api', sensorRoutes);

// ==================== GOVERNMENT ALERT ENDPOINTS ====================

// Manual trigger for daily government report
app.post('/api/government/send-daily-report', authenticateUser, requireRole(['admin', 'government']), async (req, res) => {
  try {
    console.log('📧 Manual trigger: Sending daily government reports...');
    const result = await governmentAlerts.sendDailySummaryReport();
    
    res.json({
      success: true,
      message: 'Daily government reports sent successfully',
      reportsSent: result.reportsSent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send daily government reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send government reports',
      error: error.message
    });
  }
});

// Manual trigger for critical alert
app.post('/api/government/send-critical-alert', authenticateUser, requireRole(['admin', 'government']), async (req, res) => {
  try {
    const alertData = req.body;
    
    // Validate required fields
    if (!alertData.location || !alertData.description || !alertData.measurements) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: location, description, measurements'
      });
    }

    console.log('🚨 Manual trigger: Sending critical alert...');
    const result = await governmentAlerts.sendCriticalAlert(alertData);
    
    res.json({
      success: true,
      message: 'Critical alert sent to government officials',
      alertsSent: result.alertsSent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send critical alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send critical alert',
      error: error.message
    });
  }
});

// Get government officials list
app.get('/api/government/officials', authenticateUser, requireRole(['admin']), (req, res) => {
  try {
    const officials = governmentAlerts.governmentOfficials.map(official => ({
      name: official.name,
      position: official.position,
      district: official.district,
      alertTypes: official.alertTypes,
      email: official.email.replace(/(.{3}).*@/, '$1***@') // Hide email for security
    }));

    res.json({
      success: true,
      data: officials,
      total: officials.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get officials list',
      error: error.message
    });
  }
});

// Test email connectivity
app.post('/api/government/test-email', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const testAlert = {
      location: 'Test Location - System Check',
      timestamp: new Date().toISOString(),
      description: 'This is a test alert to verify email connectivity',
      measurements: {
        ph: 7.0,
        turbidity: 5.0,
        ecoli: 0,
        temperature: 25.0
      },
      recommendedAction: 'No action required - this is a system test'
    };

    // Send to first official only for testing
    await governmentAlerts.transporter.sendMail({
      from: `"AquaAlert Test System" <${process.env.GOV_EMAIL_USER}>`,
      to: process.env.GOV_EMAIL_USER, // Send to self for testing
      subject: '🧪 AquaAlert Email System Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email System Test Successful</h2>
          <p>This email confirms that the AquaAlert government alert system is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>System Status:</strong> Operational</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// ==================== FIREBASE-BASED GOVERNMENT OFFICIALS MANAGEMENT ====================

// Add government official to Firebase database
app.post('/api/government/officials/add', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    const officialData = {
      ...req.body,
      role: 'government',
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user?.uid || 'system'
    };
    
    // Validate required fields
    if (!officialData.name || !officialData.email || !officialData.position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, position'
      });
    }
    
    const docRef = await db.collection('users').add(officialData);
    
    console.log(`👤 Added government official: ${officialData.name} (${officialData.email})`);
    
    res.json({
      success: true,
      message: 'Government official added successfully',
      id: docRef.id,
      official: {
        id: docRef.id,
        name: officialData.name,
        position: officialData.position,
        district: officialData.district,
        email: officialData.email
      }
    });
  } catch (error) {
    console.error('Failed to add government official:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add government official',
      error: error.message
    });
  }
});

// Get all government officials from Firebase database
app.get('/api/government/officials/firebase', authenticateUser, requireRole(['admin', 'government']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    
    const officialsSnapshot = await db.collection('users')
      .where('role', '==', 'government')
      .orderBy('createdAt', 'desc')
      .get();
    
    const officials = [];
    officialsSnapshot.forEach(doc => {
      const data = doc.data();
      officials.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        position: data.position,
        district: data.district,
        alertTypes: data.alertTypes || ['water_quality', 'critical_alerts'],
        department: data.department,
        phone: data.phone,
        isActive: data.isActive,
        createdAt: data.createdAt
      });
    });
    
    res.json({
      success: true,
      officials: officials,
      total: officials.length,
      source: 'firebase'
    });
  } catch (error) {
    console.error('Failed to fetch government officials from Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government officials',
      error: error.message
    });
  }
});

// Update government official in Firebase
app.put('/api/government/officials/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user?.uid || 'system'
    };
    
    await db.collection('users').doc(id).update(updateData);
    
    console.log(`👤 Updated government official: ${id}`);
    
    res.json({
      success: true,
      message: 'Government official updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Failed to update government official:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update government official',
      error: error.message
    });
  }
});

// Bulk add sample government officials to Firebase
app.post('/api/government/officials/bulk-add', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    
    const sampleOfficials = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@assam.gov.in',
        position: 'District Health Officer',
        district: 'Jorhat',
        alertTypes: ['water_quality', 'health_outbreak', 'critical_alerts'],
        department: 'Health',
        phone: '+91-9876543210'
      },
      {
        name: 'Mrs. Priya Sharma',
        email: 'priya.sharma@assam.gov.in',
        position: 'Water Quality Supervisor',
        district: 'Majuli',
        alertTypes: ['water_quality', 'turbidity_high', 'ph_abnormal'],
        department: 'Water Resources',
        phone: '+91-9876543211'
      },
      {
        name: 'Mr. Bhaskar Goswami',
        email: 'bhaskar.goswami@assam.gov.in',
        position: 'Public Health Director',
        district: 'Jorhat',
        alertTypes: ['daily_summary', 'critical_alerts', 'health_outbreak'],
        department: 'Public Health',
        phone: '+91-9876543212'
      },
      {
        name: 'Dr. Anita Das',
        email: 'anita.das@assam.gov.in',
        position: 'Environmental Health Officer',
        district: 'Majuli',
        alertTypes: ['water_quality', 'environmental_alerts', 'daily_summary'],
        department: 'Environment',
        phone: '+91-9876543213'
      }
    ];
    
    const addedOfficials = [];
    
    for (const officialData of sampleOfficials) {
      const docData = {
        ...officialData,
        role: 'government',
        userType: 'government',
        isActive: true,
        verificationStatus: 'approved',
        createdAt: new Date(),
        createdBy: req.user?.uid || 'system'
      };
      
      const docRef = await db.collection('users').add(docData);
      addedOfficials.push({ id: docRef.id, ...docData });
    }
    
    console.log(`👥 Bulk added ${addedOfficials.length} government officials to Firebase`);
    
    res.json({
      success: true,
      message: `Successfully added ${addedOfficials.length} government officials`,
      officials: addedOfficials,
      total: addedOfficials.length
    });
  } catch (error) {
    console.error('Failed to bulk add government officials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk add government officials',
      error: error.message
    });
  }
});

// Add sample ASHA workers and community members for testing
app.post('/api/users/add-sample-users', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    
    const sampleUsers = [
      // ASHA Workers
      {
        name: 'Rekha Devi',
        email: 'rekha.devi@asha.assam.gov.in',
        role: 'asha',
        userType: 'asha',
        village: 'Kamalabari',
        district: 'Majuli',
        primaryHealthCenter: 'Kamalabari PHC',
        contactNumber: '+91-9876543220',
        supervisorName: 'Dr. Maya Sharma',
        position: 'ASHA Worker',
        alertTypes: ['health_outbreak', 'community_alerts'],
        verificationStatus: 'approved'
      },
      {
        name: 'Mira Gogoi',
        email: 'mira.gogoi@asha.assam.gov.in',
        role: 'asha',
        userType: 'asha',
        village: 'Garmur',
        district: 'Majuli',
        primaryHealthCenter: 'Garmur PHC',
        contactNumber: '+91-9876543221',
        supervisorName: 'Dr. Anita Das',
        position: 'ASHA Worker',
        alertTypes: ['health_outbreak', 'community_alerts'],
        verificationStatus: 'approved'
      },
      // Community Members
      {
        name: 'Ramen Payeng',
        email: 'ramen.payeng@community.in',
        role: 'community',
        userType: 'community',
        village: 'Auniati',
        district: 'Majuli',
        contactNumber: '+91-9876543230',
        familySize: 5,
        primaryConcerns: ['Water Quality', 'Sanitation'],
        position: 'Community Member',
        alertTypes: ['water_quality', 'health_outbreak'],
        verificationStatus: 'active'
      },
      {
        name: 'Lakshmi Saikia',
        email: 'lakshmi.saikia@community.in',
        role: 'community',
        userType: 'community',
        village: 'Dakhinpat',
        district: 'Majuli',
        contactNumber: '+91-9876543231',
        familySize: 4,
        primaryConcerns: ['Child Health', 'Nutrition'],
        position: 'Community Member',
        alertTypes: ['water_quality', 'health_outbreak'],
        verificationStatus: 'active'
      }
    ];
    
    const addedUsers = [];
    
    for (const userData of sampleUsers) {
      const docData = {
        ...userData,
        isActive: true,
        createdAt: new Date(),
        createdBy: req.user?.uid || 'system',
        lastLogin: null
      };
      
      if (userData.role === 'asha') {
        docData.ashaId = userData.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      } else if (userData.role === 'community') {
        docData.communityId = userData.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
      }
      
      const docRef = await db.collection('users').add(docData);
      addedUsers.push({ id: docRef.id, ...docData });
    }
    
    console.log(`👥 Added ${addedUsers.length} sample users (ASHA + Community) to Firebase`);
    
    res.json({
      success: true,
      message: `Successfully added ${addedUsers.length} sample users`,
      users: addedUsers.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        userType: user.userType,
        district: user.district,
        village: user.village
      })),
      total: addedUsers.length
    });
  } catch (error) {
    console.error('Failed to add sample users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample users',
      error: error.message
    });
  }
});

// ==================== END GOVERNMENT ENDPOINTS ====================

// Admin routes (admin only)
app.get('/api/admin/users', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(usersQuery);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({
      success: true,
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.get('/api/admin/system-stats', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    
    // Get counts for different user types
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalUsers: users.length,
      governmentOfficials: users.filter(u => u.role === 'official' || u.role === 'government').length,
      ashaWorkers: users.filter(u => u.role === 'asha').length,
      communityMembers: users.filter(u => u.role === 'community').length,
      pendingVerifications: users.filter(u => u.verificationStatus === 'pending').length,
      activeUsers: users.filter(u => u.isActive === true).length
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system stats' });
  }
});

// Create admin user endpoint (for initial setup)
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;
    
    // Check secret key for security (you should set this as environment variable)
    if (secretKey !== 'AQUAALERT_ADMIN_SECRET_2025') {
      return res.status(403).json({ success: false, message: 'Invalid secret key' });
    }
    
    const { db } = await import('./firebase-admin.js');
    
    // Check if admin already exists
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      return res.status(400).json({ success: false, message: 'Admin user already exists' });
    }
    
    // Create admin user document
    const adminData = {
      email: email,
      name: name,
      role: 'admin',
      userType: 'admin',
      isActive: true,
      verificationStatus: 'approved',
      createdAt: new Date(),
      permissions: ['user_management', 'system_admin', 'verification_admin'],
      lastLogin: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'users'), adminData);
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      adminId: docRef.id,
      email: email
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== SCHEDULED TASKS ====================

// Run alert checks every 15 minutes
const alertCheckJob = new CronJob('*/15 * * * *', async () => {
  console.log('Running scheduled alert checks...');
  try {
    await checkForOutbreakAlerts();
    await checkWaterQualityAlerts();
    console.log('Alert checks completed');
  } catch (error) {
    console.error('Error in scheduled alert checks:', error);
  }
});

// Run daily analytics updates at midnight
const analyticsJob = new CronJob('0 0 * * *', () => {
  console.log('Running daily analytics updates...');
  // Add analytics update logic here
});

// Daily Government Report Job (8:00 AM every day)
const dailyReportJob = new CronJob('0 8 * * *', async () => {
  console.log('📧 Sending daily government reports...');
  try {
    if (process.env.SEND_DAILY_REPORTS === 'true') {
      const result = await governmentAlerts.sendDailySummaryReport();
      console.log(`✅ Daily reports sent: ${result.reportsSent} officials notified`);
    }
  } catch (error) {
    console.error('Daily report error:', error);
  }
}, null, false, 'Asia/Kolkata'); // Indian Standard Time

// ==================== SERVER STARTUP ====================

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 AquaAlert Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    
    // Start scheduled jobs
    alertCheckJob.start();
    analyticsJob.start();
    dailyReportJob.start();
    console.log('⏰ Scheduled jobs started (alerts, analytics, daily reports)');
  });
};

// Graceful shutdown
// Debug endpoint: Check sensor simulation status and data
app.get('/api/debug/simulation', async (req, res) => {
  try {
    // Check demo mode setting
    const demoMode = process.env.DEMO_MODE === 'true';
    
    let simulationData = {};
    
    if (demoMode) {
      // Import demo simulation
      const { default: DemoSensorSimulation } = await import('./services/demoSensorSimulation.js');
      const demoSim = new DemoSensorSimulation();
      
      simulationData = {
        mode: 'demo',
        status: demoSim.getSimulationStatus(),
        sensors: demoSim.getDemoSensors(),
        recentReadings: demoSim.getDemoReadings(null, 5),
        recentAlerts: demoSim.getDemoAlerts(5)
      };
    } else {
      // Import Firebase simulation
      const { default: SensorSimulation } = await import('./services/sensorSimulation.js');
      const firebaseSim = new SensorSimulation();
      
      simulationData = {
        mode: 'firebase',
        status: firebaseSim.getSimulationStatus()
      };
    }
    
    res.json({
      success: true,
      data: simulationData,
      environment: {
        DEMO_MODE: process.env.DEMO_MODE,
        NODE_ENV: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug simulation endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug simulation failed',
      error: error.message
    });
  }
});

// Test specific email addresses
app.post('/api/test/specific-emails', async (req, res) => {
  try {
    const { default: SensorSimulation } = await import('./services/sensorSimulation.js');
    const sensorSim = new SensorSimulation();
    
    // Create a test critical alert to trigger email to specific addresses
    const testReading = {
      sensorId: 'TEST_SPECIFIC_EMAILS',
      timestamp: new Date(),
      location: { village: 'Test Alert Village', district: 'Jorhat' },
      readings: {
        ph: 4.0, // Critical pH
        ecoli: 25, // Very high E.coli
        turbidity: 30, // High turbidity
        tds: 400,
        temperature: 27,
        flowRate: 2.0,
        dissolvedOxygen: 6.5
      },
      batteryLevel: 85,
      signalStrength: 75,
      status: 'online'
    };
    
    // This will trigger the email system
    const alerts = await sensorSim.sendEmailAlert('critical', testReading, [
      {
        type: 'critical',
        parameter: 'pH',
        value: 4.0,
        message: 'Critical pH level detected - TEST ALERT',
        action: 'This is a test alert for specific email addresses'
      },
      {
        type: 'critical',
        parameter: 'E.coli',
        value: 25,
        message: 'High E.coli levels detected - TEST ALERT',
        action: 'This is a test alert for specific email addresses'
      }
    ]);
    
    res.json({
      success: true,
      message: 'Test alert sent to specific email addresses',
      specificEmails: ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'],
      testReading: testReading.readings,
      emailResult: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test specific emails failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test specific emails failed',
      error: error.message
    });
  }
});

// Test email alert system with registered officials
app.post('/api/test/email-alert-system', async (req, res) => {
  try {
    // Test the sensor simulation email system
    const { default: SensorSimulation } = await import('./services/sensorSimulation.js');
    const sensorSim = new SensorSimulation();
    
    // Fetch current government officials
    const officials = await sensorSim.fetchGovernmentOfficials();
    
    // Create a test reading with alert condition
    const testReading = {
      sensorId: 'TEST_SENSOR_EMAIL_SYSTEM',
      timestamp: new Date(),
      location: { village: 'Test Village', district: 'Jorhat' },
      readings: {
        ph: 4.2, // Critical pH
        ecoli: 18, // High E.coli
        turbidity: 22, // High turbidity
        tds: 350,
        temperature: 26,
        flowRate: 2.5,
        dissolvedOxygen: 7.8
      },
      batteryLevel: 85,
      signalStrength: 75,
      status: 'online'
    };
    
    // Test alert generation
    const alerts = await sensorSim.analyzeAndAlert(testReading);
    
    res.json({
      success: true,
      message: 'Email alert system test completed',
      data: {
        registeredOfficials: officials.length,
        officialsList: officials.map(o => ({ 
          name: o.name, 
          email: o.email.replace(/(.{3}).*@/, '$1***@'), // Hide email for security
          position: o.position,
          district: o.district,
          alertTypes: o.alertTypes,
          verificationStatus: o.verificationStatus
        })),
        alertsGenerated: alerts.length,
        alertDetails: alerts,
        testReading: testReading.readings,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Email alert system test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email alert system test failed',
      error: error.message
    });
  }
});

// Get current registered government officials (admin only)
app.get('/api/test/registered-officials', async (req, res) => {
  try {
    const { db } = await import('./firebase-admin.js');
    
    // Query for all government officials
    const officialsSnapshot = await db.collection('users')
      .where('role', 'in', ['government', 'official'])
      .orderBy('createdAt', 'desc')
      .get();
    
    const officials = [];
    officialsSnapshot.forEach(doc => {
      const data = doc.data();
      officials.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        position: data.position || data.designation,
        district: data.district,
        department: data.department,
        verificationStatus: data.verificationStatus,
        isActive: data.isActive,
        alertTypes: data.alertTypes || ['water_quality'],
        createdAt: data.createdAt,
        approvedAt: data.approvedAt
      });
    });
    
    const stats = {
      total: officials.length,
      approved: officials.filter(o => o.verificationStatus === 'approved').length,
      pending: officials.filter(o => o.verificationStatus === 'pending').length,
      active: officials.filter(o => o.isActive === true).length,
      byDistrict: officials.reduce((acc, o) => {
        acc[o.district] = (acc[o.district] || 0) + 1;
        return acc;
      }, {}),
      byRole: officials.reduce((acc, o) => {
        acc[o.role] = (acc[o.role] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      message: 'Retrieved registered government officials',
      data: {
        officials: officials,
        statistics: stats,
        emailRecipients: officials
          .filter(o => o.verificationStatus === 'approved' && o.isActive)
          .map(o => ({ name: o.name, email: o.email, alertTypes: o.alertTypes }))
      }
    });
  } catch (error) {
    console.error('Failed to fetch registered officials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registered officials',
      error: error.message
    });
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  alertCheckJob.stop();
  analyticsJob.stop();
  dailyReportJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  alertCheckJob.stop();
  analyticsJob.stop();
  dailyReportJob.stop();
  process.exit(0);
});

startServer();

export default app;