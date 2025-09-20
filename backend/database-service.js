import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../src/firebase.js';

// ==================== WATER QUALITY DATA ====================

// Add water quality report
export const addWaterQualityReport = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'waterQualityReports'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get water quality reports
export const getWaterQualityReports = async (filters = {}) => {
  try {
    let q = collection(db, 'waterQualityReports');
    
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'), limit(50));
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: reports };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== HEALTH DATA ====================

// Add health symptom report
export const addHealthReport = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'healthReports'), {
      ...data,
      createdAt: serverTimestamp(),
      severity: calculateSeverity(data.symptoms)
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get health reports
export const getHealthReports = async (filters = {}) => {
  try {
    let q = collection(db, 'healthReports');
    
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    if (filters.severity) {
      q = query(q, where('severity', '==', filters.severity));
    }
    
    q = query(q, orderBy('createdAt', 'desc'), limit(100));
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: reports };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== ALERTS ====================

// Create alert
export const createAlert = async (alertData) => {
  try {
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alertData,
      createdAt: serverTimestamp(),
      isActive: true,
      acknowledged: false
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get active alerts
export const getActiveAlerts = async (location = null) => {
  try {
    let q = query(
      collection(db, 'alerts'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    if (location) {
      q = query(q, where('location', '==', location));
    }
    
    const querySnapshot = await getDocs(q);
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Acknowledge alert
export const acknowledgeAlert = async (alertId, userId) => {
  try {
    await updateDoc(doc(db, 'alerts', alertId), {
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== ANALYTICS ====================

// Get dashboard statistics
export const getDashboardStats = async (userRole, location = null) => {
  try {
    const stats = {};
    
    // Water quality stats
    const waterReports = await getWaterQualityReports({ location });
    stats.totalWaterReports = waterReports.data?.length || 0;
    
    // Health reports stats
    const healthReports = await getHealthReports({ location });
    stats.totalHealthReports = healthReports.data?.length || 0;
    
    // Active alerts
    const alerts = await getActiveAlerts(location);
    stats.activeAlerts = alerts.data?.length || 0;
    
    // Risk level calculation
    stats.riskLevel = calculateRiskLevel(waterReports.data, healthReports.data);
    
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==================== HELPER FUNCTIONS ====================

// Calculate severity based on symptoms
const calculateSeverity = (symptoms) => {
  const severityMap = {
    fever: 3,
    diarrhea: 4,
    vomiting: 3,
    dehydration: 5,
    abdominalPain: 2,
    nausea: 1
  };
  
  let totalSeverity = 0;
  symptoms.forEach(symptom => {
    totalSeverity += severityMap[symptom] || 1;
  });
  
  if (totalSeverity >= 8) return 'high';
  if (totalSeverity >= 4) return 'medium';
  return 'low';
};

// Calculate overall risk level
const calculateRiskLevel = (waterReports, healthReports) => {
  const recentReports = healthReports?.filter(report => {
    const reportDate = new Date(report.createdAt?.seconds * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return reportDate > sevenDaysAgo;
  }) || [];
  
  const highSeverityCount = recentReports.filter(r => r.severity === 'high').length;
  const mediumSeverityCount = recentReports.filter(r => r.severity === 'medium').length;
  
  if (highSeverityCount >= 3) return 'critical';
  if (highSeverityCount >= 1 || mediumSeverityCount >= 5) return 'high';
  if (mediumSeverityCount >= 2) return 'medium';
  return 'low';
};