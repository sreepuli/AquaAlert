import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

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

class SensorSimulation {
  constructor() {
    this.db = admin.firestore();
    this.isRunning = false;
    this.intervalId = null;
    this.sensors = new Map();
    this.setupEmailTransporter();
    this.initializeSensors();
  }

  setupEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'aquaalert.system@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
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

  // Generate realistic sensor readings with some randomness and seasonal patterns
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
      sensorId: sensorId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
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
      batteryLevel: Math.max(20, 100 - (Math.random() * 5)), // Simulate battery drain
      signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100%
      status: 'online'
    };

    // Occasionally simulate sensor issues or extreme readings
    if (Math.random() < 0.05) { // 5% chance of abnormal readings
      reading = this.simulateAbnormalReading(reading, sensor);
    }

    // Sometimes simulate sensor offline
    if (Math.random() < 0.02) { // 2% chance of going offline
      reading.status = 'offline';
      reading.batteryLevel = 0;
    }

    return reading;
  }

  generateParameter(param, seasonalFactor, dailyFactor) {
    const range = NORMAL_RANGES[param];
    const baseValue = range.optimal;
    
    // Add seasonal variation
    let value = baseValue + (baseValue * seasonalFactor * 0.1);
    
    // Add daily variation
    value += (baseValue * dailyFactor * 0.05);
    
    // Add random noise
    const noise = (Math.random() - 0.5) * (range.max - range.min) * 0.1;
    value += noise;
    
    // Ensure within reasonable bounds
    value = Math.max(range.min * 0.8, Math.min(range.max * 1.2, value));
    
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
    const abnormalTypes = ['contamination', 'equipment_malfunction', 'seasonal_extreme'];
    const type = abnormalTypes[Math.floor(Math.random() * abnormalTypes.length)];

    switch (type) {
      case 'contamination':
        reading.readings.ecoli = Math.floor(Math.random() * 20) + 10; // High E.coli
        reading.readings.turbidity = Math.random() * 25 + 15; // High turbidity
        reading.readings.ph = 5.8 + Math.random() * 0.5; // Low pH
        reading.alertType = 'contamination_detected';
        break;
        
      case 'equipment_malfunction':
        reading.readings.ph = Math.random() < 0.5 ? 4.0 : 10.5; // Extreme pH
        reading.batteryLevel = Math.random() * 20; // Low battery
        reading.signalStrength = Math.random() * 30; // Poor signal
        reading.alertType = 'sensor_malfunction';
        break;
        
      case 'seasonal_extreme':
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

    // Store alert in Firebase
    await this.storeAlert(reading, alerts);
  }

  // Fetch government officials dynamically from Firebase
  async fetchGovernmentOfficials() {
    try {
      // Query for both 'government' and 'official' roles to be comprehensive
      const queries = [
        this.db.collection('users').where('role', '==', 'government').where('isActive', '==', true).get(),
        this.db.collection('users').where('role', '==', 'official').where('isActive', '==', true).get(),
        this.db.collection('users').where('verificationStatus', '==', 'approved').where('role', '==', 'government').get()
      ];
      
      const results = await Promise.all(queries);
      const officials = [];
      
      results.forEach(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          officials.push({
            id: doc.id,
            name: data.name || data.displayName,
            email: data.email,
            position: data.position || data.designation || data.jobTitle,
            district: data.district || data.location,
            alertTypes: data.alertTypes || ['water_quality', 'critical_alerts'],
            department: data.department,
            phone: data.phone || data.contactNumber,
            isActive: data.isActive,
            verificationStatus: data.verificationStatus
          });
        });
      });
      
      // Remove duplicates based on email
      const uniqueOfficials = officials.filter((official, index, self) => 
        index === self.findIndex(o => o.email === official.email)
      );
      
      console.log(`📧 Fetched ${uniqueOfficials.length} government officials from Firebase for alerts`);
      return uniqueOfficials;
    } catch (error) {
      console.warn('⚠️ Could not fetch officials from Firebase, using fallback emails:', error.message);
      
      // Fallback to hardcoded list if Firebase is not available
      return [
        {
          name: 'Emergency Contact',
          email: 'emergency@assam.gov.in',
          position: 'Emergency Response',
          district: 'All',
          alertTypes: ['critical_alerts', 'water_quality']
        }
      ];
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
      official.district === location.district || // Location-based alerts
      official.verificationStatus === 'approved' // Only approved officials
    );

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; text-align: center;">
          <h1>🚨 AquaAlert - ${severity.toUpperCase()} Water Quality Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Location: ${location.village}, ${location.district}</h2>
          <p><strong>Sensor ID:</strong> ${reading.sensorId}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          
          <h3>Alert Details:</h3>
          <ul>
            ${alerts.map(alert => `
              <li style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid ${severity === 'critical' ? '#dc2626' : '#f59e0b'};">
                <strong>${alert.parameter}:</strong> ${alert.value}<br>
                <em>${alert.message}</em><br>
                <strong>Action Required:</strong> ${alert.action}
              </li>
            `).join('')}
          </ul>
          
          <h3>Current Water Quality Readings:</h3>
          <table style="width: 100%; border-collapse: collapse; background: white;">
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 8px;">Parameter</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Value</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Normal Range</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">pH Level</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reading.readings.ph}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">6.5 - 8.5</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">E.coli (CFU/100ml)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reading.readings.ecoli}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">0 - 5</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Turbidity (NTU)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reading.readings.turbidity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">0 - 10</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">TDS (ppm)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reading.readings.tds}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">200 - 500</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Temperature (°C)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reading.readings.temperature}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">15 - 35</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 5px;">
            <h4>Immediate Actions Required:</h4>
            <ol>
              <li>Alert local ASHA workers immediately</li>
              <li>Notify village health committee</li>
              <li>Consider alternative water sources</li>
              <li>Increase monitoring frequency</li>
              ${severity === 'critical' ? '<li><strong>Stop water consumption from this source</strong></li>' : ''}
            </ol>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center;">
          <p>AquaAlert Intelligent Water Quality Monitoring System</p>
          <p style="font-size: 12px;">This is an automated alert. For support, contact: support@aquaalert.gov.in</p>
        </div>
      </div>
    `;

    try {
      // Send email to all relevant registered officials
      const emailList = recipients.map(official => `${official.name} <${official.email}>`);
      
      // Always include emergency contacts and specific requested emails
      const emergencyContacts = ['emergency@assam.gov.in', 'water.monitoring@assam.gov.in'];
      const specificAlertEmails = ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'];
      
      // Combine all recipients
      const allRecipients = [...emailList];
      if (emailList.length === 0) {
        allRecipients.push(...emergencyContacts);
      }
      
      await this.emailTransporter.sendMail({
        from: 'AquaAlert System <noreply@aquaalert.gov.in>',
        to: allRecipients,
        cc: [...emergencyContacts, ...specificAlertEmails], // Always CC emergency contacts and specific emails
        subject: `🚨 ${severity.toUpperCase()} Water Quality Alert - ${location.village}, ${location.district}`,
        html: emailHtml,
        priority: severity === 'critical' ? 'high' : 'normal'
      });

      console.log(`📧 ${severity.toUpperCase()} alert sent to ${recipients.length} registered officials + 2 specific emails for ${reading.sensorId}`);
      console.log(`📬 Recipients: ${recipients.map(r => r.name + ' (' + r.email + ')').join(', ')}`);
      console.log(`📬 CC Recipients: ${[...emergencyContacts, ...specificAlertEmails].join(', ')}`);
      
      return { success: true, recipientCount: recipients.length, recipients: recipients.map(r => r.email) };
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return { success: false, error: error.message };
    }
  }

  async storeAlert(reading, alerts) {
    try {
      await this.db.collection('alerts').add({
        sensorId: reading.sensorId,
        location: reading.location,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        alerts: alerts,
        reading: reading.readings,
        severity: alerts.some(a => a.type === 'critical') ? 'critical' : 'warning',
        status: 'active',
        acknowledgedBy: null,
        acknowledgedAt: null
      });
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  // Main simulation loop
  async runSimulation() {
    if (this.isRunning) {
      console.log('Simulation already running...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting sensor simulation...');

    // Store sensor configurations in Firebase
    await this.storeSensorConfigurations();

    // Generate initial readings for all sensors immediately
    console.log('📊 Generating initial sensor readings...');
    for (const [sensorId, sensor] of this.sensors) {
      try {
        const reading = this.generateSensorReading(sensorId);
        
        // Store in Firebase
        await this.storeSensorReading(reading);
        
        // Analyze and send alerts if needed
        const alerts = await this.analyzeAndAlert(reading);
        
        // Update sensor stats
        sensor.lastReading = reading;
        sensor.totalReadings++;
        
        console.log(`📊 Initial ${sensorId}: pH=${reading.readings.ph}, E.coli=${reading.readings.ecoli}, Status=${reading.status}${alerts.length > 0 ? ` 🚨 ALERTS: ${alerts.length}` : ''}`);
      } catch (error) {
        console.error('Error generating initial reading for', sensorId, ':', error);
      }
    }

    this.intervalId = setInterval(async () => {
      try {
        for (const [sensorId, sensor] of this.sensors) {
          // Generate new reading
          const reading = this.generateSensorReading(sensorId);
          
          // Store in Firebase
          await this.storeSensorReading(reading);
          
          // Analyze and send alerts if needed
          const alerts = await this.analyzeAndAlert(reading);
          
          // Update sensor stats
          sensor.lastReading = reading;
          sensor.totalReadings++;
          
          console.log(`📊 ${sensorId}: pH=${reading.readings.ph}, E.coli=${reading.readings.ecoli}, Status=${reading.status}${alerts.length > 0 ? ` 🚨 ALERTS: ${alerts.length}` : ''}`);
        }
      } catch (error) {
        console.error('Simulation error:', error);
      }
    }, 30000); // Every 30 seconds for demo, change to 300000 (5 minutes) for production

    console.log('✅ Sensor simulation started! Initial readings generated, updates every 30 seconds.');
  }

  async storeSensorConfigurations() {
    try {
      for (const [sensorId, sensor] of this.sensors) {
        await this.db.collection('sensors').doc(sensorId).set({
          id: sensorId,
          name: sensor.name,
          location: sensor.location,
          type: sensor.type,
          status: sensor.status,
          lastMaintenance: sensor.lastMaintenance,
          installation: sensor.installation,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      console.log('📱 Sensor configurations stored in Firebase');
    } catch (error) {
      console.error('Failed to store sensor configurations:', error);
    }
  }

  async storeSensorReading(reading) {
    try {
      // Store in sensor_readings collection
      await this.db.collection('sensor_readings').add(reading);
      
      // Update sensor's last reading
      await this.db.collection('sensors').doc(reading.sensorId).update({
        lastReading: reading.readings,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        status: reading.status,
        batteryLevel: reading.batteryLevel,
        signalStrength: reading.signalStrength,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to store sensor reading:', error);
    }
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Sensor simulation stopped.');
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
      }))
    };
  }
}

export default SensorSimulation;