import React, { useState, useEffect, memo } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

// ==================== SIMULATION CONTROLS ====================

const [simulationStatus, setSimulationStatus] = useState({
  isRunning: false,
  mode: "demo",
  sensors: 0,
  lastUpdate: null,
});
const [simulationLoading, setSimulationLoading] = useState(false);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const startSimulation = async () => {
  try {
    setSimulationLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/simulation/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      setSimulationStatus({
        isRunning: true,
        mode: result.mode || "demo",
        sensors: result.status?.sensors || 0,
        lastUpdate: new Date().toISOString(),
      });

      // Refresh data after starting simulation
      setTimeout(() => {
        fetchFromAPI();
      }, 2000);

      alert("✅ Sensor simulation started successfully!");
    } else {
      alert("❌ Failed to start simulation: " + result.message);
    }
  } catch (error) {
    console.error("Error starting simulation:", error);
    alert("❌ Error starting simulation: " + error.message);
  } finally {
    setSimulationLoading(false);
  }
};

const stopSimulation = async () => {
  try {
    setSimulationLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/simulation/stop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      setSimulationStatus({
        isRunning: false,
        mode: "stopped",
        sensors: 0,
        lastUpdate: new Date().toISOString(),
      });

      alert("⏹️ Sensor simulation stopped successfully!");
    } else {
      alert("❌ Failed to stop simulation: " + result.message);
    }
  } catch (error) {
    console.error("Error stopping simulation:", error);
    alert("❌ Error stopping simulation: " + error.message);
  } finally {
    setSimulationLoading(false);
  }
};

