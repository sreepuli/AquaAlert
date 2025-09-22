import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WorkingSensorSimulation from './services/workingSensorSimulation.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins for now, we'll restrict later
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize sensor simulation
let sensorSimulation = null;

const initializeSensorSimulation = async () => {
  if (!sensorSimulation) {
    try {
      console.log('🔥 Initializing Working Sensor Simulation...');
      sensorSimulation = new WorkingSensorSimulation();
      console.log('✅ Working Sensor Simulation initialized');
    } catch (error) {
      console.log('❌ Working simulation failed:', error.message);
      throw error;
    }
  }
  return sensorSimulation;
};

// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({ 
      status: 'OK', 
      message: 'AquaAlert Backend is running with Working Simulation',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      simulation: 'working',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.floor(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      simulation_status: sensorSimulation ? sensorSimulation.getSimulationStatus() : 'not initialized'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AquaAlert Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    simulation: sensorSimulation ? 'initialized' : 'not initialized'
  });
});

// Start sensor simulation
app.post('/api/sensors/simulation/start', async (req, res) => {
  try {
    console.log('🚀 Starting sensor simulation...');
    const simulation = await initializeSensorSimulation();
    
    // Start the simulation
    await simulation.runSimulation();
    
    res.json({
      success: true,
      message: 'Sensor simulation started successfully - generating data every 1 minute',
      status: simulation.getSimulationStatus()
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
app.post('/api/sensors/simulation/stop', async (req, res) => {
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
app.get('/api/sensors/simulation/status', async (req, res) => {
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

// Get all sensors
app.get('/api/sensors', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    const sensors = simulation.getDemoSensors();
    
    res.json({
      success: true,
      data: sensors,
      total: sensors.length,
      mode: 'working'
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

// Get sensor readings
app.get('/api/sensors/:sensorId/readings', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { limit = 50 } = req.query;
    
    const simulation = await initializeSensorSimulation();
    const readings = simulation.getDemoReadings(sensorId, parseInt(limit));
    
    res.json({
      success: true,
      data: readings,
      total: readings.length,
      hasMore: false,
      mode: 'working'
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

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const { severity, limit = 20, sensorId } = req.query;
    
    const simulation = await initializeSensorSimulation();
    const alerts = simulation.getDemoAlerts(parseInt(limit), severity, sensorId);
    
    res.json({
      success: true,
      data: alerts,
      total: alerts.length,
      mode: 'working'
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

// Test email system
app.post('/api/test/email', async (req, res) => {
  try {
    const simulation = await initializeSensorSimulation();
    const result = await simulation.testEmailSystem();
    
    res.json({
      success: true,
      message: 'Email test completed',
      data: result,
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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AquaAlert Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Start simulation: POST http://localhost:${PORT}/api/sensors/simulation/start`);
  console.log(`📧 Email alerts configured for government officials`);
  
  // Auto-initialize simulation in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Auto-initializing working simulation for production...');
    initializeSensorSimulation().catch(error => {
      console.error('Failed to auto-initialize simulation:', error);
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  console.log('Server uptime:', Math.floor(process.uptime()), 'seconds');
  if (sensorSimulation) {
    console.log('🛑 Stopping simulation...');
    sensorSimulation.stopSimulation();
  }
  console.log('🛑 Simulation stopped');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  if (sensorSimulation) {
    sensorSimulation.stopSimulation();
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  // Don't exit immediately, let the process continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the process continue
});

// Log memory usage every 5 minutes
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log('📊 Memory usage:', {
    rss: Math.floor(memoryUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
    uptime: Math.floor(process.uptime()) + 's'
  });
}, 5 * 60 * 1000);

export default app;