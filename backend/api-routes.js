// API Routes for AquaAlert Backend
// This would be used with Express.js or similar framework

// ==================== HEALTH ENDPOINTS ====================

// POST /api/health/report
export const submitHealthReport = async (req, res) => {
  try {
    const { symptoms, location, patientAge, severity, reportedBy } = req.body;
    
    // Validation
    if (!symptoms || !location || !reportedBy) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const healthData = {
      symptoms,
      location,
      patientAge,
      severity: severity || 'unknown',
      reportedBy,
      userRole: req.user?.role || 'community'
    };
    
    const result = await addHealthReport(healthData);
    
    if (result.success) {
      // Check if this triggers any alerts
      await checkForOutbreakAlerts();
      
      res.status(201).json({
        success: true,
        message: 'Health report submitted successfully',
        reportId: result.id
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/health/reports
export const getHealthReportsEndpoint = async (req, res) => {
  try {
    const { location, severity, limit } = req.query;
    const filters = {};
    
    if (location) filters.location = location;
    if (severity) filters.severity = severity;
    if (limit) filters.limit = parseInt(limit);
    
    const result = await getHealthReports(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== WATER QUALITY ENDPOINTS ====================

// POST /api/water/report
export const submitWaterQualityReport = async (req, res) => {
  try {
    const { location, waterSource, ph, turbidity, bacteria, temperature, reportedBy } = req.body;
    
    if (!location || !waterSource || !reportedBy) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    const waterData = {
      location,
      waterSource,
      ph: parseFloat(ph),
      turbidity: parseFloat(turbidity),
      bacteria,
      temperature: parseFloat(temperature),
      reportedBy,
      userRole: req.user?.role || 'community'
    };
    
    const result = await addWaterQualityReport(waterData);
    
    if (result.success) {
      // Check for water quality alerts
      await checkWaterQualityAlerts();
      
      res.status(201).json({
        success: true,
        message: 'Water quality report submitted successfully',
        reportId: result.id
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/water/reports
export const getWaterQualityReportsEndpoint = async (req, res) => {
  try {
    const { location, status } = req.query;
    const filters = {};
    
    if (location) filters.location = location;
    if (status) filters.status = status;
    
    const result = await getWaterQualityReports(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== ALERTS ENDPOINTS ====================

// GET /api/alerts
export const getAlertsEndpoint = async (req, res) => {
  try {
    const { location } = req.query;
    const result = await getActiveAlerts(location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/alerts/:id/acknowledge
export const acknowledgeAlertEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const result = await acknowledgeAlert(id, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== ANALYTICS ENDPOINTS ====================

// GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { location } = req.query;
    const userRole = req.user?.role || 'community';
    
    const result = await getDashboardStats(userRole, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/prediction
export const getPredictionAnalytics = async (req, res) => {
  try {
    const { location, days } = req.query;
    
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location is required' 
      });
    }
    
    const timeframe = days ? parseInt(days) : 7;
    const result = await predictOutbreakRisk(location, timeframe);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/trends
export const getTrendAnalytics = async (req, res) => {
  try {
    const { location, days } = req.query;
    
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location is required' 
      });
    }
    
    const timeframe = days ? parseInt(days) : 30;
    const result = await generateTrendAnalysis(location, timeframe);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== USER MANAGEMENT ENDPOINTS ====================

// GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    const result = await getUserProfile(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const updates = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }
    
    // Remove sensitive fields
    delete updates.email;
    delete updates.role;
    delete updates.createdAt;
    
    const result = await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== MIDDLEWARE ====================

// Authentication middleware
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token provided' 
      });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid authentication token' 
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};