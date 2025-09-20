import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import LazyMapView from "../components/common/LazyMapView";

const localWaterQuality = {
  village: "Majuli Village 1",
  ph: 6.8,
  turbidity: 12,
  ecoli: 15,
  risk: "High",
  lastUpdated: "2 hours ago",
  nextTest: "Tomorrow at 9:00 AM",
};

const healthTips = [
  {
    icon: "🔥",
    title: "Boil Water",
    description:
      "Boil water for at least 1 minute before drinking to kill harmful bacteria and viruses.",
  },
  {
    icon: "🧼",
    title: "Hand Hygiene",
    description:
      "Wash hands with soap for 20 seconds after using toilet and before eating.",
  },
  {
    icon: "🏺",
    title: "Safe Storage",
    description:
      "Store water in clean, covered containers away from direct sunlight.",
  },
  {
    icon: "📞",
    title: "Report Symptoms",
    description:
      "Immediately report diarrhea, vomiting, or fever to local health workers.",
  },
];

const recentAlerts = [
  {
    id: 1,
    date: "Today",
    time: "2:30 PM",
    type: "critical",
    title: "Water Quality Alert",
    message:
      "High risk detected: Immediate chlorination recommended for all water sources.",
    icon: "🚨",
  },
  {
    id: 2,
    date: "Yesterday",
    time: "6:00 AM",
    type: "warning",
    title: "Preventive Measure",
    message:
      "Boil water advisory issued for the next 48 hours as precautionary measure.",
    icon: "⚠️",
  },
  {
    id: 3,
    date: "2 days ago",
    time: "11:15 AM",
    type: "info",
    title: "Health Worker Visit",
    message:
      "ASHA worker will visit for routine health checkup on Friday morning.",
    icon: "👩‍⚕️",
  },
];

const CommunityDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "from-red-500 to-red-600";
      case "Medium":
        return "from-yellow-500 to-yellow-600";
      case "Low":
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="w-full px-2">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    AquaAlert
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Community Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3 rounded-2xl border border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {user?.email?.split("@")[0] || "User"}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                      COMMUNITY MEMBER
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-2 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Water Quality
                </p>
                <p
                  className={`text-2xl font-bold bg-gradient-to-r ${getRiskColor(
                    localWaterQuality.risk
                  )} bg-clip-text text-transparent`}
                >
                  {localWaterQuality.risk}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">pH Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {localWaterQuality.ph}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentAlerts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Your Village
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {localWaterQuality.village}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Quality Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Water Quality Status
              </h3>
              <div
                className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRiskColor(
                  localWaterQuality.risk
                )} text-white font-semibold`}
              >
                {localWaterQuality.risk} Risk
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">pH</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">pH Level</p>
                    <p className="text-sm text-gray-600">Acidity/Alkalinity</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {localWaterQuality.ph}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-xs">
                      TUR
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Turbidity</p>
                    <p className="text-sm text-gray-600">Water Clarity</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {localWaterQuality.turbidity}{" "}
                  <span className="text-sm text-gray-600">NTU</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold text-xs">EC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">E. Coli</p>
                    <p className="text-sm text-gray-600">Bacterial Count</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {localWaterQuality.ecoli}{" "}
                  <span className="text-sm text-gray-600">CFU</span>
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center text-blue-800">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">
                    Last Updated: {localWaterQuality.lastUpdated}
                  </p>
                  <p className="text-sm">
                    Next Test: {localWaterQuality.nextTest}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Your Area Map
            </h3>
            <div className="h-80 bg-gray-100 rounded-xl overflow-hidden">
              <LazyMapView
                locations={[
                  {
                    village: localWaterQuality.village,
                    position: [26.97, 94.17],
                    risk: localWaterQuality.risk,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Tips */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-green-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Health Tips</h3>
            </div>

            <div className="space-y-4">
              {healthTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">{tip.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-sm text-gray-700">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-red-400 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Recent Alerts
              </h3>
            </div>

            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${getAlertStyle(
                    alert.type
                  )}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-4">{alert.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <div className="text-sm opacity-75">
                          {alert.date} • {alert.time}
                        </div>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="tel:+911234567890"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call ASHA Worker
                </a>
                <span className="text-gray-400">|</span>
                <a
                  href="tel:108"
                  className="flex items-center text-red-600 hover:text-red-700 font-semibold"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Emergency 108
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
