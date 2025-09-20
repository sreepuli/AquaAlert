import { getHealthReports, getWaterQualityReports } from './database-service.js';

// ==================== PREDICTION ALGORITHMS ====================

// Predict disease outbreak risk using simple ML approach
export const predictOutbreakRisk = async (location, timeframeDays = 7) => {
  try {
    const healthReports = await getHealthReports({ location });
    const waterReports = await getWaterQualityReports({ location });
    
    if (!healthReports.success || !waterReports.success) {
      return { success: false, error: 'Failed to fetch data' };
    }
    
    // Filter recent data
    const cutoffDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
    const recentHealthReports = healthReports.data.filter(report => 
      new Date(report.createdAt?.seconds * 1000) > cutoffDate
    );
    const recentWaterReports = waterReports.data.filter(report => 
      new Date(report.createdAt?.seconds * 1000) > cutoffDate
    );
    
    // Calculate risk factors
    const riskFactors = calculateRiskFactors(recentHealthReports, recentWaterReports);
    
    // Simple prediction model
    const prediction = calculatePrediction(riskFactors);
    
    return {
      success: true,
      data: {
        location,
        timeframe: `${timeframeDays} days`,
        riskLevel: prediction.level,
        confidence: prediction.confidence,
        factors: riskFactors,
        recommendations: generateRecommendations(prediction, riskFactors)
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Calculate various risk factors
const calculateRiskFactors = (healthReports, waterReports) => {
  // Health-based risk factors
  const totalHealthReports = healthReports.length;
  const highSeverityReports = healthReports.filter(r => r.severity === 'high').length;
  const mediumSeverityReports = healthReports.filter(r => r.severity === 'medium').length;
  
  // Water quality risk factors
  const poorWaterQuality = waterReports.filter(r => 
    r.ph < 6.5 || r.ph > 8.5 || r.turbidity > 5 || r.bacteria === 'present'
  ).length;
  
  // Seasonal factors (simplified)
  const currentMonth = new Date().getMonth();
  const isMonsonSeason = currentMonth >= 5 && currentMonth <= 9; // June to October
  
  // Symptom clustering
  const symptomCounts = {};
  healthReports.forEach(report => {
    if (report.symptoms) {
      report.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });
  
  return {
    totalHealthReports,
    highSeverityReports,
    mediumSeverityReports,
    poorWaterQualityReports: poorWaterQuality,
    isMonsonSeason,
    symptomCounts,
    waterQualityIssues: waterReports.length > 0 ? (poorWaterQuality / waterReports.length) : 0
  };
};

// Simple prediction calculation
const calculatePrediction = (factors) => {
  let riskScore = 0;
  let confidence = 0.5;
  
  // Health report factors
  riskScore += factors.highSeverityReports * 0.4;
  riskScore += factors.mediumSeverityReports * 0.2;
  riskScore += factors.totalHealthReports * 0.1;
  
  // Water quality factors
  riskScore += factors.poorWaterQualityReports * 0.3;
  riskScore += factors.waterQualityIssues * 0.2;
  
  // Seasonal factors
  if (factors.isMonsonSeason) {
    riskScore += 0.3;
  }
  
  // Symptom clustering (specific symptoms indicate waterborne diseases)
  const waterbornSymptoms = ['diarrhea', 'vomiting', 'dehydration'];
  let waterborneSymptomCount = 0;
  waterbornSymptoms.forEach(symptom => {
    waterborneSymptomCount += factors.symptomCounts[symptom] || 0;
  });
  riskScore += waterborneSymptomCount * 0.15;
  
  // Determine risk level and confidence
  let level, description;
  
  if (riskScore >= 3) {
    level = 'critical';
    description = 'High probability of disease outbreak';
    confidence = 0.8;
  } else if (riskScore >= 2) {
    level = 'high';
    description = 'Elevated risk of disease outbreak';
    confidence = 0.7;
  } else if (riskScore >= 1) {
    level = 'medium';
    description = 'Moderate risk detected';
    confidence = 0.6;
  } else {
    level = 'low';
    description = 'Low risk of outbreak';
    confidence = 0.5;
  }
  
  return {
    level,
    description,
    score: riskScore,
    confidence
  };
};

// Generate recommendations based on prediction
const generateRecommendations = (prediction, factors) => {
  const recommendations = [];
  
  if (prediction.level === 'critical' || prediction.level === 'high') {
    recommendations.push('Immediate health surveillance required');
    recommendations.push('Alert health authorities');
    recommendations.push('Increase water quality monitoring');
    
    if (factors.poorWaterQualityReports > 0) {
      recommendations.push('Test and treat water sources');
      recommendations.push('Distribute water purification tablets');
    }
    
    if (factors.symptomCounts.diarrhea > 2) {
      recommendations.push('Prepare ORS (Oral Rehydration Solution)');
      recommendations.push('Set up temporary health camps');
    }
  } else if (prediction.level === 'medium') {
    recommendations.push('Increase community awareness');
    recommendations.push('Regular water quality checks');
    recommendations.push('Monitor health symptoms closely');
  } else {
    recommendations.push('Continue routine monitoring');
    recommendations.push('Maintain preventive measures');
  }
  
  // Seasonal recommendations
  if (factors.isMonsonSeason) {
    recommendations.push('Extra precautions during monsoon');
    recommendations.push('Ensure proper drainage');
    recommendations.push('Boil water before consumption');
  }
  
  return recommendations;
};

// ==================== ANALYTICS FUNCTIONS ====================

// Generate trend analysis
export const generateTrendAnalysis = async (location, days = 30) => {
  try {
    const healthReports = await getHealthReports({ location });
    const waterReports = await getWaterQualityReports({ location });
    
    if (!healthReports.success || !waterReports.success) {
      return { success: false, error: 'Failed to fetch data' };
    }
    
    // Group data by days
    const dailyHealthData = groupDataByDay(healthReports.data, days);
    const dailyWaterData = groupDataByDay(waterReports.data, days);
    
    // Calculate trends
    const healthTrend = calculateTrend(dailyHealthData);
    const waterQualityTrend = calculateTrend(dailyWaterData);
    
    return {
      success: true,
      data: {
        location,
        timeframe: `${days} days`,
        healthTrend,
        waterQualityTrend,
        dailyData: {
          health: dailyHealthData,
          water: dailyWaterData
        }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Group data by day
const groupDataByDay = (reports, days) => {
  const dailyData = {};
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  reports.forEach(report => {
    const reportDate = new Date(report.createdAt?.seconds * 1000);
    if (reportDate > cutoffDate) {
      const dayKey = reportDate.toISOString().split('T')[0];
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = [];
      }
      dailyData[dayKey].push(report);
    }
  });
  
  return dailyData;
};

// Calculate trend direction
const calculateTrend = (dailyData) => {
  const days = Object.keys(dailyData).sort();
  if (days.length < 2) return 'insufficient_data';
  
  const recentDays = days.slice(-7); // Last 7 days
  const earlierDays = days.slice(0, 7); // First 7 days
  
  const recentAvg = recentDays.reduce((sum, day) => 
    sum + (dailyData[day]?.length || 0), 0) / recentDays.length;
  const earlierAvg = earlierDays.reduce((sum, day) => 
    sum + (dailyData[day]?.length || 0), 0) / earlierDays.length;
  
  const changePercent = ((recentAvg - earlierAvg) / (earlierAvg || 1)) * 100;
  
  if (changePercent > 20) return 'increasing';
  if (changePercent < -20) return 'decreasing';
  return 'stable';
};