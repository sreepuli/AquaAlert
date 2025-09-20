import SensorSimulation from './services/sensorSimulation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🌊 AquaAlert Sensor Simulation Startup');
console.log('=====================================');

// Initialize sensor simulation
const sensorSimulation = new SensorSimulation();

// Start simulation
async function startSimulation() {
  try {
    console.log('🚀 Starting sensor simulation...');
    await sensorSimulation.runSimulation();
    
    console.log('✅ Sensor simulation started successfully!');
    console.log('📊 Simulation Status:', sensorSimulation.getSimulationStatus());
    
    // Show real-time updates
    setInterval(() => {
      const status = sensorSimulation.getSimulationStatus();
      console.log(`\n📊 Simulation Update - ${new Date().toLocaleTimeString()}`);
      console.log(`   Sensors Running: ${status.sensors.length}`);
      console.log(`   Online Sensors: ${status.sensors.filter(s => s.status === 'active').length}`);
      console.log(`   Total Readings: ${status.sensors.reduce((sum, s) => sum + s.totalReadings, 0)}`);
      console.log(`   Alerts Sent: ${status.sensors.reduce((sum, s) => sum + s.alertsSent, 0)}`);
    }, 60000); // Every minute
    
  } catch (error) {
    console.error('❌ Failed to start sensor simulation:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down sensor simulation...');
  sensorSimulation.stopSimulation();
  console.log('✅ Sensor simulation stopped.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down sensor simulation...');
  sensorSimulation.stopSimulation();
  console.log('✅ Sensor simulation stopped.');
  process.exit(0);
});

// Start the simulation
startSimulation();