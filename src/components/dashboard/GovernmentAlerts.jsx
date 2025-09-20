import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Mail,
  Send,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Activity,
} from "lucide-react";

const GovernmentAlerts = ({ alerts, onRefresh }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showSendAlert, setShowSendAlert] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.severity === filter;
  });

  const sendCriticalAlert = async (alertData) => {
    try {
      setSending(true);

      const response = await fetch("/api/government/send-critical-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(alertData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Critical alert sent to ${result.alertsSent} government officials`
        );
        setShowSendAlert(false);
      } else {
        alert(`❌ Failed to send alert: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error sending alert: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const sendDailyReport = async () => {
    try {
      setSending(true);

      const response = await fetch("/api/government/send-daily-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Daily report sent to ${result.reportsSent} government officials`
        );
      } else {
        alert(`❌ Failed to send report: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error sending report: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Government Alert Management
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={sendDailyReport}
              disabled={sending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Send Daily Report</span>
            </button>
            <button
              onClick={() => setShowSendAlert(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Critical Alert</span>
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {["all", "critical", "warning", "info"].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === severity
                  ? severity === "critical"
                    ? "bg-red-100 text-red-800"
                    : severity === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : severity === "info"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
              {severity !== "all" && (
                <span className="ml-2 bg-white rounded-full px-2 py-0.5 text-xs">
                  {alerts.filter((a) => a.severity === severity).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Alerts ({filteredAlerts.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No alerts found for the selected filter.</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <AlertCard
                key={index}
                alert={alert}
                onClick={() => setSelectedAlert(alert)}
              />
            ))
          )}
        </div>
      </div>

      {/* Send Alert Modal */}
      {showSendAlert && (
        <SendAlertModal
          onClose={() => setShowSendAlert(false)}
          onSend={sendCriticalAlert}
          sending={sending}
        />
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onSendAlert={sendCriticalAlert}
          sending={sending}
        />
      )}
    </div>
  );
};

// Individual Alert Card Component
const AlertCard = ({ alert, onClick }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "red";
      case "warning":
        return "yellow";
      case "info":
        return "blue";
      default:
        return "gray";
    }
  };

  const color = getSeverityColor(alert.severity);

  return (
    <div
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`p-2 rounded-lg ${
            color === "red"
              ? "bg-red-100"
              : color === "yellow"
              ? "bg-yellow-100"
              : color === "blue"
              ? "bg-blue-100"
              : "bg-gray-100"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${
              color === "red"
                ? "text-red-600"
                : color === "yellow"
                ? "text-yellow-600"
                : color === "blue"
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {alert.type || `${alert.parameter} Alert`}
            </p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                color === "red"
                  ? "bg-red-100 text-red-800"
                  : color === "yellow"
                  ? "bg-yellow-100 text-yellow-800"
                  : color === "blue"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {alert.severity}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>

          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {alert.sensorName || alert.location}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(alert.timestamp).toLocaleString()}
            </span>
            {alert.value && (
              <span className="flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                {alert.parameter}: {alert.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Send Alert Modal Component
const SendAlertModal = ({ onClose, onSend, sending }) => {
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    measurements: {
      ph: "",
      turbidity: "",
      ecoli: "",
      temperature: "",
    },
    recommendedAction: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const alertData = {
      ...formData,
      timestamp: new Date().toISOString(),
      measurements: {
        ph: parseFloat(formData.measurements.ph) || 0,
        turbidity: parseFloat(formData.measurements.turbidity) || 0,
        ecoli: parseInt(formData.measurements.ecoli) || 0,
        temperature: parseFloat(formData.measurements.temperature) || 0,
      },
    };

    onSend(alertData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Send Critical Alert
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Majuli Village 2 Water Station"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Describe the water quality issue..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurements
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.ph}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measurements: {
                        ...formData.measurements,
                        ph: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  Turbidity (NTU)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.turbidity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measurements: {
                        ...formData.measurements,
                        turbidity: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  E.coli (CFU/100ml)
                </label>
                <input
                  type="number"
                  value={formData.measurements.ecoli}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measurements: {
                        ...formData.measurements,
                        ecoli: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measurements: {
                        ...formData.measurements,
                        temperature: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recommended Action
            </label>
            <textarea
              required
              value={formData.recommendedAction}
              onChange={(e) =>
                setFormData({ ...formData, recommendedAction: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows="2"
              placeholder="What action should officials take?"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Alert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Alert Detail Modal Component
const AlertDetailModal = ({ alert, onClose, onSendAlert, sending }) => {
  const resendAlert = () => {
    const alertData = {
      location: alert.sensorName || alert.location,
      description: alert.message,
      timestamp: new Date().toISOString(),
      measurements: {
        ph: alert.value || 0,
        turbidity: alert.value || 0,
        ecoli: alert.value || 0,
        temperature: 25.0,
      },
      recommendedAction: `Investigate ${alert.parameter} levels at ${alert.sensorName}`,
    };

    onSendAlert(alertData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">Alert Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alert Type
            </label>
            <p className="text-sm text-gray-900">
              {alert.type || `${alert.parameter} Alert`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                alert.severity === "critical"
                  ? "bg-red-100 text-red-800"
                  : alert.severity === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {alert.severity}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <p className="text-sm text-gray-900">
              {alert.sensorName || alert.location}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="text-sm text-gray-900">{alert.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timestamp
            </label>
            <p className="text-sm text-gray-900">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>

          {alert.value && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Measurement
              </label>
              <p className="text-sm text-gray-900">
                {alert.parameter}: {alert.value}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={resendAlert}
            disabled={sending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Resend to Officials</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovernmentAlerts;
