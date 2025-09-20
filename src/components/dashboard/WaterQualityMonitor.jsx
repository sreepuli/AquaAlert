import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Activity,
  Zap,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
} from "lucide-react";

const WaterQualityMonitor = ({ onDataUpdate }) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/sensors/data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSensorData(data.sensors || []);

      if (onDataUpdate) {
        onDataUpdate(data.sensors || []);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchSensorData();

    if (autoRefresh) {
      const interval = setInterval(fetchSensorData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Get parameter status (safe, warning, critical)
  const getParameterStatus = (parameter, value) => {
    const thresholds = {
      ph: { min: 6.5, max: 8.5 },
      turbidity: { max: 15 },
      ecoli: { max: 10 },
      temperature: { min: 15, max: 30 },
      dissolvedOxygen: { min: 5 },
      tds: { max: 1000 },
    };

    const threshold = thresholds[parameter];
    if (!threshold) return "safe";

    if (threshold.min && value < threshold.min) return "critical";
    if (threshold.max && value > threshold.max) return "critical";

    // Warning zones (80% of threshold)
    if (threshold.min && value < threshold.min * 1.2) return "warning";
    if (threshold.max && value > threshold.max * 0.8) return "warning";

    return "safe";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "red";
      case "warning":
        return "yellow";
      case "safe":
        return "green";
      default:
        return "gray";
    }
  };

  // Get trend direction
  const getTrend = (current, previous) => {
    if (!previous) return "stable";
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return "stable";
    return diff > 0 ? "up" : "down";
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchSensorData();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Water Quality Monitoring
            </h2>
            <p className="text-gray-600">
              Real-time sensor data from {sensorData.length} monitoring stations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                Auto-refresh
              </label>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sensorData.map((sensor, index) => (
          <SensorCard
            key={sensor.id || index}
            sensor={sensor}
            onClick={() => setSelectedSensor(sensor)}
            getParameterStatus={getParameterStatus}
            getStatusColor={getStatusColor}
            getTrend={getTrend}
          />
        ))}
      </div>

      {/* No data state */}
      {sensorData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Sensor Data
          </h3>
          <p className="text-gray-600">
            No sensor data available at this time.
          </p>
        </div>
      )}

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          getParameterStatus={getParameterStatus}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

// Individual Sensor Card Component
const SensorCard = ({
  sensor,
  onClick,
  getParameterStatus,
  getStatusColor,
  getTrend,
}) => {
  const parameters = [
    { key: "ph", label: "pH", icon: Activity, unit: "", value: sensor.ph },
    {
      key: "turbidity",
      label: "Turbidity",
      icon: Droplets,
      unit: "NTU",
      value: sensor.turbidity,
    },
    {
      key: "temperature",
      label: "Temperature",
      icon: Thermometer,
      unit: "°C",
      value: sensor.temperature,
    },
    {
      key: "ecoli",
      label: "E.coli",
      icon: AlertTriangle,
      unit: "CFU/100ml",
      value: sensor.ecoli,
    },
  ];

  // Get overall sensor status
  const overallStatus = parameters.reduce((worst, param) => {
    const status = getParameterStatus(param.key, param.value);
    if (status === "critical") return "critical";
    if (status === "warning" && worst !== "critical") return "warning";
    return worst;
  }, "safe");

  const statusColor = getStatusColor(overallStatus);

  return (
    <div
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">
            {sensor.name || `Sensor ${sensor.id}`}
          </h3>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColor === "green"
              ? "bg-green-100 text-green-800"
              : statusColor === "yellow"
              ? "bg-yellow-100 text-yellow-800"
              : statusColor === "red"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {overallStatus}
        </div>
      </div>

      {/* Location */}
      <p className="text-sm text-gray-600 mb-4">
        {sensor.location || "Unknown Location"}
      </p>

      {/* Parameters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {parameters.map((param) => {
          const Icon = param.icon;
          const status = getParameterStatus(param.key, param.value);
          const color = getStatusColor(status);
          const trend = getTrend(
            param.value,
            sensor.previousValues?.[param.key]
          );

          return (
            <div key={param.key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Icon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{param.label}</span>
                </div>
                {trend === "up" && (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                {trend === "stable" && (
                  <Minus className="h-3 w-3 text-gray-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    color === "green"
                      ? "text-green-600"
                      : color === "yellow"
                      ? "text-yellow-600"
                      : color === "red"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {param.value?.toFixed(1)} {param.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Last updated:{" "}
          {new Date(sensor.timestamp || Date.now()).toLocaleTimeString()}
        </span>
        <span className="flex items-center space-x-1">
          <div
            className={`w-2 h-2 rounded-full ${
              statusColor === "green"
                ? "bg-green-500"
                : statusColor === "yellow"
                ? "bg-yellow-500"
                : statusColor === "red"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          ></div>
          <span>{sensor.status || "active"}</span>
        </span>
      </div>
    </div>
  );
};

// Sensor Detail Modal Component
const SensorDetailModal = ({
  sensor,
  onClose,
  getParameterStatus,
  getStatusColor,
}) => {
  const allParameters = [
    {
      key: "ph",
      label: "pH Level",
      icon: Activity,
      unit: "",
      description: "Measures acidity/alkalinity",
    },
    {
      key: "turbidity",
      label: "Turbidity",
      icon: Droplets,
      unit: "NTU",
      description: "Water clarity measurement",
    },
    {
      key: "temperature",
      label: "Temperature",
      icon: Thermometer,
      unit: "°C",
      description: "Water temperature",
    },
    {
      key: "ecoli",
      label: "E.coli Count",
      icon: AlertTriangle,
      unit: "CFU/100ml",
      description: "Bacterial contamination",
    },
    {
      key: "dissolvedOxygen",
      label: "Dissolved Oxygen",
      icon: Zap,
      unit: "mg/L",
      description: "Oxygen content in water",
    },
    {
      key: "tds",
      label: "Total Dissolved Solids",
      icon: Activity,
      unit: "ppm",
      description: "Dissolved mineral content",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {sensor.name || `Sensor ${sensor.id}`}
            </h3>
            <p className="text-gray-600">
              {sensor.location || "Unknown Location"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Parameters Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allParameters.map((param) => {
            const Icon = param.icon;
            const value = sensor[param.key];
            const status = value
              ? getParameterStatus(param.key, value)
              : "unknown";
            const color = getStatusColor(status);

            return (
              <div key={param.key} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">{param.label}</h4>
                </div>

                <div className="mb-2">
                  {value ? (
                    <span
                      className={`text-2xl font-bold ${
                        color === "green"
                          ? "text-green-600"
                          : color === "yellow"
                          ? "text-yellow-600"
                          : color === "red"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {value.toFixed(1)} {param.unit}
                    </span>
                  ) : (
                    <span className="text-gray-400">No data</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {param.description}
                  </span>
                  {value && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        color === "green"
                          ? "bg-green-100 text-green-800"
                          : color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : color === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sensor Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Sensor Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sensor ID:</span>
              <span className="ml-2 font-medium">{sensor.id || "Unknown"}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">
                {sensor.status || "Active"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(sensor.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Battery Level:</span>
              <span className="ml-2 font-medium">
                {sensor.batteryLevel || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityMonitor;
