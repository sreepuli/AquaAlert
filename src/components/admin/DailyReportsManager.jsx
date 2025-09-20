import React, { useState, useEffect } from "react";
import {
  Mail,
  Download,
  Calendar,
  Clock,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Settings,
  Send,
  History,
} from "lucide-react";

const DailyReportsManager = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    frequency: "daily",
    time: "08:00",
    recipients: [],
  });
  const [showConfig, setShowConfig] = useState(false);
  const [generateCustom, setGenerateCustom] = useState(false);

  // Fetch report history
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/government/reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReports(data.reports || []);
      setReportConfig(data.config || reportConfig);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send daily report now
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
        fetchReports(); // Refresh the list
      } else {
        alert(`❌ Failed to send report: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error sending report: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Generate custom report
  const generateCustomReport = async (customData) => {
    try {
      setSending(true);

      const response = await fetch("/api/government/generate-custom-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(customData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Custom report generated and sent to ${result.reportsSent} officials`
        );
        setGenerateCustom(false);
        fetchReports();
      } else {
        alert(`❌ Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error generating report: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Update report configuration
  const updateReportConfig = async (newConfig) => {
    try {
      const response = await fetch("/api/government/report-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newConfig),
      });

      const result = await response.json();

      if (result.success) {
        setReportConfig(newConfig);
        setShowConfig(false);
        alert("✅ Report configuration updated successfully");
      } else {
        alert(`❌ Failed to update configuration: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error updating configuration: ${error.message}`);
    }
  };

  // Download report
  const downloadReport = async (reportId) => {
    try {
      const response = await fetch(
        `/api/government/reports/${reportId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `water-quality-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`❌ Error downloading report: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Daily Reports Manager
            </h2>
            <p className="text-gray-600">
              Automated water quality reports for government officials
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfig(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setGenerateCustom(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Custom Report</span>
            </button>
            <button
              onClick={sendDailyReport}
              disabled={sending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            Current Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Frequency:</span>
              <span className="font-medium">{reportConfig.frequency}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{reportConfig.time} IST</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Recipients:</span>
              <span className="font-medium">
                {reportConfig.recipients?.length || 4} officials
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              Report History
            </h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No reports generated yet.</p>
            </div>
          ) : (
            reports.map((report, index) => (
              <ReportCard
                key={report.id || index}
                report={report}
                onDownload={() => downloadReport(report.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <ConfigurationModal
          config={reportConfig}
          onSave={updateReportConfig}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* Custom Report Modal */}
      {generateCustom && (
        <CustomReportModal
          onGenerate={generateCustomReport}
          onClose={() => setGenerateCustom(false)}
          sending={sending}
        />
      )}
    </div>
  );
};

// Individual Report Card Component
const ReportCard = ({ report, onDownload }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "generating":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        );
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {getStatusIcon(report.status)}
          <div>
            <h4 className="font-medium text-gray-900">
              {report.type || "Daily Water Quality Report"}
            </h4>
            <p className="text-sm text-gray-600">
              Generated on {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right text-sm">
            <p className="text-gray-900 font-medium">
              {report.recipientCount || 4} recipients
            </p>
            <p className="text-gray-600">
              {report.attachments?.length || 1} attachments
            </p>
          </div>

          {report.status === "sent" && (
            <button
              onClick={onDownload}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {report.summary && (
        <div className="mt-3 text-sm text-gray-600">
          <p>{report.summary}</p>
        </div>
      )}
    </div>
  );
};

// Configuration Modal Component
const ConfigurationModal = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Report Configuration
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time (IST)
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Report Modal Component
const CustomReportModal = ({ onGenerate, onClose, sending }) => {
  const [formData, setFormData] = useState({
    title: "Custom Water Quality Report",
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 7 days ago
      end: new Date().toISOString().split("T")[0], // today
    },
    includePatientRecords: true,
    includeCriticalAlerts: true,
    additionalNotes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Generate Custom Report
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={formData.dateRange.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateRange: { ...formData.dateRange, start: e.target.value },
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={formData.dateRange.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateRange: { ...formData.dateRange, end: e.target.value },
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includePatientRecords"
                checked={formData.includePatientRecords}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    includePatientRecords: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor="includePatientRecords"
                className="ml-2 text-sm text-gray-700"
              >
                Include Patient Records
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCriticalAlerts"
                checked={formData.includeCriticalAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    includeCriticalAlerts: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor="includeCriticalAlerts"
                className="ml-2 text-sm text-gray-700"
              >
                Include Critical Alerts
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData({ ...formData, additionalNotes: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Any additional information to include in the report..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyReportsManager;
