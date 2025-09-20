import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class GovernmentAlertService {
  constructor() {
    this.setupEmailTransporter();
    // Initialize with fallback officials, but we'll fetch from Firebase dynamically
    this.fallbackOfficials = [
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
  }

  // Fetch government officials dynamically from Firebase
  async getGovernmentOfficials() {
    try {
      const { db } = await import('../firebase-admin.js');
      
      // Query for both 'government' and 'official' roles to be comprehensive
      const queries = [
        db.collection('users').where('role', '==', 'government').where('isActive', '==', true).get(),
        db.collection('users').where('role', '==', 'official').where('isActive', '==', true).get()
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
            lastLogin: data.lastLogin,
            createdAt: data.createdAt,
            userType: data.userType || data.role
          });
        });
      });
      
      // Remove duplicates based on email
      const uniqueOfficials = officials.filter((official, index, self) => 
        index === self.findIndex(o => o.email === official.email)
      );
      
      console.log(`📧 Fetched ${uniqueOfficials.length} government officials from Firebase database`);
      return uniqueOfficials.length > 0 ? uniqueOfficials : this.fallbackOfficials;
    } catch (error) {
      console.warn('⚠️ Could not fetch officials from Firebase, using fallback list:', error.message);
      return this.fallbackOfficials;
    }
  }

  setupEmailTransporter() {
    // Production email configuration - replace with actual government SMTP
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Use government SMTP server
      port: 587,
      secure: false,
      auth: {
        user: process.env.GOV_EMAIL_USER || 'aquaalert.government@assam.gov.in',
        pass: process.env.GOV_EMAIL_PASS || 'secure-government-password'
      }
    });
  }

  // Daily Summary Report for Government Officials
  async sendDailySummaryReport() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get daily water quality data
      const waterQualityData = await this.getDailyWaterQualityData(yesterday);
      
      // Get patient/health records
      const healthRecords = await this.getDailyHealthRecords(yesterday);
      
      // Get critical alerts
      const criticalAlerts = await this.getDailyCriticalAlerts(yesterday);

      const reportData = {
        date: yesterday.toDateString(),
        waterQuality: waterQualityData,
        healthRecords: healthRecords,
        alerts: criticalAlerts,
        summary: this.generateDailySummary(waterQualityData, healthRecords, criticalAlerts)
      };

      // Fetch current government officials from Firebase
      const governmentOfficials = await this.getGovernmentOfficials();

      // Send to officials who need daily summaries
      const recipients = governmentOfficials.filter(official => 
        official.alertTypes.includes('daily_summary') ||
        official.position.toLowerCase().includes('director') ||
        official.position.toLowerCase().includes('officer')
      );

      for (const official of recipients) {
        await this.sendDailyReport(official, reportData);
      }

      console.log(`📧 Daily summary reports sent to ${recipients.length} government officials`);
      return { success: true, reportsSent: recipients.length };

    } catch (error) {
      console.error('Failed to send daily summary reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate comprehensive daily report
  async sendDailyReport(official, reportData) {
    const subject = `🚨 Daily Water Quality & Health Report - ${reportData.date} - Majuli District`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .section { margin: 20px 0; padding: 15px; border-left: 4px solid #2563eb; }
          .critical { border-left-color: #dc2626; background: #fee2e2; }
          .warning { border-left-color: #f59e0b; background: #fef3c7; }
          .normal { border-left-color: #059669; background: #d1fae5; }
          .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .data-table th { background: #f3f4f6; }
          .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 AquaAlert Government Daily Report</h1>
          <p><strong>${official.name}</strong> - ${official.position}</p>
          <p>📅 Report Date: ${reportData.date}</p>
        </div>

        <div class="section ${reportData.summary.overallStatus}">
          <h2>📊 Executive Summary</h2>
          <p><strong>Overall Status:</strong> ${reportData.summary.statusText}</p>
          <p><strong>Total Sensors Monitored:</strong> ${reportData.waterQuality.sensorsActive}</p>
          <p><strong>Critical Alerts:</strong> ${reportData.alerts.critical.length}</p>
          <p><strong>Health Cases Reported:</strong> ${reportData.healthRecords.totalCases}</p>
        </div>

        <div class="section">
          <h2>💧 Water Quality Data - Yesterday</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Sensor Location</th>
                <th>pH Level</th>
                <th>Turbidity (NTU)</th>
                <th>E.coli (CFU/100ml)</th>
                <th>Temperature (°C)</th>
                <th>Time Recorded</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.waterQuality.readings.map(reading => `
                <tr>
                  <td>${reading.location}</td>
                  <td>${reading.ph}</td>
                  <td>${reading.turbidity}</td>
                  <td>${reading.ecoli}</td>
                  <td>${reading.temperature}</td>
                  <td>${reading.timestamp}</td>
                  <td><span class="${reading.status}">${reading.statusText}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>👥 Health Records Summary</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Village</th>
                <th>Waterborne Disease Cases</th>
                <th>Diarrhea Cases</th>
                <th>Other Health Issues</th>
                <th>Age Group Most Affected</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.healthRecords.byVillage.map(village => `
                <tr>
                  <td>${village.name}</td>
                  <td>${village.waterborne}</td>
                  <td>${village.diarrhea}</td>
                  <td>${village.other}</td>
                  <td>${village.mostAffectedAge}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section critical">
          <h2>🚨 Critical Alerts Requiring Action</h2>
          ${reportData.alerts.critical.length > 0 ? 
            reportData.alerts.critical.map(alert => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
                <strong>⚠️ ${alert.title}</strong><br>
                📍 Location: ${alert.location}<br>
                🕐 Time: ${alert.timestamp}<br>
                📋 Details: ${alert.description}<br>
                🎯 Required Action: ${alert.recommendedAction}
              </div>
            `).join('') : 
            '<p>✅ No critical alerts yesterday - all systems within normal parameters.</p>'
          }
        </div>

        <div class="section">
          <h2>📈 Trends & Recommendations</h2>
          <ul>
            ${reportData.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          <p>🏛️ <strong>Government of Assam - Department of Public Health Engineering</strong></p>
          <p>📧 This is an automated report from AquaAlert Water Quality Monitoring System</p>
          <p>🔗 For real-time data: <a href="http://aquaalert.assam.gov.in">AquaAlert Dashboard</a></p>
          <p>📞 Emergency Contact: +91-361-XXXXXXX | 📧 emergency@aquaalert.assam.gov.in</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"AquaAlert Government System" <${process.env.GOV_EMAIL_USER}>`,
      to: official.email,
      cc: ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'], // Always CC specific emails
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `water-quality-report-${reportData.date}.csv`,
          content: this.generateCSVReport(reportData),
          contentType: 'text/csv'
        }
      ]
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Daily report sent to ${official.name} (${official.email})`);
  }

  // Get daily water quality data
  async getDailyWaterQualityData(date) {
    // This would integrate with your actual database
    // For now, return mock data structure
    return {
      sensorsActive: 3,
      readings: [
        {
          location: 'Majuli Village 1 - North Bank',
          ph: 7.2,
          turbidity: 3.5,
          ecoli: 2,
          temperature: 26.5,
          timestamp: '2025-09-19 14:30:00',
          status: 'normal',
          statusText: 'Normal'
        },
        {
          location: 'Majuli Village 2 - Central',
          ph: 6.8,
          turbidity: 8.2,
          ecoli: 1,
          temperature: 27.1,
          timestamp: '2025-09-19 14:35:00',
          status: 'warning',
          statusText: 'High Turbidity'
        },
        {
          location: 'Majuli Village 3 - South Bank',
          ph: 7.0,
          turbidity: 4.1,
          ecoli: 0,
          temperature: 25.8,
          timestamp: '2025-09-19 14:40:00',
          status: 'normal',
          statusText: 'Normal'
        }
      ]
    };
  }

  // Get daily health records
  async getDailyHealthRecords(date) {
    return {
      totalCases: 12,
      byVillage: [
        {
          name: 'Majuli Village 1',
          waterborne: 3,
          diarrhea: 2,
          other: 1,
          mostAffectedAge: 'Children (0-12)'
        },
        {
          name: 'Majuli Village 2', 
          waterborne: 2,
          diarrhea: 1,
          other: 0,
          mostAffectedAge: 'Adults (25-45)'
        },
        {
          name: 'Majuli Village 3',
          waterborne: 1,
          diarrhea: 1,
          other: 1,
          mostAffectedAge: 'Elderly (60+)'
        }
      ]
    };
  }

  // Get critical alerts
  async getDailyCriticalAlerts(date) {
    return {
      critical: [
        {
          title: 'High Turbidity Alert - Majuli Village 2',
          location: 'Majuli Village 2 Water Station',
          timestamp: '2025-09-19 15:22:00',
          description: 'Turbidity levels exceeded 15 NTU threshold (measured: 18.3 NTU)',
          recommendedAction: 'Immediate water source inspection and potential boil-water advisory'
        }
      ]
    };
  }

  // Generate daily summary
  generateDailySummary(waterQuality, healthRecords, alerts) {
    const criticalCount = alerts.critical.length;
    const healthCases = healthRecords.totalCases;
    
    let overallStatus = 'normal';
    let statusText = 'All systems operating normally';
    
    if (criticalCount > 0 || healthCases > 15) {
      overallStatus = 'critical';
      statusText = 'Critical issues require immediate attention';
    } else if (healthCases > 8) {
      overallStatus = 'warning';
      statusText = 'Elevated health cases - monitoring required';
    }

    const recommendations = [
      'Continue regular monitoring of all water sources',
      'Maintain contact with village health workers',
      'Review seasonal turbidity patterns for monsoon preparedness'
    ];

    if (criticalCount > 0) {
      recommendations.unshift('Immediate field investigation required for critical alerts');
    }

    return {
      overallStatus,
      statusText,
      recommendations
    };
  }

  // Generate CSV report for attachment
  generateCSVReport(reportData) {
    const csvRows = [
      'Location,pH,Turbidity,E.coli,Temperature,Timestamp,Status',
      ...reportData.waterQuality.readings.map(reading => 
        `${reading.location},${reading.ph},${reading.turbidity},${reading.ecoli},${reading.temperature},${reading.timestamp},${reading.statusText}`
      )
    ];
    return csvRows.join('\n');
  }

  // Immediate critical alert (for urgent situations)
  async sendCriticalAlert(alertData) {
    // Fetch current government officials from Firebase
    const governmentOfficials = await this.getGovernmentOfficials();
    
    const criticalOfficials = governmentOfficials.filter(official => 
      official.alertTypes.includes('critical_alerts') ||
      official.position.toLowerCase().includes('director') ||
      official.position.toLowerCase().includes('chief')
    );

    const subject = `🚨 URGENT: Critical Water Quality Alert - ${alertData.location}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>🚨 CRITICAL ALERT</h1>
          <p><strong>Immediate Action Required</strong></p>
        </div>
        <div style="padding: 20px; background: #fee2e2; border-left: 5px solid #dc2626;">
          <h2>Alert Details</h2>
          <p><strong>📍 Location:</strong> ${alertData.location}</p>
          <p><strong>🕐 Time:</strong> ${alertData.timestamp}</p>
          <p><strong>⚠️ Issue:</strong> ${alertData.description}</p>
          <p><strong>📊 Measurements:</strong></p>
          <ul>
            <li>pH Level: ${alertData.measurements?.ph || 'N/A'}</li>
            <li>Turbidity: ${alertData.measurements?.turbidity || 'N/A'} NTU</li>
            <li>E.coli: ${alertData.measurements?.ecoli || 'N/A'} CFU/100ml</li>
            <li>Temperature: ${alertData.measurements?.temperature || 'N/A'}°C</li>
          </ul>
          <p><strong>🎯 Recommended Action:</strong> ${alertData.recommendedAction}</p>
        </div>
        <div style="padding: 15px; background: #f9fafb; text-align: center;">
          <p>📞 Emergency Response: +91-361-XXXXXXX</p>
          <p>This alert was sent to ${criticalOfficials.length} critical response officials</p>
        </div>
      </div>
    `;

    for (const official of criticalOfficials) {
      const mailOptions = {
        from: `"AquaAlert Emergency System" <${process.env.GOV_EMAIL_USER}>`,
        to: official.email,
        cc: ['srilakshmipulisri@gmail.com', 'sreepuli24@gmail.com'], // Always CC specific emails for critical alerts
        subject: subject,
        html: htmlContent,
        priority: 'high'
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`🚨 Critical alert sent to ${official.name}`);
    }

    return { success: true, alertsSent: criticalOfficials.length };
  }
}

export default GovernmentAlertService;