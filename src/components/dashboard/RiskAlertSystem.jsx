// Risk Alert Management System
// This component handles risk detection and notification to government officials

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const RiskAlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "",
    location: "",
    severity: "medium",
    description: "",
    affectedAreas: [],
  });

  const alertTypes = [
    "Water Contamination",
    "Waterborne Disease Outbreak",
    "Water Shortage",
    "Infrastructure Failure",
    "Environmental Hazard",
  ];

  const severityLevels = [
    { value: "low", label: "Low", color: "text-yellow-600" },
    { value: "medium", label: "Medium", color: "text-orange-600" },
    { value: "high", label: "High", color: "text-red-600" },
    { value: "critical", label: "Critical", color: "text-red-800" },
  ];

  useEffect(() => {
    loadOfficials();
    loadAlerts();
  }, []);

  const loadOfficials = async () => {
    try {
      const officialsQuery = query(
        collection(db, "users"),
        where("role", "==", "official"),
        where("verificationStatus", "==", "approved")
      );

      const snapshot = await getDocs(officialsQuery);
      const officialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOfficials(officialsData);
    } catch (error) {
      console.error("Error loading officials:", error);
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsSnapshot = await getDocs(collection(db, "riskAlerts"));
      const alertsData = alertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by timestamp, newest first
      alertsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const createAlert = async () => {
    if (!newAlert.type || !newAlert.location || !newAlert.description) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create alert document
      const alertData = {
        ...newAlert,
        timestamp: new Date().toISOString(),
        status: "active",
        notificationsSent: 0,
        createdBy: "system", // In production, use current user
      };

      const alertRef = await addDoc(collection(db, "riskAlerts"), alertData);
      alertData.id = alertRef.id;

      // Filter officials based on location/department relevance
      const relevantOfficials = filterRelevantOfficials(officials, newAlert);

      if (relevantOfficials.length > 0) {
        // Create in-app notifications only
        await updateDoc(alertRef, {
          notificationsSent: relevantOfficials.length,
          notificationResults: relevantOfficials.map((official) => ({
            name: official.name,
            department: official.department,
            success: true,
            method: "in-app",
          })),
          notificationStatus: "sent",
        });

        alert(
          `Alert created and notifications sent to ${relevantOfficials.length} officials`
        );
      } else {
        alert("Alert created but no relevant officials found for notification");
      }

      // Reset form and reload alerts
      setNewAlert({
        type: "",
        location: "",
        severity: "medium",
        description: "",
        affectedAreas: [],
      });

      loadAlerts();
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  // Filter officials based on alert location and their department
  const filterRelevantOfficials = (officials, alert) => {
    return officials.filter((official) => {
      // Check if official department is relevant to alert type
      const relevantDepartments = {
        "Water Contamination": ["water", "health", "environment"],
        "Waterborne Disease Outbreak": ["health", "water"],
        "Water Shortage": ["water", "rural", "urban"],
        "Infrastructure Failure": ["water", "urban", "rural"],
        "Environmental Hazard": ["environment", "health", "water"],
      };

      const alertDepts = relevantDepartments[alert.type] || ["water"];
      return alertDepts.includes(official.department);
    });
  };

  const updateAlertStatus = async (alertId, newStatus) => {
    try {
      await updateDoc(doc(db, "riskAlerts", alertId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      loadAlerts();
    } catch (error) {
      console.error("Error updating alert:", error);
      alert("Failed to update alert status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Creation Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Create Risk Alert
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAlert.type}
              onChange={(e) =>
                setNewAlert({ ...newAlert, type: e.target.value })
              }
            >
              <option value="">Select alert type</option>
              {alertTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAlert.severity}
              onChange={(e) =>
                setNewAlert({ ...newAlert, severity: e.target.value })
              }
            >
              {severityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., District Name, City, Village"
            value={newAlert.location}
            onChange={(e) =>
              setNewAlert({ ...newAlert, location: e.target.value })
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Detailed description of the risk..."
            value={newAlert.description}
            onChange={(e) =>
              setNewAlert({ ...newAlert, description: e.target.value })
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {officials.length} verified officials will be notified
          </div>
          <button
            onClick={createAlert}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Alert"}
          </button>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Risk Alerts ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No alerts created yet
          </p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === "critical"
                    ? "border-red-800 bg-red-50"
                    : alert.severity === "high"
                    ? "border-red-600 bg-red-50"
                    : alert.severity === "medium"
                    ? "border-orange-500 bg-orange-50"
                    : "border-yellow-500 bg-yellow-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {alert.type}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === "critical"
                            ? "bg-red-800 text-white"
                            : alert.severity === "high"
                            ? "bg-red-600 text-white"
                            : alert.severity === "medium"
                            ? "bg-orange-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === "active"
                            ? "bg-green-100 text-green-800"
                            : alert.status === "resolved"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {alert.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-2">{alert.description}</p>

                    <div className="text-sm text-gray-500 space-y-1">
                      <div> Location: {alert.location}</div>
                      <div>
                        {" "}
                        Created: {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div>
                        {" "}
                        Notifications sent: {alert.notificationsSent || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {alert.status === "active" && (
                      <button
                        onClick={() => updateAlertStatus(alert.id, "resolved")}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {alert.status === "resolved" && (
                      <button
                        onClick={() => updateAlertStatus(alert.id, "active")}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAlertSystem;