const checkSimulationStatus = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/sensors/simulation/status`
    );
    const result = await response.json();

    if (result.success) {
      setSimulationStatus({
        isRunning: result.data?.isRunning || false,
        mode: result.data?.mode || "demo",
        sensors: result.data?.sensors || 0,
        lastUpdate: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error checking simulation status:", error);
  }
};

// Check simulation status on component mount
useEffect(() => {
  checkSimulationStatus();
}, []);

const renderSimulationControls = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Sensor Simulation Control
        </h3>
        <p className="text-sm text-gray-500">
          Start or stop the water quality sensor simulation
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            simulationStatus.isRunning ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span
          className={`text-sm font-medium ${
            simulationStatus.isRunning ? "text-green-600" : "text-red-600"
          }`}
        >
          {simulationStatus.isRunning ? "Running" : "Stopped"}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-600">
          {simulationStatus.sensors}
        </div>
        <div className="text-sm text-gray-600">Active Sensors</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-900 capitalize">
          {simulationStatus.mode}
        </div>
        <div className="text-sm text-gray-600">Simulation Mode</div>
      </div>
    </div>

    <div className="flex space-x-4">
      <button
        onClick={startSimulation}
        disabled={simulationLoading || simulationStatus.isRunning}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          simulationStatus.isRunning
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {simulationLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Starting...
          </div>
        ) : (
          "▶️ Start Simulation"
        )}
      </button>

      <button
        onClick={stopSimulation}
        disabled={simulationLoading || !simulationStatus.isRunning}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          !simulationStatus.isRunning
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {simulationLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Stopping...
          </div>
        ) : (
          "⏹️ Stop Simulation"
        )}
      </button>

      <button
        onClick={checkSimulationStatus}
        className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        🔄 Refresh Status
      </button>
    </div>

    {simulationStatus.lastUpdate && (
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date(simulationStatus.lastUpdate).toLocaleString()}
      </div>
    )}
  </div>
);
const getStatusColor = (status) => {
  const statusColors = {
    online: "bg-green-100 text-green-800",
    offline: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

const getParameterStatus = (value, parameter) => {
  const ranges = {
    ph: { min: 6.5, max: 8.5 },
    ecoli: { max: 5 },
    turbidity: { max: 10 },
    tds: { min: 200, max: 500 },
  };

  if (!ranges[parameter]) return "normal";

  if (parameter === "ph") {
    return value < ranges[parameter].min || value > ranges[parameter].max
      ? "critical"
      : "normal";
  } else if (parameter === "ecoli" || parameter === "turbidity") {
    return value > ranges[parameter].max ? "critical" : "normal";
  } else if (parameter === "tds") {
    return value < ranges[parameter].min || value > ranges[parameter].max
      ? "warning"
      : "normal";
  }

  return "normal";
};

const getParameterColor = (status) => {
  const statusColors = {
    critical: "text-red-600 bg-red-50",
    warning: "text-yellow-600 bg-yellow-50",
    normal: "text-green-600 bg-green-50",
  };
  return statusColors[status] || "text-green-600 bg-green-50";
};

const getSeverityColor = (severity) => {
  const severityColors = {
    critical: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    maintenance: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return severityColors[severity] || "bg-gray-50 border-gray-200 text-gray-800";
};

const getSeverityIcon = (severity) => {
  const severityIcons = {
    critical: "🚨",
    warning: "⚠️",
    maintenance: "🔧",
  };
  return severityIcons[severity] || "📢";
};

// ==================== SUB-COMPONENTS ====================

const WaterQualityParameter = memo(({ parameter, value, unit, t }) => {
  const status = getParameterStatus(value, parameter);
  const color = getParameterColor(status);

  const parameterLabels = {
    ph: `pH ${t("level")}`,
    ecoli: "E.coli",
    turbidity: t("turbidity"),
    tds: "TDS",
    temperature: t("temperature"),
    flowRate: t("flowRate"),
  };

  const normalRanges = {
    ph: "6.5-8.5",
    ecoli: "< 5 CFU/100ml",
    turbidity: "< 10 NTU",
    tds: "200-500 ppm",
  };

  return (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="text-xs font-medium opacity-75">
        {parameterLabels[parameter] || parameter}
      </div>
      <div className="text-lg font-bold">
        {value || "N/A"}
        {unit && unit}
      </div>
      {normalRanges[parameter] && (
        <div className="text-xs opacity-75">
          {t("normal")}: {normalRanges[parameter]}
        </div>
      )}
    </div>
  );
});

const SensorCard = memo(({ sensor, readings }) => {
  const { t } = useLanguage();
  const latestReading = readings?.[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Sensor Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{sensor.name}</h3>
          <p className="text-sm text-gray-600">
            📍 {sensor.location?.village}, {sensor.location?.district}
          </p>
          <p className="text-xs text-gray-500 mt-1">ID: {sensor.id}</p>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              sensor.status
            )}`}
          >
            {sensor.status || "Unknown"}
          </span>
          {sensor.batteryLevel && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span className="mr-1">🔋</span>
              <span
                className={
                  sensor.batteryLevel < 20 ? "text-red-500" : "text-green-500"
                }
              >
                {sensor.batteryLevel}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Data */}
      {latestReading ? (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>
              {t("lastUpdated")}:{" "}
              {latestReading.timestamp?.toDate?.()?.toLocaleString() ||
                "Just now"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WaterQualityParameter
              parameter="ph"
              value={latestReading.readings?.ph}
              t={t}
            />
            <WaterQualityParameter
              parameter="ecoli"
              value={latestReading.readings?.ecoli}
              t={t}
            />
            <WaterQualityParameter
              parameter="turbidity"
              value={latestReading.readings?.turbidity}
              t={t}
            />
            <WaterQualityParameter
              parameter="tds"
              value={latestReading.readings?.tds}
              t={t}
            />
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <div className="text-xs font-medium opacity-75">
                {t("temperature")}
              </div>
              <div className="text-lg font-bold">
                {latestReading.readings?.temperature || "N/A"}°C
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <div className="text-xs font-medium opacity-75">
                {t("flowRate")}
              </div>
              <div className="text-lg font-bold">
                {latestReading.readings?.flowRate || "N/A"}
              </div>
              <div className="text-xs opacity-75">L/min</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📡</div>
          <p>{t("noDataAvailable")}</p>
        </div>
      )}
    </div>
  );
});

