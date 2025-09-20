import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Users,
  Droplets,
  Mail,
  FileText,
  Activity,
  Clock,
  MapPin,
} from "lucide-react";
import GovernmentAlerts from "../components/dashboard/GovernmentAlerts";
import WaterQualityMonitor from "../components/dashboard/WaterQualityMonitor";
import PatientRecordsOverview from "../components/admin/PatientRecordsOverview";
import DailyReportsManager from "../components/admin/DailyReportsManager";

const GovernmentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStatus, setSystemStatus] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch system status
      const statusResponse = await fetch("/api/sensors/simulation/status");
      const statusData = await statusResponse.json();
      setSystemStatus(statusData.data);

      // Fetch water quality data
      const sensorsResponse = await fetch("/api/sensors");
      const sensorsData = await sensorsResponse.json();
      setWaterQualityData(sensorsData.data);

      // Fetch recent alerts
      const alertsResponse = await fetch("/api/sensors/alerts?limit=10");
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setCriticalAlerts(alertsData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealth = () => {
    if (!systemStatus) return { status: "unknown", color: "gray" };

    const activeSensors =
      systemStatus.sensors?.filter((s) => s.status === "active").length || 0;
    const totalSensors = systemStatus.sensors?.length || 0;
    const criticalCount = criticalAlerts.filter(
      (a) => a.severity === "critical"
    ).length;

    if (criticalCount > 0) return { status: "critical", color: "red" };
    if (activeSensors < totalSensors)
      return { status: "warning", color: "yellow" };
    return { status: "healthy", color: "green" };
  };

  const systemHealth = getSystemHealth();

  const tabButtons = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "water-quality", label: "Water Quality", icon: Droplets },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "reports", label: "Daily Reports", icon: FileText },
    { id: "patients", label: "Health Records", icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Government Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Droplets className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  AquaAlert Government Dashboard
                </h1>
              </div>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  systemHealth.color === "green"
                    ? "bg-green-100 text-green-800"
                    : systemHealth.color === "yellow"
                    ? "bg-yellow-100 text-yellow-800"
                    : systemHealth.color === "red"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemHealth.color === "green"
                      ? "bg-green-500"
                      : systemHealth.color === "yellow"
                      ? "bg-yellow-500"
                      : systemHealth.color === "red"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="capitalize">{systemHealth.status}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Clock className="inline h-4 w-4 mr-1" />
                Last Updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabButtons.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.id === "alerts" && criticalAlerts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {criticalAlerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            systemStatus={systemStatus}
            criticalAlerts={criticalAlerts}
            waterQualityData={waterQualityData}
          />
        )}

        {activeTab === "water-quality" && (
          <WaterQualityMonitor data={waterQualityData} />
        )}

        {activeTab === "alerts" && (
          <GovernmentAlerts
            alerts={criticalAlerts}
            onRefresh={fetchDashboardData}
          />
        )}

        {activeTab === "reports" && <DailyReportsManager />}

        {activeTab === "patients" && <PatientRecordsOverview />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ systemStatus, criticalAlerts, waterQualityData }) => {
  const totalSensors = systemStatus?.sensors?.length || 0;
  const activeSensors =
    systemStatus?.sensors?.filter((s) => s.status === "active").length || 0;
  const criticalCount = criticalAlerts.filter(
    (a) => a.severity === "critical"
  ).length;
  const warningCount = criticalAlerts.filter(
    (a) => a.severity === "warning"
  ).length;

  const stats = [
    {
      name: "Active Sensors",
      value: `${activeSensors}/${totalSensors}`,
      icon: Activity,
      color: activeSensors === totalSensors ? "green" : "yellow",
    },
    {
      name: "Critical Alerts",
      value: criticalCount,
      icon: AlertTriangle,
      color: criticalCount > 0 ? "red" : "green",
    },
    {
      name: "Warning Alerts",
      value: warningCount,
      icon: AlertTriangle,
      color: warningCount > 0 ? "yellow" : "green",
    },
    {
      name: "Villages Monitored",
      value: 3,
      icon: MapPin,
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg ${
                    stat.color === "green"
                      ? "bg-green-100"
                      : stat.color === "yellow"
                      ? "bg-yellow-100"
                      : stat.color === "red"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      stat.color === "green"
                        ? "text-green-600"
                        : stat.color === "yellow"
                        ? "text-yellow-600"
                        : stat.color === "red"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Water Quality Data */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Latest Water Quality Readings
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  pH Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turbidity (NTU)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E.coli (CFU/100ml)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperature (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waterQualityData.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sensor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.lastReading?.ph || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.lastReading?.turbidity || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.lastReading?.ecoli || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.lastReading?.temperature || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sensor.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Critical Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {criticalAlerts.slice(0, 3).map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "critical"
                      ? "border-red-400 bg-red-50"
                      : alert.severity === "warning"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-blue-400 bg-blue-50"
                  }`}
                >
                  <div className="flex">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        alert.severity === "critical"
                          ? "text-red-400"
                          : alert.severity === "warning"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.type || "Water Quality Alert"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message || `${alert.parameter}: ${alert.value}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.sensorName} •{" "}
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentDashboard;
