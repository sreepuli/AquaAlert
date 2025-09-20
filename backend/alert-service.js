import { createAlert, getHealthReports, getWaterQualityReports } from './database-service.js';

// ==================== ALERT TRIGGERS ====================

// Check for disease outbreak patterns
export const checkForOutbreakAlerts = async () => {
  try {
    const healthReports = await getHealthReports();
    
    if (!healthReports.success) return;
    
    const recentReports = healthReports.data.filter(report => {
      const reportDate = new Date(report.createdAt?.seconds * 1000);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return reportDate > threeDaysAgo;
    });
    
    // Group by location
    const locationGroups = {};
    recentReports.forEach(report => {
      if (!locationGroups[report.location]) {
        locationGroups[report.location] = [];
      }
      locationGroups[report.location].push(report);
    });
    
    // Check each location for outbreak patterns
    for (const [location, reports] of Object.entries(locationGroups)) {
      const highSeverityCount = reports.filter(r => r.severity === 'high').length;
      const totalReports = reports.length;
      
      // Trigger alert if conditions met
      if (highSeverityCount >= 3 || (totalReports >= 5 && highSeverityCount >= 2)) {
        await createAlert({
          type: 'outbreak_warning',
          title: 'Potential Disease Outbreak Detected',
          message: `${highSeverityCount} high-severity health reports in ${location} within 3 days`,
          location: location,
          severity: 'high',
          data: {
            reportsCount: totalReports,
            highSeverityCount: highSeverityCount,
            timeframe: '3 days'
          }
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check for water quality alerts
export const checkWaterQualityAlerts = async () => {
  try {
    const waterReports = await getWaterQualityReports();
    
    if (!waterReports.success) return;
    
    const recentReports = waterReports.data.filter(report => {
      const reportDate = new Date(report.createdAt?.seconds * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return reportDate > oneDayAgo;
    });
    
    // Check for contaminated water sources
    const contaminatedSources = recentReports.filter(report => 
      report.ph < 6.5 || report.ph > 8.5 || 
      report.turbidity > 5 || 
      report.bacteria === 'present'
    );
    
    // Group by water source
    const sourceGroups = {};
    contaminatedSources.forEach(report => {
      if (!sourceGroups[report.waterSource]) {
        sourceGroups[report.waterSource] = [];
      }
      sourceGroups[report.waterSource].push(report);
    });
    
    // Create alerts for contaminated sources
    for (const [source, reports] of Object.entries(sourceGroups)) {
      await createAlert({
        type: 'water_contamination',
        title: 'Water Quality Alert',
        message: `Poor water quality detected at ${source}`,
        location: reports[0].location,
        severity: 'medium',
        data: {
          waterSource: source,
          issues: reports.map(r => ({
            ph: r.ph,
            turbidity: r.turbidity,
            bacteria: r.bacteria
          }))
        }
      });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== NOTIFICATION SYSTEM ====================

// Send SMS notifications (mock implementation)
export const sendSMSAlert = async (phoneNumber, message) => {
  try {
    // In production, integrate with SMS service like Twilio
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Mock response
    return { 
      success: true, 
      messageId: 'mock_' + Date.now(),
      message: 'SMS sent successfully (mock)'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send WhatsApp notifications (mock implementation)
export const sendWhatsAppAlert = async (phoneNumber, message) => {
  try {
    // In production, integrate with WhatsApp Business API
    console.log(`WhatsApp to ${phoneNumber}: ${message}`);
    
    return { 
      success: true, 
      messageId: 'whatsapp_' + Date.now(),
      message: 'WhatsApp sent successfully (mock)'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== ALERT DISTRIBUTION ====================

// Distribute alerts to relevant users
export const distributeAlert = async (alert) => {
  try {
    const notifications = [];
    
    // Based on alert type and severity, determine recipients
    if (alert.type === 'outbreak_warning') {
      // Notify health officials and ASHA workers
      const recipients = await getUsersByRole(['official', 'asha'], alert.location);
      
      for (const user of recipients) {
        if (user.phoneNumber) {
          const message = `ALERT: ${alert.title}\n${alert.message}\nLocation: ${alert.location}`;
          
          // Send SMS
          const smsResult = await sendSMSAlert(user.phoneNumber, message);
          notifications.push(smsResult);
          
          // Send WhatsApp if available
          if (user.whatsappNumber) {
            const whatsappResult = await sendWhatsAppAlert(user.whatsappNumber, message);
            notifications.push(whatsappResult);
          }
        }
      }
    }
    
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Mock function to get users by role and location
const getUsersByRole = async (roles, location) => {
  // In production, this would query the users collection
  return [
    {
      role: 'official',
      phoneNumber: '+91XXXXXXXXXX',
      whatsappNumber: '+91XXXXXXXXXX',
      location: location
    },
    {
      role: 'asha',
      phoneNumber: '+91XXXXXXXXXX',
      location: location
    }
  ];
};