// Demo Sensor Simulation - Works without Firebase Admin SDK
import nodemailer from 'nodemailer';

// Government officials email list - same as in GovernmentAlertService
const GOVERNMENT_OFFICIALS = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@assam.gov.in',
    position: 'District Health Officer',
    district: 'Jorhat',
    alertTypes: ['water_quality', 'health_outbreak', 'critical_alerts']
  },
  {
    name: 'Mrs. Priya Sharma',
    email: 'priya.sharma@assam.gov.in', 
    position: 'Water Quality Supervisor',
    district: 'Majuli',
    alertTypes: ['water_quality', 'turbidity_high', 'ph_abnormal']
  },
  {
    name: 'Mr. Bhaskar Goswami',
    email: 'bhaskar.goswami@assam.gov.in',
    position: 'Public Health Director',
    district: 'Jorhat',
    alertTypes: ['daily_summary', 'critical_alerts', 'health_outbreak']
  },
  {
    name: 'Dr. Anita Das',
    email: 'anita.das@assam.gov.in',
    position: 'Environmental Health Officer', 
    district: 'Majuli',
    alertTypes: ['water_quality', 'environmental_alerts', 'daily_summary']
  },
  {
    name: 'Dr. Suresh Kalita',
    email: 'suresh.kalita@assam.gov.in',
    position: 'Chief Medical Officer',
    district: 'Jorhat',
    alertTypes: ['critical_alerts', 'health_outbreak', 'daily_summary']
  },
  {
    name: 'Mrs. Rekha Devi',
    email: 'rekha.devi@assam.gov.in',
    position: 'ASHA Coordinator',
    district: 'Majuli',
    alertTypes: ['water_quality', 'community_alerts', 'health_outbreak']
  },
  {
    name: 'Mr. Dinesh Borah',
    email: 'dinesh.borah@assam.gov.in',
    position: 'Water Resources Engineer',
    district: 'Jorhat',
    alertTypes: ['water_quality', 'infrastructure_alerts', 'daily_summary']
  },
  {
    name: 'Dr. Manju Gogoi',
    email: 'manju.gogoi@assam.gov.in',
    position: 'District Surveillance Officer',
    district: 'Majuli',
    alertTypes: ['health_outbreak', 'critical_alerts', 'daily_summary']
  }
];

// Sensor simulation configuration
const SENSOR_CONFIGS = [
  {
    id: 'SENSOR_001_MAJULI_V1',
    name: 'Majuli Village 1 Water Station',
    location: { lat: 26.97, lng: 94.17, village: 'Majuli Village 1', district: 'Jorhat' },
    type: 'water_quality',
    status: 'active',
    lastMaintenance: '2025-09-01',
    installation: '2025-08-15'
  },
  {
    id: 'SENSOR_002_MAJULI_V2',
    name: 'Majuli Village 2 Water Station',
    location: { lat: 26.95, lng: 94.15, village: 'Majuli Village 2', district: 'Jorhat' },
    type: 'water_quality',
    status: 'active',
    lastMaintenance: '2025-09-05',
    installation: '2025-08-20'
  },
  {
    id: 'SENSOR_003_MAJULI_V3',
    name: 'Majuli Village 3 Water Station',
    location: { lat: 26.93, lng: 94.13, village: 'Majuli Village 3', district: 'Jorhat' },
    type: 'water_quality',
    status: 'active',
    lastMaintenance: '2025-08-28',
    installation: '2025-08-10'
  }
];

// Normal ranges for water quality parameters
const NORMAL_RANGES = {
  ph: { min: 6.5, max: 8.5, optimal: 7.2 },
  turbidity: { min: 0, max: 10, optimal: 2 },
  tds: { min: 200, max: 500, optimal: 300 },
  ecoli: { min: 0, max: 5, optimal: 0 },
  temperature: { min: 15, max: 35, optimal: 25 },
  flowRate: { min: 1.0, max: 5.0, optimal: 2.5 },
  dissolvedOxygen: { min: 5.0, max: 12.0, optimal: 8.0 }
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  critical: {
    ph: { min: 5.5, max: 9.0 },
    ecoli: { max: 10 },
    turbidity: { max: 15 },
    tds: { max: 600 }
  },
  warning: {
    ph: { min: 6.0, max: 8.8 },
    ecoli: { max: 5 },
    turbidity: { max: 12 },
    tds: { max: 550 }
  }
};

