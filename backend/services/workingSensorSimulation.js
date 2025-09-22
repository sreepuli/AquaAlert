import nodemailer from "nodemailer";
import { initializeFirebaseAdmin, adminFirestore } from "../firebase-admin.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

class WorkingSensorSimulation {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.sensors = [];
    this.recentReadings = [];
    this.alerts = [];
    
    // Initialize Firebase
    this.initializeFirebase();
    
    // Setup email transporter
    this.setupEmailTransporter();
    
    // Initialize sensors
    this.initializeSensors();
    
    console.log("✅ WorkingSensorSimulation initialized");
  }

  async initializeFirebase() {
    // Skip Firebase initialization if in demo mode or credentials not available
    if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development') {
      console.log("📝 Running in demo mode - Firebase disabled");
      this.db = null;
      return;
    }
    
    try {
      this.firebaseApp = initializeFirebaseAdmin();
      
      // Only set db if Firebase was successfully initialized
      if (this.firebaseApp) {
        this.db = adminFirestore();
        console.log("✅ Firebase initialized successfully");
      } else {
        console.log("⚠️ Firebase Admin not available - running in demo mode");
        this.db = null;
      }
    } catch (error) {
      console.log("⚠️ Firebase initialization failed:", error.message);
      console.log("📝 Running without Firebase storage - demo mode enabled");
      this.db = null;
    }
  }

  setupEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "srilakshmipulisri@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password"
      },
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  }

  initializeSensors() {
    this.sensors = [
      {
        id: "sensor_001",
        name: "Majuli Water Quality Sensor 1",
        location: { village: "Kamalabari", district: "Majuli" },
        status: "online",
        batteryLevel: 85,
        signalStrength: 75,
        lastUpdated: new Date()
      },
      {
        id: "sensor_002",
        name: "Majuli Water Quality Sensor 2", 
        location: { village: "Auniati", district: "Majuli" },
        status: "online",
        batteryLevel: 92,
        signalStrength: 88,
        lastUpdated: new Date()
      },
      {
        id: "sensor_003",
        name: "Jorhat Water Quality Sensor 1",
        location: { village: "Titabar", district: "Jorhat" },
        status: "online",
        batteryLevel: 78,
        signalStrength: 82,
        lastUpdated: new Date()
      }
    ];
  }

  generateSensorData(sensorId = "sensor_001") {
    const sensor = this.sensors.find(s => s.id === sensorId) || this.sensors[0];
    
    return {
      sensorId: sensor.id,
      timestamp: new Date(),
      location: sensor.location,
      readings: {
        ph: (Math.random() * (9 - 5) + 5).toFixed(2),
        turbidity: (Math.random() * 15).toFixed(2),
        temperature: (Math.random() * (35 - 20) + 20).toFixed(2),
        ecoli: Math.floor(Math.random() * 20), // E.coli count 0-20 CFU/100ml
        tds: Math.floor(Math.random() * (600 - 100) + 100), // Total Dissolved Solids 100-600 ppm
        dissolvedOxygen: (Math.random() * (12 - 4) + 4).toFixed(1), // 4-12 mg/L
        flowRate: (Math.random() * (5 - 0.5) + 0.5).toFixed(1), // 0.5-5 L/min
      },
      batteryLevel: sensor.batteryLevel,
      signalStrength: sensor.signalStrength,
      status: sensor.status
    };
  }

  async storeToFirebase(reading) {
    if (!this.db) {
      console.log("⚠️ Firebase not available, storing in memory only");
      this.recentReadings.unshift(reading);
      this.recentReadings = this.recentReadings.slice(0, 100); // Keep last 100 readings
      return;
    }

    try {
      // Store reading
      await this.db.collection('sensor_readings').add({
        ...reading,
        timestamp: new Date(),
        createdAt: new Date()
      });

      // Update sensor info
      await this.db.collection('sensors').doc(reading.sensorId).set({
        id: reading.sensorId,
        name: this.sensors.find(s => s.id === reading.sensorId)?.name || 'Unknown Sensor',
        location: reading.location,
        status: reading.status,
        batteryLevel: reading.batteryLevel,
        signalStrength: reading.signalStrength,
        lastUpdated: new Date(),
        latestReading: reading.readings
      }, { merge: true });

      console.log(`📊 Data stored for ${reading.sensorId}`);
    } catch (error) {
      console.error("❌ Firebase storage error:", error.message);
      // Fallback to memory storage
      this.recentReadings.unshift(reading);
      this.recentReadings = this.recentReadings.slice(0, 100);
    }
  }

  detectAbnormalReadings(reading) {
    const alerts = [];
    const { readings } = reading;

    // pH abnormal detection
    if (readings.ph < 6.5 || readings.ph > 8.5) {
      alerts.push({
        type: readings.ph < 5.0 || readings.ph > 9.0 ? 'critical' : 'warning',
        parameter: 'pH',
        value: readings.ph,
        message: readings.ph < 6.5 ? 'Low pH detected' : 'High pH detected',
        action: 'Check water source and consider treatment'
      });
    }

    // E.coli detection
    if (readings.ecoli > 5) {
      alerts.push({
        type: readings.ecoli > 15 ? 'critical' : 'warning',
        parameter: 'E.coli',
        value: readings.ecoli,
        message: 'High E.coli levels detected',
        action: 'Immediate water disinfection required'
      });
    }

    // Turbidity detection
    if (readings.turbidity > 10) {
      alerts.push({
        type: readings.turbidity > 20 ? 'critical' : 'warning',
        parameter: 'Turbidity',
        value: readings.turbidity,
        message: 'High turbidity detected',
        action: 'Check filtration system'
      });
    }

    // TDS detection
    if (readings.tds < 200 || readings.tds > 500) {
      alerts.push({
        type: readings.tds < 100 || readings.tds > 600 ? 'critical' : 'warning',
        parameter: 'TDS',
        value: readings.tds,
        message: readings.tds < 200 ? 'Low TDS detected' : 'High TDS detected',
        action: 'Monitor mineral content and treatment systems'
      });
    }

    // Dissolved Oxygen detection
    if (readings.dissolvedOxygen < 5.0) {
      alerts.push({
        type: readings.dissolvedOxygen < 3.0 ? 'critical' : 'warning',
        parameter: 'Dissolved Oxygen',
        value: readings.dissolvedOxygen,
        message: 'Low dissolved oxygen detected',
        action: 'Check aeration and pollution sources'
      });
    }

    return alerts;
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
      
      // Fallback to configured emails from environment + hardcoded officials
      const fallbackEmails = process.env.GOVT_OFFICIALS_EMAIL ? 
        process.env.GOVT_OFFICIALS_EMAIL.split(',').map(email => email.trim()) : 
        ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com', 'manidweep2005@gmail.com'];
      
      return fallbackEmails.map((email, index) => ({
        id: `fallback_${index}`,
        name: `Government Official ${index + 1}`,
        email: email,
        position: 'Health Official',
        district: 'All',
        alertTypes: ['critical_alerts', 'water_quality'],
        department: 'Health Department',
        isActive: true,
        verificationStatus: 'approved'
      }));
    }
  }

  async sendEmailAlert(alertType, reading, alertDetails) {
    if (!this.transporter) {
      console.log("⚠️ Email transporter not configured");
      return;
    }

    try {
      // Fetch current government officials from Firebase
      const governmentOfficials = await this.fetchGovernmentOfficials();

      // Determine which officials should receive this alert
      const alertTypeKey = alertType === 'critical' ? 'critical_alerts' : 'water_quality';
      const recipients = governmentOfficials.filter(official => 
        official.alertTypes.includes(alertTypeKey) || 
        official.alertTypes.includes('water_quality') ||
        (alertType === 'critical' && official.alertTypes.includes('critical_alerts')) ||
        official.district === reading.location.district || // Location-based alerts
        official.verificationStatus === 'approved' // Only approved officials
      );

      // If no Firebase officials found, use all from fallback
      const emailRecipients = recipients.length > 0 ? recipients : governmentOfficials;

      const subject = `🚨 ${alertType.toUpperCase()} Water Quality Alert - ${reading.location.village}`;
      
      const alertList = alertDetails.map(alert => 
        `• ${alert.parameter}: ${alert.value} (${alert.message})`
      ).join('\n');

      const emailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AquaAlert - Water Quality Alert</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1a1a;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; overflow: hidden;">
            
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, ${alertType === 'critical' ? '#dc2626, #b91c1c' : '#f59e0b, #d97706'}); padding: 24px; text-align: center;">
              <div style="margin-bottom: 8px;">
                <span style="font-size: 24px;">🚨</span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: white; letter-spacing: -0.3px;">AquaAlert: Water Quality Alert</h1>
            </div>

            <!-- Alert Information Card -->
            <div style="padding: 24px; background-color: #2d2d2d;">
              <div style="background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Alert Information</h2>
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Alert ID:</span>
                  <span style="color: #ffffff; margin-left: 8px; font-size: 14px;">alert_${Date.now()}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Severity:</span>
                  <span style="color: ${alertType === 'critical' ? '#fbbf24' : '#fbbf24'}; margin-left: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase;">${alertType}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Location:</span>
                  <span style="color: #ffffff; margin-left: 8px; font-size: 14px;">${reading.location.village}, ${reading.location.district}</span>
                </div>
                
                <div style="margin-bottom: 0;">
                  <span style="color: #9ca3af; font-size: 14px; font-weight: 500;">Time:</span>
                  <span style="color: #ffffff; margin-left: 8px; font-size: 14px;">${new Date().toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}</span>
                </div>
              </div>

              <!-- Sensor Readings Table -->
              <div style="background-color: #3a3a3a; border-radius: 8px; padding: 20px;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Sensor Readings</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  ${[
                    { 
                      param: 'pH Level', 
                      value: reading.readings.ph, 
                      unit: '', 
                      status: reading.readings.ph >= 6.5 && reading.readings.ph <= 8.5 ? 'Normal' : 'HIGH',
                      isAbnormal: !(reading.readings.ph >= 6.5 && reading.readings.ph <= 8.5)
                    },
                    { 
                      param: 'Turbidity', 
                      value: reading.readings.turbidity, 
                      unit: ' NTU', 
                      status: reading.readings.turbidity < 10 ? 'Normal' : 'HIGH',
                      isAbnormal: reading.readings.turbidity >= 10
                    },
                    { 
                      param: 'E.coli', 
                      value: reading.readings.ecoli, 
                      unit: ' CFU/100ml', 
                      status: reading.readings.ecoli < 5 ? 'Normal' : 'HIGH',
                      isAbnormal: reading.readings.ecoli >= 5
                    },
                    { 
                      param: 'TDS', 
                      value: reading.readings.tds, 
                      unit: ' ppm', 
                      status: reading.readings.tds >= 200 && reading.readings.tds <= 500 ? 'Normal' : 'HIGH',
                      isAbnormal: !(reading.readings.tds >= 200 && reading.readings.tds <= 500)
                    },
                    { 
                      param: 'Temperature', 
                      value: reading.readings.temperature, 
                      unit: '°C', 
                      status: 'Normal',
                      isAbnormal: false
                    },
                    { 
                      param: 'Dissolved Oxygen', 
                      value: reading.readings.dissolvedOxygen, 
                      unit: ' mg/L', 
                      status: reading.readings.dissolvedOxygen > 5.0 ? 'Normal' : 'LOW',
                      isAbnormal: reading.readings.dissolvedOxygen <= 5.0
                    }
                  ].map((row, index) => `
                    <tr style="border-bottom: ${index === 5 ? 'none' : '1px solid #4a4a4a'};">
                      <td style="padding: 12px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${row.param}</td>
                      <td style="padding: 12px 0; text-align: center; color: #ffffff; font-size: 14px; font-weight: 600;">${row.value}${row.unit}</td>
                      <td style="padding: 12px 0; text-align: right;">
                        ${row.isAbnormal ? 
                          `<span style="color: #ef4444; font-size: 14px; font-weight: 600;">✗ ${row.status}</span>` :
                          `<span style="color: #10b981; font-size: 14px; font-weight: 600;">✓ ${row.status}</span>`
                        }
                      </td>
                    </tr>
                  `).join('')}
                </table>
              </div>

              <!-- Action Required Section (only if there are alerts) -->
              ${alertDetails.length > 0 ? `
              <div style="background-color: ${alertType === 'critical' ? '#7f1d1d' : '#78350f'}; border-radius: 8px; padding: 20px; margin-top: 20px; border-left: 4px solid ${alertType === 'critical' ? '#dc2626' : '#f59e0b'};">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #ffffff;">⚠️ Action Required</h3>
                ${alertDetails.map(alert => `
                  <div style="margin-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${alert.parameter}: ${alert.message}</p>
                    <p style="margin: 0; color: #d1d5db; font-size: 13px;">${alert.action}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 20px; text-align: center; border-top: 1px solid #374151;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">AquaAlert System</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Smart Water Quality Monitoring | Government of Assam</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to specific government officials
      let emailsSent = 0;
      const failedEmails = [];
      
      for (const official of emailRecipients) {
        try {
          await this.transporter.sendMail({
            from: `"AquaAlert System" <${process.env.EMAIL_USER || 'srilakshmipulisri@gmail.com'}>`,
            to: official.email,
            subject: subject,
            html: emailBody
          });
          emailsSent++;
          console.log(`📧 Alert sent to ${official.name} (${official.email})`);
        } catch (emailError) {
          console.error(`❌ Failed to send to ${official.email}:`, emailError.message);
          failedEmails.push(official.email);
        }
      }

      console.log(`📧 ${alertType} alert email sent to ${emailsSent} government officials`);
      return { 
        emailsSent, 
        totalRecipients: emailRecipients.length,
        recipients: emailRecipients.map(o => ({ name: o.name, email: o.email, district: o.district })),
        failedEmails
      };
    } catch (error) {
      console.error("❌ Email sending failed:", error.message);
      return { emailsSent: 0, error: error.message };
    }
  }

  async analyzeAndAlert(reading) {
    const alertDetails = this.detectAbnormalReadings(reading);
    
    if (alertDetails.length > 0) {
      const criticalAlerts = alertDetails.filter(a => a.type === 'critical');
      const alertType = criticalAlerts.length > 0 ? 'critical' : 'warning';
      
      console.log(`⚠️ ${alertType.toUpperCase()} Alert detected for ${reading.sensorId}:`, alertDetails);
      
      // Send email alert
      await this.sendEmailAlert(alertType, reading, alertDetails);
      
      // Store alert in database/memory
      const alertData = {
        id: `alert_${Date.now()}`,
        sensorId: reading.sensorId,
        timestamp: new Date(),
        location: reading.location,
        severity: alertType,
        status: 'active',
        alerts: alertDetails,
        readings: reading.readings
      };
      
      if (this.db) {
        try {
          await this.db.collection('alerts').add(alertData);
        } catch (error) {
          console.error("Failed to store alert:", error);
        }
      }
      
      this.alerts.unshift(alertData);
      this.alerts = this.alerts.slice(0, 50); // Keep last 50 alerts
      
      return alertDetails;
    }
    
    return [];
  }

  async runSimulation() {
    if (this.isRunning) {
      console.log("⚠️ Simulation is already running");
      return;
    }

    console.log("🚀 Starting Working Sensor Simulation...");
    this.isRunning = true;

    const simulateOnce = async () => {
      if (!this.isRunning) return;

      try {
        // Generate data for each sensor
        for (const sensor of this.sensors) {
          const reading = this.generateSensorData(sensor.id);
          
          // Store the reading
          await this.storeToFirebase(reading);
          
          // Check for alerts
          await this.analyzeAndAlert(reading);
          
          console.log(`📊 Generated data for ${sensor.id}:`, {
            ph: reading.readings.ph,
            ecoli: reading.readings.ecoli,
            turbidity: reading.readings.turbidity,
            tds: reading.readings.tds
          });
        }
      } catch (error) {
        console.error("❌ Simulation error:", error.message);
      }
    };

    // Run immediately
    await simulateOnce();

  // Then run every 1 minute
  this.intervalId = setInterval(simulateOnce, 60000);
  console.log("✅ Simulation started - generating data every 1 minute");
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("🛑 Simulation stopped");
  }

  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      sensorsCount: this.sensors.length,
      recentReadingsCount: this.recentReadings.length,
      alertsCount: this.alerts.length,
      lastRun: this.sensors[0]?.lastUpdated || null
    };
  }

  // API compatibility methods
  getDemoSensors() {
    return this.sensors;
  }

  getDemoReadings(sensorId = null, limit = 10) {
    if (sensorId) {
      return this.recentReadings.filter(r => r.sensorId === sensorId).slice(0, limit);
    }
    return this.recentReadings.slice(0, limit);
  }

  getDemoAlerts(limit = 10) {
    return this.alerts.slice(0, limit);
  }

  // Get current government officials (for testing/debugging)
  async getGovernmentOfficials() {
    return await this.fetchGovernmentOfficials();
  }

  // Test email system by sending a test alert
  async testEmailSystem() {
    const testReading = {
      sensorId: 'TEST_001',
      location: { village: 'Test Village', district: 'Test District' },
      readings: {
        ph: 9.5, // Abnormal - will trigger alert
        ecoli: 2,
        turbidity: 5,
        tds: 350,
        temperature: 25,
        dissolvedOxygen: 6.2,
        flowRate: 1.5
      }
    };

    const alertDetails = this.detectAbnormalReadings(testReading);
    if (alertDetails.length > 0) {
      console.log('🧪 Testing email system with simulated alert...');
      return await this.sendEmailAlert('warning', testReading, alertDetails);
    } else {
      console.log('🧪 No alerts detected in test data');
      return { emailsSent: 0, message: 'No alerts to test' };
    }
  }
}

export default WorkingSensorSimulation;