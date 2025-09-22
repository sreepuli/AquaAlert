import React from "react";

const AlertList = ({ alerts }) => {
  const getSeverityColor = (severity) => {
    const severityColors = {
      critical: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      maintenance: "bg-blue-50 border-blue-200 text-blue-800",
    };
    return (
      severityColors[severity] || "bg-gray-50 border-gray-200 text-gray-800"
    );
  };

  const getSeverityIcon = (severity) => {
    const severityIcons = {
      critical: "🚨",
      warning: "⚠️",
      maintenance: "🔧",
    };
    return severityIcons[severity] || "📢";
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Alerts
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <p>No active alerts</p>
          <p className="text-sm">
            All water quality parameters are within normal ranges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <span className="text-sm text-gray-500">{alerts.length} alert(s)</span>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 10).map((alert, idx) => (
          <div
            key={alert.id || idx}
            className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
              alert.severity
            )}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-lg">
                  {getSeverityIcon(alert.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {alert.message || "Water Quality Alert"}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {(alert.severity || "warning").toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>📍 {alert.location || "Unknown Location"}</span>
                      <span>
                        🕒 {formatTimestamp(alert.timestamp || alert.createdAt)}
                      </span>
                      {alert.sensorId && <span>📟 {alert.sensorId}</span>}
                    </div>

                    {alert.parameters && alert.parameters.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">
                          Abnormal Parameters:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {alert.parameters.map((param, paramIdx) => (
                            <span
                              key={paramIdx}
                              className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs"
                            >
                              {param.parameter}: {param.value} (Normal:{" "}
                              {param.normal})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    alert.status === "active"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {(alert.status || "active").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All {alerts.length} Alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertList;