class DemoSensorSimulation {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.sensors = new Map();
    this.recentReadings = [];
    this.recentAlerts = [];
    this.setupEmailTransporter();
    this.initializeSensors();
  }

  setupEmailTransporter() {
    // Setup real email transporter for government alerts
    try {
      this.emailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Use government SMTP server in production
        port: 587,
        secure: false,
        auth: {
          user: process.env.GOV_EMAIL_USER || process.env.EMAIL_USER || 'aquaalert.system@gmail.com',
          pass: process.env.GOV_EMAIL_PASS || process.env.EMAIL_PASS || 'demo-password'
        }
      });
      
      console.log('📧 Email transporter initialized for government alerts');
    } catch (error) {
      console.warn('⚠️ Email transporter setup failed, using demo mode:', error.message);
      // Fallback to demo mode if email setup fails
      this.emailTransporter = {
        sendMail: async (options) => {
          console.log('📧 Demo Email Alert (Real SMTP failed):', {
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
            subject: options.subject,
            recipientCount: Array.isArray(options.to) ? options.to.length : 1
          });
          return { messageId: 'demo-' + Date.now() };
        }
      };
    }
  }

  initializeSensors() {
    SENSOR_CONFIGS.forEach(config => {
      this.sensors.set(config.id, {
        ...config,
        lastReading: null,
        alertsSent: 0,
        totalReadings: 0,
        consecutiveAbnormalReadings: 0
      });
    });
  }

  // Generate realistic sensor readings
  generateSensorReading(sensorId) {
    const sensor = this.sensors.get(sensorId);
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    
    // Seasonal and time-based variations
    const seasonalFactor = this.getSeasonalFactor(month);
    const dailyFactor = this.getDailyFactor(hour);
    
    // Base readings with some realistic variation
    let reading = {
      id: `reading_${sensorId}_${Date.now()}`,
      sensorId: sensorId,
      timestamp: now,
      location: sensor.location,
      readings: {
        ph: this.generateParameter('ph', seasonalFactor, dailyFactor),
        turbidity: this.generateParameter('turbidity', seasonalFactor, dailyFactor),
        tds: this.generateParameter('tds', seasonalFactor, dailyFactor),
        ecoli: this.generateParameter('ecoli', seasonalFactor, dailyFactor),
        temperature: this.generateParameter('temperature', seasonalFactor, dailyFactor),
        flowRate: this.generateParameter('flowRate', seasonalFactor, dailyFactor),
        dissolvedOxygen: this.generateParameter('dissolvedOxygen', seasonalFactor, dailyFactor)
      },
      batteryLevel: Math.max(20, 100 - (Math.random() * 5)),
      signalStrength: Math.floor(Math.random() * 40) + 60,
      status: 'online'
    };

    // Frequently simulate sensor issues or extreme readings for better demo
    if (Math.random() < 0.25) { // 25% chance of abnormal readings (increased from 5%)
      reading = this.simulateAbnormalReading(reading, sensor);
    }

    // Sometimes simulate sensor offline (reduced frequency)
    if (Math.random() < 0.01) { // 1% chance of going offline
      reading.status = 'offline';
      reading.batteryLevel = 0;
    }

    return reading;
  }

  generateParameter(param, seasonalFactor, dailyFactor) {
    const range = NORMAL_RANGES[param];
    const baseValue = range.optimal;
    
    // Add seasonal variation (increased impact)
    let value = baseValue + (baseValue * seasonalFactor * 0.2);
    
    // Add daily variation (increased impact)
    value += (baseValue * dailyFactor * 0.15);
    
    // Add significant random variation for realistic data
    const variationRange = (range.max - range.min) * 0.3; // 30% of full range
    const randomVariation = (Math.random() - 0.5) * variationRange;
    value += randomVariation;
    
    // Simulate occasional contamination spikes for critical parameters
    if (param === 'ecoli' && Math.random() < 0.15) { // 15% chance
      value = Math.random() * 20 + 5; // Spike to 5-25 CFU/100ml
    }
    
    if (param === 'ph' && Math.random() < 0.1) { // 10% chance
      value = Math.random() < 0.5 ? 
        5.0 + Math.random() * 0.8 : // Low pH (5.0-5.8)
        8.8 + Math.random() * 1.5;  // High pH (8.8-10.3)
    }
    
    if (param === 'turbidity' && Math.random() < 0.12) { // 12% chance
      value = 12 + Math.random() * 15; // High turbidity (12-27 NTU)
    }
    
    // Ensure within reasonable bounds (but allow extremes for alerts)
    value = Math.max(range.min * 0.5, Math.min(range.max * 2.0, value));
    
    // Round to appropriate decimal places
    return param === 'ecoli' || param === 'tds' ? Math.round(value) : Math.round(value * 100) / 100;
  }

  getSeasonalFactor(month) {
    // Monsoon season (June-September) increases contamination risk
    if (month >= 6 && month <= 9) return 0.8; // Higher contamination in monsoon
    if (month >= 10 && month <= 11) return 0.6; // Post-monsoon issues
    if (month >= 12 || month <= 2) return -0.2; // Winter is generally better
    return 0.1; // Summer moderate risk
  }

  getDailyFactor(hour) {
    // Early morning and late evening tend to have better water quality
    if (hour >= 5 && hour <= 8) return -0.1; // Early morning - better
    if (hour >= 12 && hour <= 16) return 0.2; // Afternoon - worse (heat)
    if (hour >= 20 && hour <= 23) return -0.05; // Evening - slightly better
    return 0; // Night hours
  }

  simulateAbnormalReading(reading, sensor) {
    const abnormalTypes = ['contamination', 'equipment_malfunction', 'seasonal_extreme', 'pollution_event'];
    const type = abnormalTypes[Math.floor(Math.random() * abnormalTypes.length)];

    switch (type) {
      case 'contamination':
        reading.readings.ecoli = Math.floor(Math.random() * 30) + 15; // Very high E.coli (15-45)
        reading.readings.turbidity = Math.random() * 20 + 18; // High turbidity (18-38 NTU)
        reading.readings.ph = 5.0 + Math.random() * 0.7; // Low pH (5.0-5.7)
        reading.readings.tds = Math.random() * 200 + 400; // High TDS (400-600)
        reading.alertType = 'contamination_detected';
        break;
        
      case 'equipment_malfunction':
        reading.readings.ph = Math.random() < 0.5 ? 3.5 + Math.random() * 1.0 : 9.5 + Math.random() * 1.5; // Extreme pH
        reading.batteryLevel = Math.random() * 15; // Very low battery
        reading.signalStrength = Math.random() * 25; // Poor signal
        reading.alertType = 'sensor_malfunction';
        break;
        
      case 'seasonal_extreme':
        // Monsoon contamination
        reading.readings.ecoli = Math.floor(Math.random() * 25) + 8; // High E.coli (8-33)
        reading.readings.turbidity = Math.random() * 25 + 15; // Very high turbidity
        reading.readings.temperature = 30 + Math.random() * 8; // High temperature
        reading.alertType = 'seasonal_contamination';
        break;
        
      case 'pollution_event':
        // Industrial or agricultural pollution
        reading.readings.ph = 8.5 + Math.random() * 2.0; // High pH (8.5-10.5)
        reading.readings.tds = Math.random() * 300 + 500; // Very high TDS (500-800)
        reading.readings.dissolvedOxygen = Math.random() * 3.0 + 1.0; // Low oxygen (1-4)
        reading.readings.turbidity = Math.random() * 20 + 10; // High turbidity
        reading.alertType = 'pollution_detected';
        break;
        reading.readings.temperature = 38 + Math.random() * 5; // High temperature
        reading.readings.tds = 700 + Math.random() * 200; // High TDS
        reading.alertType = 'seasonal_extreme';
        break;
    }

    sensor.consecutiveAbnormalReadings++;
    return reading;
  }

  // Analyze reading and determine if alerts should be sent
  async analyzeAndAlert(reading) {
    const sensor = this.sensors.get(reading.sensorId);
    const alerts = [];

    // Check each parameter against thresholds
    const readings = reading.readings;
    
    // Critical alerts
    if (readings.ph < ALERT_THRESHOLDS.critical.ph.min || readings.ph > ALERT_THRESHOLDS.critical.ph.max) {
      alerts.push({
        type: 'critical',
        parameter: 'pH',
        value: readings.ph,
        message: `Critical pH level detected: ${readings.ph}`,
        action: 'Immediate water treatment required'
      });
    }

    if (readings.ecoli > ALERT_THRESHOLDS.critical.ecoli.max) {
      alerts.push({
        type: 'critical',
        parameter: 'E.coli',
        value: readings.ecoli,
        message: `Dangerous E.coli levels detected: ${readings.ecoli} CFU/100ml`,
        action: 'Stop water consumption immediately, alert health authorities'
      });
    }

    if (readings.turbidity > ALERT_THRESHOLDS.critical.turbidity.max) {
      alerts.push({
        type: 'critical',
        parameter: 'Turbidity',
        value: readings.turbidity,
        message: `High turbidity detected: ${readings.turbidity} NTU`,
        action: 'Check water filtration systems'
      });
    }

    // Warning alerts
    if (readings.ph < ALERT_THRESHOLDS.warning.ph.min || readings.ph > ALERT_THRESHOLDS.warning.ph.max) {
      alerts.push({
        type: 'warning',
        parameter: 'pH',
        value: readings.ph,
        message: `pH level outside normal range: ${readings.ph}`,
        action: 'Monitor closely, consider water treatment'
      });
    }

    // Equipment alerts
    if (reading.batteryLevel < 20) {
      alerts.push({
        type: 'maintenance',
        parameter: 'Battery',
        value: reading.batteryLevel,
        message: `Low battery level: ${reading.batteryLevel}%`,
        action: 'Schedule battery replacement'
      });
    }

    if (reading.status === 'offline') {
      alerts.push({
        type: 'technical',
        parameter: 'Connectivity',
        value: 'offline',
        message: 'Sensor gone offline',
        action: 'Check sensor connectivity and power'
      });
    }

    // Send alerts if any found
    if (alerts.length > 0) {
      await this.sendAlerts(reading, alerts);
      sensor.alertsSent += alerts.length;
      
      // Store alert in memory for demo
      this.recentAlerts.push({
        id: `alert_${Date.now()}`,
        sensorId: reading.sensorId,
        location: reading.location,
        timestamp: reading.timestamp,
        alerts: alerts,
        reading: reading.readings,
        severity: alerts.some(a => a.type === 'critical') ? 'critical' : 'warning',
        status: 'active',
        acknowledgedBy: null,
        acknowledgedAt: null
      });
    } else {
      sensor.consecutiveAbnormalReadings = 0; // Reset if reading is normal
    }

    return alerts;
  }

  async sendAlerts(reading, alerts) {
    const sensor = this.sensors.get(reading.sensorId);
    const location = sensor.location;

    // Prepare email content
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    const warningAlerts = alerts.filter(a => a.type === 'warning');
    
    if (criticalAlerts.length > 0) {
      await this.sendEmailAlert('critical', reading, criticalAlerts);
    }
    
    if (warningAlerts.length > 0) {
      await this.sendEmailAlert('warning', reading, warningAlerts);
    }
  }

  // Fetch government officials dynamically from Firebase
  async fetchGovernmentOfficials() {
    try {
      // Try to connect to Firebase
      const { db } = await import('../firebase-admin.js');
      
      const officialsSnapshot = await db.collection('users')
        .where('role', '==', 'government')
        .where('isActive', '==', true)
        .get();
      
      const officials = [];
      officialsSnapshot.forEach(doc => {
        const data = doc.data();
        officials.push({
          id: doc.id,
          name: data.name || data.displayName,
          email: data.email,
          position: data.position || data.jobTitle,
          district: data.district || data.location,
          alertTypes: data.alertTypes || ['water_quality', 'critical_alerts'],
          department: data.department,
          phone: data.phone,
          isActive: data.isActive
        });
      });
      
      console.log(`📧 Loaded ${officials.length} government officials from Firebase`);
      return officials;
    } catch (error) {
      console.warn('⚠️ Could not fetch officials from Firebase, using fallback list:', error.message);
      
      // Fallback to hardcoded list if Firebase is not available
      return GOVERNMENT_OFFICIALS;
    }
  }

  async sendEmailAlert(severity, reading, alerts) {
    const sensor = this.sensors.get(reading.sensorId);
    const location = sensor.location;

    // Fetch current government officials from Firebase
    const governmentOfficials = await this.fetchGovernmentOfficials();

    // Determine which officials should receive this alert
    const alertType = severity === 'critical' ? 'critical_alerts' : 'water_quality';
    const recipients = governmentOfficials.filter(official => 
      official.alertTypes.includes(alertType) || 
      official.alertTypes.includes('water_quality') ||
      (severity === 'critical' && official.alertTypes.includes('critical_alerts')) ||
      official.district === location.district // Location-based alerts
    );

    // Prepare detailed alert content
    const alertDetails = alerts.map(alert => 
      `• ${alert.parameter}: ${alert.value} (${alert.type.toUpperCase()}) - ${alert.message}`
    ).join('\n');

    const emailSubject = `🚨 ${severity.toUpperCase()} Water Quality Alert - ${location.village}, ${location.district}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: ${severity === 'critical' ? '#dc2626' : '#ea580c'};">
          ${severity === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING'} Water Quality Alert
        </h2>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Location Information:</h3>
          <p><strong>Sensor:</strong> ${sensor.name}</p>
          <p><strong>Village:</strong> ${location.village}</p>
          <p><strong>District:</strong> ${location.district}</p>
          <p><strong>Coordinates:</strong> ${location.lat}, ${location.lng}</p>
          <p><strong>Time:</strong> ${new Date(reading.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>

        <div style="background: ${severity === 'critical' ? '#fef2f2' : '#fff7ed'}; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Alert Details:</h3>
          <pre style="white-space: pre-wrap; font-family: monospace;">${alertDetails}</pre>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Current Water Quality Readings:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>pH Level:</strong> ${reading.readings.ph}</p>
            <p><strong>E.coli:</strong> ${reading.readings.ecoli} CFU/100ml</p>
            <p><strong>Turbidity:</strong> ${reading.readings.turbidity} NTU</p>
            <p><strong>TDS:</strong> ${reading.readings.tds} mg/L</p>
            <p><strong>Temperature:</strong> ${reading.readings.temperature}°C</p>
            <p><strong>Flow Rate:</strong> ${reading.readings.flowRate} L/min</p>
          </div>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Recommended Actions:</h3>
          ${alerts.map(alert => `<p>• ${alert.action}</p>`).join('')}
          ${severity === 'critical' ? 
            '<p style="color: #dc2626; font-weight: bold;">⚠️ IMMEDIATE ACTION REQUIRED - Public health risk detected</p>' : 
            '<p style="color: #ea580c;">� Monitor situation and take preventive measures</p>'
          }
        </div>

        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated alert from AquaAlert Water Quality Monitoring System.<br>
          For technical support, contact: support@aquaalert.gov.in
        </p>
      </div>
    `;

    try {
      // Send email to all relevant officials
      const emailList = recipients.map(official => `${official.name} <${official.email}>`);
      
      // Always include specific requested emails
      const specificAlertEmails = ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'];
      
      await this.emailTransporter.sendMail({
        from: 'AquaAlert System <noreply@aquaalert.gov.in>',
        to: emailList,
        cc: ['emergency@assam.gov.in', 'water.monitoring@assam.gov.in', ...specificAlertEmails], // Always CC emergency contacts and specific emails
        subject: emailSubject,
        html: emailContent,
        priority: severity === 'critical' ? 'high' : 'normal'
      });

      console.log(`📧 ${severity.toUpperCase()} alert sent to ${recipients.length} officials + 2 specific emails for ${reading.sensorId}`);
      console.log(`📬 Recipients: ${recipients.map(r => r.name).join(', ')}`);
      console.log(`📬 CC Recipients: emergency@assam.gov.in, water.monitoring@assam.gov.in, ${specificAlertEmails.join(', ')}`);
      
      return { success: true, recipientCount: recipients.length + specificAlertEmails.length };
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return { success: false, error: error.message };
    }
  }

  // Main simulation loop
  async runSimulation() {
    if (this.isRunning) {
      console.log('Simulation already running...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting demo sensor simulation...');

    // Generate initial readings for all sensors immediately
    console.log('📊 Generating initial sensor readings...');
    for (const [sensorId, sensor] of this.sensors) {
      const reading = this.generateSensorReading(sensorId);
      this.recentReadings.push(reading);
      
      // Update sensor with initial reading
      sensor.lastReading = reading;
      sensor.totalReadings++;
      
      console.log(`📊 Initial ${sensorId}: pH=${reading.readings.ph}, E.coli=${reading.readings.ecoli}, Status=${reading.status}`);
    }

    this.intervalId = setInterval(async () => {
      try {
        for (const [sensorId, sensor] of this.sensors) {
          // Generate new reading
          const reading = this.generateSensorReading(sensorId);
          
          // Store in memory for demo
          this.recentReadings.push(reading);
          
          // Keep only last 100 readings
          if (this.recentReadings.length > 100) {
            this.recentReadings = this.recentReadings.slice(-100);
          }
          
          // Analyze and send alerts if needed
          const alerts = await this.analyzeAndAlert(reading);
          
          // Update sensor stats
          sensor.lastReading = reading;
          sensor.totalReadings++;
          
          console.log(`📊 ${sensorId}: pH=${reading.readings.ph}, E.coli=${reading.readings.ecoli}, Turbidity=${reading.readings.turbidity}, TDS=${reading.readings.tds}, Status=${reading.status}${alerts.length > 0 ? ` 🚨 ALERTS: ${alerts.length}` : ' ✅ Normal'}`);
        }
      } catch (error) {
        console.error('Simulation error:', error);
      }
    }, 10000); // Every 10 seconds for demo

    console.log('✅ Demo sensor simulation started! Initial readings generated, updates every 10 seconds.');
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Demo sensor simulation stopped.');
  }

  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      sensors: Array.from(this.sensors.values()).map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        location: sensor.location,
        status: sensor.status,
        totalReadings: sensor.totalReadings,
        alertsSent: sensor.alertsSent,
        lastReading: sensor.lastReading?.readings || null
      })),
      recentReadings: this.recentReadings.slice(-20), // Last 20 readings
      recentAlerts: this.recentAlerts.slice(-10) // Last 10 alerts
    };
  }

  // Get demo data for API
  getDemoSensors() {
    return Array.from(this.sensors.values()).map(sensor => ({
      ...sensor,
      // Include recent readings in sensor data
      lastReading: sensor.lastReading?.readings || null,
      lastSeen: sensor.lastReading?.timestamp || new Date(),
      batteryLevel: sensor.lastReading?.batteryLevel || 85,
      signalStrength: sensor.lastReading?.signalStrength || 75,
      // Add status from most recent reading
      status: sensor.lastReading?.status || sensor.status || 'active'
    }));
  }

  getDemoReadings(sensorId = null, limit = 20) {
    let readings = this.recentReadings;
    if (sensorId) {
      readings = readings.filter(r => r.sensorId === sensorId);
    }
    return readings.slice(-limit);
  }

  getDemoAlerts(limit = 20, severity = null, sensorId = null) {
    let alerts = this.recentAlerts;
    
    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    // Filter by sensorId if specified
    if (sensorId) {
      alerts = alerts.filter(alert => alert.sensorId === sensorId);
    }
    
    return alerts.slice(-limit);
  }

  // Send daily summary report to all government officials
  async sendDailySummaryReport() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Get daily statistics
    const dailyReadings = this.recentReadings.filter(r => new Date(r.timestamp) >= yesterday);
    const dailyAlerts = this.recentAlerts.filter(a => new Date(a.timestamp) >= yesterday);
    
    const stats = {
      totalSensors: this.sensors.size,
      activeSensors: Array.from(this.sensors.values()).filter(s => s.status === 'active').length,
      totalReadings: dailyReadings.length,
      totalAlerts: dailyAlerts.length,
      criticalAlerts: dailyAlerts.filter(a => a.severity === 'critical').length,
      warningAlerts: dailyAlerts.filter(a => a.severity === 'warning').length
    };

    // Fetch current government officials from Firebase
    const governmentOfficials = await this.fetchGovernmentOfficials();
    
    // Get officials who receive daily summaries
    const recipients = governmentOfficials.filter(official => 
      official.alertTypes.includes('daily_summary') ||
      official.position.toLowerCase().includes('director') ||
      official.position.toLowerCase().includes('officer')
    );

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px;">
        <h2 style="color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
          📊 AquaAlert Daily Water Quality Summary Report
        </h2>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Report Period:</h3>
          <p><strong>Date:</strong> ${today.toDateString()}</p>
          <p><strong>Coverage:</strong> Last 24 hours (${yesterday.toLocaleString()} - ${today.toLocaleString()})</p>
        </div>

        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📈 System Overview:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p><strong>Total Sensors:</strong> ${stats.totalSensors}</p>
              <p><strong>Active Sensors:</strong> ${stats.activeSensors}</p>
              <p><strong>Data Points Collected:</strong> ${stats.totalReadings}</p>
            </div>
            <div>
              <p><strong>Total Alerts:</strong> ${stats.totalAlerts}</p>
              <p style="color: #dc2626;"><strong>Critical Alerts:</strong> ${stats.criticalAlerts}</p>
              <p style="color: #ea580c;"><strong>Warning Alerts:</strong> ${stats.warningAlerts}</p>
            </div>
          </div>
        </div>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>🚨 Recent Alerts (Last 24 Hours):</h3>
          ${dailyAlerts.length > 0 ? 
            dailyAlerts.slice(-5).map(alert => `
              <div style="border-left: 4px solid ${alert.severity === 'critical' ? '#dc2626' : '#ea580c'}; padding-left: 10px; margin: 10px 0;">
                <p><strong>${alert.severity.toUpperCase()}:</strong> ${alert.location.village}</p>
                <p><small>${new Date(alert.timestamp).toLocaleString()} - ${alert.alerts.length} issues detected</small></p>
              </div>
            `).join('') : 
            '<p style="color: #059669;">✅ No alerts in the last 24 hours</p>'
          }
        </div>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📍 Sensor Status by Location:</h3>
          ${Array.from(this.sensors.values()).map(sensor => `
            <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
              <strong>${sensor.name}</strong><br>
              <small>Status: ${sensor.status === 'active' ? '🟢 Online' : '🔴 Offline'} | 
              Readings: ${sensor.totalReadings} | 
              Alerts: ${sensor.alertsSent}</small>
            </div>
          `).join('')}
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📋 Recommended Actions:</h3>
          ${stats.criticalAlerts > 0 ? 
            '<p style="color: #dc2626;">⚠️ Immediate attention required for critical water quality issues</p>' : 
            '<p style="color: #059669;">✅ No immediate action required</p>'
          }
          ${stats.warningAlerts > 0 ? 
            '<p style="color: #ea580c;">📋 Monitor warning-level water quality indicators</p>' : ''
          }
          <p>• Continue regular monitoring and maintenance schedule</p>
          <p>• Review sensor performance and battery levels</p>
          <p>• Verify community notification systems are operational</p>
        </div>

        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          This automated daily report covers water quality monitoring for Majuli district.<br>
          For detailed analysis or technical support: <a href="mailto:support@aquaalert.gov.in">support@aquaalert.gov.in</a><br>
          Emergency contacts: <a href="mailto:emergency@assam.gov.in">emergency@assam.gov.in</a>
        </p>
      </div>
    `;

    try {
      const emailList = recipients.map(official => `${official.name} <${official.email}>`);
      
      // Include specific requested emails in daily reports
      const specificAlertEmails = ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'];
      
      await this.emailTransporter.sendMail({
        from: 'AquaAlert Daily Reports <reports@aquaalert.gov.in>',
        to: emailList,
        cc: ['director@assam.gov.in', 'emergency@assam.gov.in', ...specificAlertEmails],
        subject: `📊 AquaAlert Daily Summary - ${today.toDateString()} | ${stats.totalAlerts} Alerts`,
        html: emailContent,
        priority: 'normal'
      });

      console.log(`📊 Daily summary report sent to ${recipients.length} government officials`);
      console.log(`📬 Summary Recipients: ${recipients.map(r => r.name).join(', ')}`);
      
      return { 
        success: true, 
        recipientCount: recipients.length, 
        stats,
        reportDate: today.toDateString() 
      };
    } catch (error) {
      console.error('Failed to send daily summary report:', error);
      return { success: false, error: error.message };
    }
  }
}

export default DemoSensorSimulation;