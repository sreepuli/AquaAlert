import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import LazyMapView from "../components/common/LazyMapView";
import LazyRiskChart from "../components/dashboard/LazyRiskChart";
import AlertList from "../components/dashboard/AlertList";
import RiskAlertSystem from "../components/dashboard/RiskAlertSystem";
import LanguageSelector from "../components/common/LanguageSelector";
import SensorDashboard from "../components/dashboard/SensorDashboard";
import { getAllPatientRecords } from "../services/patientService";

const allVillages = [
  { village: "Majuli Village 1", position: [26.97, 94.17], risk: "High" },
  { village: "Majuli Village 2", position: [26.95, 94.15], risk: "Medium" },
  { village: "Majuli Village 3", position: [26.93, 94.13], risk: "Low" },
];

const chartData = [
  { date: "2025-09-01", risk: 3, cases: 10 },
  { date: "2025-09-08", risk: 2, cases: 7 },
  { date: "2025-09-15", risk: 1, cases: 3 },
];

const alerts = [
  {
    id: 1,
    date: "2025-09-15",
    time: "2:30 PM",
    village: "Majuli Village 1",
    risk: "High",
    ecoli: 15,
    status: "Sent",
    priority: "URGENT",
    type: "critical",
  },
  {
    id: 2,
    date: "2025-09-10",
    time: "11:20 AM",
    village: "Majuli Village 2",
    risk: "Medium",
    ecoli: 8,
    status: "Sent",
    priority: "HIGH",
    type: "warning",
  },
  {
    id: 3,
    date: "2025-09-05",
    time: "9:15 AM",
    village: "Majuli Village 3",
    risk: "Low",
    ecoli: 2,
    status: "Not Sent",
    priority: "NORMAL",
    type: "info",
  },
];

const recentReports = [
  {
    id: 1,
    village: "Majuli Village 1",
    submittedBy: "ASHA Worker A",
    date: "2025-09-15",
    risk: "High",
    status: "Under Review",
  },
  {
    id: 2,
    village: "Majuli Village 2",
    submittedBy: "ASHA Worker B",
    date: "2025-09-14",
    risk: "Medium",
    status: "Approved",
  },
  {
    id: 3,
    village: "Majuli Village 3",
    submittedBy: "ASHA Worker C",
    date: "2025-09-13",
    risk: "Low",
    status: "Approved",
  },
  {
    id: 4,
    village: "Majuli Village 1",
    submittedBy: "ASHA Worker A",
    date: "2025-09-10",
    risk: "High",
    status: "Action Taken",
  },
];

const OfficialDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [allPatientRecords, setAllPatientRecords] = useState([]);
  const [patientRecordsLoading, setPatientRecordsLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [selectedComplaintFilter, setSelectedComplaintFilter] = useState("all");

  // Load all patient records for government monitoring
  useEffect(() => {
    const unsubscribe = getAllPatientRecords((records) => {
      setAllPatientRecords(records);
      setPatientRecordsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setComplaintsLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3001"
          }/api/complaints`
        );
        if (response.ok) {
          const data = await response.json();
          setComplaints(data.complaints || []);
        } else {
          console.error("Failed to fetch complaints:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setComplaintsLoading(false);
      }
    };

    fetchComplaints();

    // Refresh complaints every 30 seconds
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

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
      case "Under Review":
        return "text-blue-600 bg-blue-100";
      case "Action Taken":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const downloadCSV = () => {
    const csvData = recentReports
      .map(
        (report) =>
          `${report.village},${report.submittedBy},${report.date},${report.risk},${report.status}`
      )
      .join("\n");

    const blob = new Blob(
      [`Village,Submitted By,Date,Risk Level,Status\n${csvData}`],
      { type: "text/csv" }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-quality-reports-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 main-container">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-50 edge-to-edge">
        <div className="w-screen px-0">
          <div className="flex justify-between h-20 max-w-full mx-0">
            <div className="flex items-center ml-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AquaAlert
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {t("officialDashboard")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mr-4">
              {/* User Profile and Actions */}
              <div className="flex items-center space-x-4 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-2xl border border-emerald-200">
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {user?.email?.split("@")[0] || t("governmentOfficial")}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {t("governmentOfficial").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* Navigation Links */}
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-medium"
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
                {t("home")}
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
                {t("signOut")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-screen px-0 py-8 edge-to-edge">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-red-400 to-red-500 rounded-xl flex items-center justify-center">
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Critical Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter((a) => a.type === "critical").length}
                </p>
              </div>
            </div>
          </div>

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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentReports.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentReports.filter((r) => r.status === "Under Review")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
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
                  Villages Monitored
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {allVillages.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-0 ml-4" aria-label="Tabs">
                {[
                  {
                    id: "overview",
                    name: t("overview"),
                    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z",
                  },
                  {
                    id: "patients",
                    name: t("patientRecords"),
                    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  },
                  {
                    id: "map",
                    name: t("riskMap"),
                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                  },
                  {
                    id: "analytics",
                    name: t("analytics"),
                    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  },
                  {
                    id: "sensors",
                    name: t("sensorDashboard"),
                    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
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
                  {
                    id: "complaints",
                    name: "Complaints",
                    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
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
                        d={tab.icon}
                      />
                    </svg>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    System Overview
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Activity
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          Critical alert from Majuli Village 1
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          3 new reports pending review
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          Weekly report generated
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                      </h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveTab("map")}
                          className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700"
                        >
                          🗺️ View Risk Map & Hotspots
                        </button>
                        <button
                          onClick={() => setActiveTab("reports")}
                          className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700"
                        >
                          📊 Review Submitted Reports
                        </button>
                        <button
                          onClick={downloadCSV}
                          className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700"
                        >
                          📁 Download Data Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Records Tab */}
              {activeTab === "patients" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Patient Records Monitoring
                    </h3>
                    <div className="text-sm text-gray-500">
                      Total Records: {allPatientRecords.length}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Total Patients",
                        value: allPatientRecords.length,
                        color: "blue",
                        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                      },
                      {
                        label: "Critical Cases",
                        value: allPatientRecords.filter(
                          (r) => r.priority === "critical"
                        ).length,
                        color: "red",
                        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                      },
                      {
                        label: "Pending Review",
                        value: allPatientRecords.filter(
                          (r) => r.status === "pending"
                        ).length,
                        color: "yellow",
                        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                      },
                      {
                        label: "Today's Records",
                        value: allPatientRecords.filter((r) => {
                          const today = new Date();
                          const recordDate = r.createdAt?.toDate?.();
                          return (
                            recordDate &&
                            recordDate.toDateString() === today.toDateString()
                          );
                        }).length,
                        color: "green",
                        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              {stat.label}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stat.value}
                            </p>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
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
                              className="w-6 h-6"
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

                  {/* Patient Records Table */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900">
                        All Patient Records
                      </h4>
                    </div>

                    {patientRecordsLoading ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">
                          Loading patient records...
                        </p>
                      </div>
                    ) : allPatientRecords.length === 0 ? (
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
                          No patient records found
                        </p>
                        <p className="text-sm text-gray-400">
                          Patient records submitted by ASHA workers will appear
                          here
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
                                ASHA Worker
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Symptoms & Severity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Submitted
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allPatientRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.patientName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {record.age} years, {record.gender}
                                    </div>
                                    {record.phoneNumber && (
                                      <div className="text-sm text-gray-500">
                                        {record.phoneNumber}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {record.ashaWorkerName}
                                  </div>
                                  {record.ashaWorkerPhone && (
                                    <div className="text-sm text-gray-500">
                                      {record.ashaWorkerPhone}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {record.village}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.district}, {record.state}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {record.symptoms.slice(0, 2).join(", ")}
                                    {record.symptoms.length > 2 &&
                                      ` +${record.symptoms.length - 2} more`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Severity:{" "}
                                    <span className="font-medium">
                                      {record.symptomSeverity}
                                    </span>
                                  </div>
                                  {record.temperature > 0 && (
                                    <div className="text-sm text-gray-500">
                                      Temp: {record.temperature}°F
                                    </div>
                                  )}
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
                                  <br />
                                  <span className="text-xs text-gray-400">
                                    {record.createdAt
                                      ?.toDate?.()
                                      ?.toLocaleTimeString() || ""}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Map Tab */}
              {activeTab === "map" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Water Quality Risk Map
                  </h3>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
                    <LazyMapView locations={allVillages} />
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Trend Analysis & Predictions
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200">
                    <LazyRiskChart data={chartData} />
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Submitted Reports
                    </h3>
                    <button
                      onClick={downloadCSV}
                      className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download CSV
                    </button>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-emerald-500 to-teal-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Village
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Submitted By
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Risk Level
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentReports.map((report) => (
                            <tr
                              key={report.id}
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {report.village}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {report.submittedBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {report.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(
                                    report.risk
                                  )}`}
                                >
                                  {report.risk}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    report.status
                                  )}`}
                                >
                                  {report.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-emerald-600 hover:text-emerald-900 mr-3">
                                  Review
                                </button>
                                <button className="text-blue-600 hover:text-blue-900">
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === "alerts" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Alert Management
                  </h3>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                          alert.type === "critical"
                            ? "bg-red-50 border-red-200"
                            : alert.type === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  alert.priority === "URGENT"
                                    ? "bg-red-500 text-white"
                                    : alert.priority === "HIGH"
                                    ? "bg-orange-500 text-white"
                                    : "bg-blue-500 text-white"
                                }`}
                              >
                                {alert.priority}
                              </span>
                              <span className="text-sm text-gray-600">
                                {alert.date} • {alert.time}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  alert.status === "Sent"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {alert.status}
                              </span>
                            </div>
                            <p className="text-gray-800 font-medium mb-1">
                              {alert.village} - Risk Level: {alert.risk}
                            </p>
                            <p className="text-sm text-gray-600">
                              E. Coli Count: {alert.ecoli} CFU/100ml
                            </p>
                          </div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              alert.type === "critical"
                                ? "bg-red-500"
                                : alert.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          >
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Legacy Alert System
                    </h4>
                    <AlertList alerts={alerts} />
                  </div>
                </div>
              )}

              {/* Sensors Tab */}
              {activeTab === "sensors" && (
                <div>
                  <SensorDashboard />
                </div>
              )}

              {/* Complaints Tab */}
              {activeTab === "complaints" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Community Complaints
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Review and manage water quality complaints from the
                        community
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Filter Dropdown */}
                      <select
                        value={selectedComplaintFilter}
                        onChange={(e) =>
                          setSelectedComplaintFilter(e.target.value)
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Complaints</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="critical">Critical Priority</option>
                        <option value="high">High Priority</option>
                      </select>

                      {/* Refresh Button */}
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100">Critical</p>
                          <p className="text-2xl font-bold">
                            {
                              complaints.filter(
                                (c) => c.priority === "critical"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-red-400 rounded-full">
                          <svg
                            className="w-6 h-6"
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

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">High Priority</p>
                          <p className="text-2xl font-bold">
                            {
                              complaints.filter((c) => c.priority === "high")
                                .length
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-orange-400 rounded-full">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Open</p>
                          <p className="text-2xl font-bold">
                            {
                              complaints.filter((c) => c.status === "open")
                                .length
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-blue-400 rounded-full">
                          <svg
                            className="w-6 h-6"
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
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total</p>
                          <p className="text-2xl font-bold">
                            {complaints.length}
                          </p>
                        </div>
                        <div className="p-3 bg-green-400 rounded-full">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complaints List */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recent Complaints
                      </h3>
                    </div>

                    {complaintsLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">
                            Loading complaints...
                          </span>
                        </div>
                      </div>
                    ) : complaints.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 text-lg">
                          No complaints submitted yet
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Community members can report issues through their
                          dashboard
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {complaints
                          .filter((complaint) => {
                            if (selectedComplaintFilter === "all") return true;
                            if (
                              selectedComplaintFilter === "critical" ||
                              selectedComplaintFilter === "high"
                            ) {
                              return (
                                complaint.priority === selectedComplaintFilter
                              );
                            }
                            return complaint.status === selectedComplaintFilter;
                          })
                          .map((complaint) => (
                            <div
                              key={complaint.id}
                              className="p-6 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {complaint.title}
                                    </h4>

                                    {/* Priority Badge */}
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        complaint.priority === "critical"
                                          ? "bg-red-100 text-red-800"
                                          : complaint.priority === "high"
                                          ? "bg-orange-100 text-orange-800"
                                          : complaint.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {complaint.priority?.toUpperCase() ||
                                        "LOW"}
                                    </span>

                                    {/* Category Badge */}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {complaint.category
                                        ?.replace("_", " ")
                                        .toUpperCase() || "GENERAL"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">
                                          Description:
                                        </span>
                                      </p>
                                      <p className="text-gray-800">
                                        {complaint.description}
                                      </p>
                                    </div>

                                    <div className="space-y-2">
                                      {complaint.location && (
                                        <p className="text-sm">
                                          <span className="font-medium text-gray-600">
                                            Location:
                                          </span>
                                          <span className="text-gray-800 ml-1">
                                            {complaint.location}
                                          </span>
                                        </p>
                                      )}

                                      {!complaint.anonymous &&
                                        complaint.contactName && (
                                          <p className="text-sm">
                                            <span className="font-medium text-gray-600">
                                              Contact:
                                            </span>
                                            <span className="text-gray-800 ml-1">
                                              {complaint.contactName}
                                            </span>
                                            {complaint.contactEmail && (
                                              <span className="text-gray-600 ml-1">
                                                ({complaint.contactEmail})
                                              </span>
                                            )}
                                          </p>
                                        )}

                                      {complaint.anonymous && (
                                        <p className="text-sm">
                                          <span className="font-medium text-gray-600">
                                            Contact:
                                          </span>
                                          <span className="text-gray-500 ml-1 italic">
                                            Anonymous submission
                                          </span>
                                        </p>
                                      )}

                                      <p className="text-sm">
                                        <span className="font-medium text-gray-600">
                                          Submitted:
                                        </span>
                                        <span className="text-gray-800 ml-1">
                                          {new Date(
                                            complaint.createdAt
                                          ).toLocaleDateString()}{" "}
                                          at{" "}
                                          {new Date(
                                            complaint.createdAt
                                          ).toLocaleTimeString()}
                                        </span>
                                      </p>

                                      <p className="text-sm">
                                        <span className="font-medium text-gray-600">
                                          ID:
                                        </span>
                                        <span className="text-gray-800 ml-1 font-mono">
                                          {complaint.id}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="ml-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      complaint.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : complaint.status === "in_progress"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {complaint.status
                                      ?.replace("_", " ")
                                      .toUpperCase() || "OPEN"}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-4 flex items-center space-x-3">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                  Mark In Progress
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                  Mark Resolved
                                </button>
                                {(complaint.priority === "critical" ||
                                  complaint.priority === "high") && (
                                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                                    Escalate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialDashboard;
