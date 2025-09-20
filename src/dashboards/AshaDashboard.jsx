import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import DataForm from "../components/forms/DataForm";
import PatientRecordForm from "../components/forms/PatientRecordForm";
import LanguageSelector from "../components/common/LanguageSelector";
import { getAshaPatientRecords } from "../services/patientService";

const submittedReports = [
  {
    id: 1,
    date: "2025-09-15",
    time: "2:30 PM",
    village: "Majuli Village 1",
    ph: 6.8,
    turbidity: 12,
    ecoli: 15,
    risk: "High",
    status: "Reviewed",
  },
  {
    id: 2,
    date: "2025-09-10",
    time: "10:15 AM",
    village: "Majuli Village 2",
    ph: 7.1,
    turbidity: 8,
    ecoli: 5,
    risk: "Medium",
    status: "Pending",
  },
  {
    id: 3,
    date: "2025-09-08",
    time: "4:45 PM",
    village: "Majuli Village 3",
    ph: 7.2,
    turbidity: 6,
    ecoli: 2,
    risk: "Low",
    status: "Approved",
  },
];

const alerts = [
  {
    id: 1,
    date: "Today",
    time: "2:30 PM",
    type: "critical",
    message: "High risk detected in Village 1! Officials alerted immediately.",
    priority: "URGENT",
  },
  {
    id: 2,
    date: "Yesterday",
    time: "11:20 AM",
    type: "warning",
    message: "Water quality monitoring required for Village 2 this week.",
    priority: "HIGH",
  },
  {
    id: 3,
    date: "2 days ago",
    time: "9:15 AM",
    type: "info",
    message: "Monthly report submitted successfully to health department.",
    priority: "NORMAL",
  },
];

const AshaDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitType, setSubmitType] = useState("water");
  const [reportsType, setReportsType] = useState("water");

  // Load patient records for this ASHA worker
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = getAshaPatientRecords(user.uid, (records) => {
        setPatientRecords(records);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSubmit = (data) => {
    // TODO: Integrate with Firestore
    alert("Report submitted! (Firestore integration pending)");
    console.log(data);
  };

  const handlePatientRecordSubmit = (result) => {
    if (result.success) {
      // Patient records will automatically update via real-time listener
    }
  };

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
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Reviewed":
        return "text-blue-600 bg-blue-100";
      case "Pending":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="w-full px-2">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AquaAlert</h1>
                  <p className="text-xs text-gray-500">{t("ashaDashboard")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile Section */}
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                    <span className="text-sm font-medium text-gray-900">
                      {user?.email?.split("@")[0] || t("ashaWorker")}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
                      {t("ashaWorker")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* Navigation Links */}
              <Link
                to="/"
                className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {t("home")}
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {t("signOut")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-2 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Reports",
              value: submittedReports.length,
              color: "blue",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            },
            {
              label: "High Risk",
              value: submittedReports.filter((r) => r.risk === "High").length,
              color: "red",
              icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
            },
            {
              label: "Pending",
              value: submittedReports.filter((r) => r.status === "Pending")
                .length,
              color: "yellow",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              label: "This Month",
              value: 15,
              color: "green",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : stat.color === "red"
                      ? "bg-red-50 text-red-600"
                      : stat.color === "yellow"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={stat.icon}
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex px-6" aria-label="Tabs">
              {[
                {
                  id: "overview",
                  name: t("overview"),
                  icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z",
                },
                {
                  id: "submit",
                  name: t("submit") + " " + t("reports"),
                  icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
                },
                {
                  id: "reports",
                  name: t("reports"),
                  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                },
                {
                  id: "alerts",
                  name: t("alerts"),
                  icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  }`}
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
                      d={tab.icon}
                    />
                  </svg>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dashboard Overview
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Recent Activity
                      </h4>
                      <div className="space-y-3">
                        {[
                          {
                            text: "Report submitted for Majuli Village 1",
                            color: "green",
                          },
                          {
                            text: "High risk alert sent to officials",
                            color: "blue",
                          },
                          {
                            text: "Monthly report compilation pending",
                            color: "yellow",
                          },
                        ].map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                activity.color === "green"
                                  ? "bg-green-400"
                                  : activity.color === "blue"
                                  ? "bg-blue-400"
                                  : "bg-yellow-400"
                              }`}
                            ></div>
                            {activity.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            text: "📝 Submit New Water Quality Report",
                            action: () => setActiveTab("submit"),
                          },
                          {
                            text: "📊 View All Submitted Reports",
                            action: () => setActiveTab("reports"),
                          },
                          {
                            text: "🚨 Check Alert Notifications",
                            action: () => setActiveTab("alerts"),
                          },
                        ].map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors text-sm text-gray-700"
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Report Tab */}
            {activeTab === "submit" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Submit New Reports
                </h3>

                {/* Tab selector for different types of reports */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setSubmitType("water")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        submitType === "water"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Water Quality Report
                    </button>
                    <button
                      onClick={() => setSubmitType("patient")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        submitType === "patient"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Patient Record
                    </button>
                  </nav>
                </div>

                {/* Water Quality Report Form */}
                {submitType === "water" && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Submit Water Quality Report
                    </h4>
                    <DataForm onSubmit={handleSubmit} />
                  </div>
                )}

                {/* Patient Record Form */}
                {submitType === "patient" && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Submit Patient Record
                    </h4>
                    <PatientRecordForm
                      onSubmit={handlePatientRecordSubmit}
                      onCancel={() => {}}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  My Submitted Reports
                </h3>

                {/* Tab selector for different types of reports */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setReportsType("water")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        reportsType === "water"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Water Quality Reports
                    </button>
                    <button
                      onClick={() => setReportsType("patient")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        reportsType === "patient"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Patient Records ({patientRecords.length})
                    </button>
                  </nav>
                </div>

                {/* Water Quality Reports */}
                {reportsType === "water" && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Village
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              pH Level
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Turbidity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              E. Coli
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Risk Level
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {submittedReports.map((report) => (
                            <tr
                              key={report.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.date}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {report.time}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {report.village}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {report.ph}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {report.turbidity} NTU
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {report.ecoli} CFU
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-md ${getRiskColor(
                                    report.risk
                                  )}`}
                                >
                                  {report.risk}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-md ${getStatusColor(
                                    report.status
                                  )}`}
                                >
                                  {report.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Patient Records */}
                {reportsType === "patient" && (
                  <div className="bg-white rounded-xl border border-gray-100">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">
                          Loading patient records...
                        </p>
                      </div>
                    ) : patientRecords.length === 0 ? (
                      <div className="p-8 text-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
                        <p className="text-gray-500 mb-2">
                          No patient records yet
                        </p>
                        <p className="text-sm text-gray-400">
                          Start by submitting your first patient record in the
                          Submit Report tab
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient Details
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Symptoms
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {patientRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.patientName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {record.age} years, {record.gender}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {record.village}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.district}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {record.symptoms.slice(0, 2).join(", ")}
                                    {record.symptoms.length > 2 &&
                                      ` +${record.symptoms.length - 2} more`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Severity: {record.symptomSeverity}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      record.priority === "critical"
                                        ? "bg-red-100 text-red-800"
                                        : record.priority === "high"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {record.priority}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      record.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : record.status === "reviewed"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.createdAt
                                    ?.toDate?.()
                                    ?.toLocaleDateString() || "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === "alerts" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Alerts & Notifications
                </h3>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        alert.type === "critical"
                          ? "bg-red-50 border-red-200"
                          : alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                alert.priority === "URGENT"
                                  ? "bg-red-500 text-white"
                                  : alert.priority === "HIGH"
                                  ? "bg-orange-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {alert.priority}
                            </span>
                            <span className="text-xs text-gray-600">
                              {alert.date} • {alert.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">
                            {alert.message}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3 ${
                            alert.type === "critical"
                              ? "bg-red-500"
                              : alert.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        >
                          <svg
                            className="w-3 h-3 text-white"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AshaDashboard;