const AlertCard = memo(({ alert }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`border rounded-lg p-4 mb-3 ${getSeverityColor(
        alert.severity
      )}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
          <div>
            <h4 className="font-semibold text-sm">
              {alert.location?.village}, {alert.location?.district}
            </h4>
            <p className="text-xs opacity-75 mb-2">
              {alert.timestamp?.toDate?.()?.toLocaleString() || "Recent"}
            </p>
            {alert.alerts?.map((alertDetail, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm font-medium">{alertDetail.message}</p>
                <p className="text-xs opacity-75">{alertDetail.action}</p>
              </div>
            ))}
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            alert.status === "active"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {alert.status || "Active"}
        </span>
      </div>
    </div>
  );
});

const StatsCard = memo(({ icon, title, value, color = "blue" }) => (
  <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
    <div className="flex items-center">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <p
          className={`text-${color}-600 text-xs font-medium uppercase tracking-wider`}
        >
          {title}
        </p>
        <p className={`text-${color}-900 text-2xl font-bold`}>{value}</p>
      </div>
    </div>
  </div>
));

// ==================== MAIN COMPONENT ====================

const SensorDashboard = () => {
  const { t } = useLanguage();

  // ==================== STATE MANAGEMENT ====================
  const [sensors, setSensors] = useState([]);
  const [sensorReadings, setSensorReadings] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [stats, setStats] = useState({
    totalSensors: 0,
    onlineSensors: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  });

  // ==================== API DATA FETCHING ====================
  const fetchFromAPI = async () => {
    try {
      // Check environment mode
      const envResponse = await fetch(
        "http://localhost:3001/api/sensors/env-test"
      );
      const envData = await envResponse.json();
      setIsDemoMode(envData.DEMO_MODE === "true");

      // Fetch sensors
      const sensorsResponse = await fetch("http://localhost:3001/api/sensors");
      const sensorsData = await sensorsResponse.json();

      if (sensorsData.success) {
        setSensors(sensorsData.data || []);
        setStats((prev) => ({
          ...prev,
          totalSensors: sensorsData.data?.length || 0,
          onlineSensors:
            sensorsData.data?.filter(
              (s) => s.status === "online" || s.status === "active"
            ).length || 0,
        }));

        // Fetch readings for each sensor
        const readingsData = {};
        for (const sensor of sensorsData.data || []) {
          try {
            const readingsResponse = await fetch(
              `http://localhost:3001/api/sensors/${sensor.id}/readings?limit=10`
            );
            const readings = await readingsResponse.json();
            if (readings.success) {
              readingsData[sensor.id] = readings.data || [];
            }
          } catch (error) {
            console.log(
              `Could not fetch readings for sensor ${sensor.id}:`,
              error
            );
          }
        }
        setSensorReadings(readingsData);
      }

      // Fetch alerts
      const alertsResponse = await fetch(
        "http://localhost:3001/api/alerts?limit=20"
      );
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        setAlerts(alertsData.data || []);
        setStats((prev) => ({
          ...prev,
          activeAlerts: alertsData.data?.length || 0,
          criticalAlerts:
            alertsData.data?.filter((a) => a.severity === "critical").length ||
            0,
        }));
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.log("API fetch failed, will try Firebase:", error);
      return false;
    }
  };

  // ==================== FIREBASE DATA FETCHING ====================
  const fetchFromFirebase = () => {
    try {
      const sensorsQuery = query(collection(db, "sensors"), orderBy("name"));
      const unsubscribe = onSnapshot(sensorsQuery, (snapshot) => {
        const sensorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSensors(sensorsData);

        setStats((prev) => ({
          ...prev,
          totalSensors: sensorsData.length,
          onlineSensors: sensorsData.filter(
            (s) => s.status === "online" || s.status === "active"
          ).length,
        }));

        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log("Firebase connection failed:", error);
      setLoading(false);
      return null;
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    let unsubscribe = null;
    let pollInterval = null;

    const initializeData = async () => {
      const apiSuccess = await fetchFromAPI();

      if (!apiSuccess && !isDemoMode) {
        unsubscribe = fetchFromFirebase();
        if (!unsubscribe) {
          pollInterval = setInterval(fetchFromAPI, 10000);
        }
      } else if (isDemoMode || apiSuccess) {
        pollInterval = setInterval(fetchFromAPI, 10000);
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Firebase sensor readings subscription
  useEffect(() => {
    if (sensors.length === 0 || isDemoMode) return;

    const fetchReadings = async () => {
      for (const sensor of sensors) {
        const readingsQuery = query(
          collection(db, "sensor_readings"),
          where("sensorId", "==", sensor.id),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        onSnapshot(readingsQuery, (snapshot) => {
          const readings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSensorReadings((prev) => ({
            ...prev,
            [sensor.id]: readings,
          }));
        });
      }
    };

    fetchReadings();
  }, [sensors, isDemoMode]);

  // Firebase alerts subscription
  useEffect(() => {
    if (isDemoMode) return;

    const alertsQuery = query(
      collection(db, "alerts"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(alertsData);

      setStats((prev) => ({
        ...prev,
        activeAlerts: alertsData.filter((a) => a.status === "active").length,
        criticalAlerts: alertsData.filter(
          (a) => a.severity === "critical" && a.status === "active"
        ).length,
      }));

      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // ==================== RENDER HELPERS ====================
  const renderTabNavigation = () => {
    const tabs = [
      { id: "overview", label: t("overview"), icon: "📊" },
      { id: "sensors", label: t("sensors"), icon: "📡" },
      { id: "alerts", label: t("alerts"), icon: "🚨" },
      { id: "test", label: "Test Panel", icon: "🧪" },
    ];

    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Recent Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🚨 {t("recentAlerts")}
        </h2>
        {alerts.slice(0, 3).length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>{t("noActiveAlerts")}</p>
          </div>
        )}
      </div>

      {/* Sensor Status Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📡 {t("sensorStatus")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.slice(0, 6).map((sensor) => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              readings={sensorReadings[sensor.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderSensorsTab = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        📡 {t("allSensors")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            sensor={sensor}
            readings={sensorReadings[sensor.id] || []}
          />
        ))}
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        🚨 {t("allAlerts")}
      </h2>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-medium mb-2">{t("noAlertsFound")}</h3>
          <p>{t("allSensorsOperatingNormally")}</p>
        </div>
      )}
    </div>
  );

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t("loadingSensorData")}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🌊 {t("sensorDashboard")}
          </h1>
          <p className="text-gray-600">{t("realTimeWaterQualityMonitoring")}</p>
          <div className="flex items-center space-x-4 mt-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isDemoMode
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isDemoMode ? "🎮 Demo Mode" : "🔥 Firebase Mode"}
            </span>
            <button
              onClick={fetchFromAPI}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {t("lastUpdated")}: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon="📡"
          title={t("totalSensors")}
          value={stats.totalSensors}
          color="blue"
        />
        <StatsCard
          icon="✅"
          title={t("onlineSensors")}
          value={stats.onlineSensors}
          color="green"
        />
        <StatsCard
          icon="⚠️"
          title={t("activeAlerts")}
          value={stats.activeAlerts}
          color="yellow"
        />
        <StatsCard
          icon="🚨"
          title={t("criticalAlerts")}
          value={stats.criticalAlerts}
          color="red"
        />
      </div>

      {/* Navigation Tabs */}
      {renderTabNavigation()}

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "sensors" && renderSensorsTab()}
      {activeTab === "alerts" && renderAlertsTab()}
      {activeTab === "test" && (
        <div className="space-y-6">
          {renderSimulationControls()}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Simulation Information
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                • The simulation generates realistic water quality sensor data
              </p>
              <p>
                • Data includes pH, turbidity, E.coli, temperature, and other
                parameters
              </p>
              <p>
                • Critical readings trigger automatic email alerts to government
                officials
              </p>
              <p>• Use this for testing and demonstration purposes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorDashboard;
