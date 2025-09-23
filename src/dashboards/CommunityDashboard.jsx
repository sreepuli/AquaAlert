import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import LazyMapView from "../components/common/LazyMapView";

// Separate ComplaintForm component to prevent re-rendering issues
const ComplaintForm = ({
  showComplaintForm,
  setShowComplaintForm,
  complaintData,
  setComplaintData,
  submitStatus,
  handleComplaintSubmit,
}) => {
  if (!showComplaintForm) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowComplaintForm(false);
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Submit a Complaint
            </h3>
            <button
              onClick={() => setShowComplaintForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center text-green-800">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold">
                  Complaint submitted successfully!
                </span>
              </div>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-800">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold">
                  Failed to submit complaint. Please try again.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleComplaintSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                required
                value={complaintData.title || ""}
                onChange={(e) =>
                  setComplaintData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={complaintData.category || ""}
                onChange={(e) =>
                  setComplaintData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Category</option>
                <option value="water_quality">Water Quality Issues</option>
                <option value="water_supply">Water Supply Problems</option>
                <option value="infrastructure">Infrastructure Issues</option>
                <option value="health_concerns">Health Concerns</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                required
                value={complaintData.priority || ""}
                onChange={(e) =>
                  setComplaintData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Priority</option>
                <option value="low">Low - Minor issues</option>
                <option value="medium">Medium - Needs attention</option>
                <option value="high">High - Urgent attention required</option>
                <option value="critical">Critical - Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={complaintData.description || ""}
                onChange={(e) =>
                  setComplaintData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Please provide detailed information about the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={complaintData.location || ""}
                onChange={(e) =>
                  setComplaintData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Specific location or landmark"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={complaintData.contactName || ""}
                  onChange={(e) =>
                    setComplaintData((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                  disabled={complaintData.anonymous}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={complaintData.contactEmail || ""}
                  onChange={(e) =>
                    setComplaintData((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  disabled={complaintData.anonymous}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={complaintData.contactPhone || ""}
                  onChange={(e) =>
                    setComplaintData((prev) => ({
                      ...prev,
                      contactPhone: e.target.value,
                    }))
                  }
                  disabled={complaintData.anonymous}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="Your phone number"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={complaintData.anonymous || false}
                  onChange={(e) =>
                    setComplaintData((prev) => ({
                      ...prev,
                      anonymous: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="anonymous"
                  className="text-sm font-medium text-gray-700"
                >
                  Submit this complaint anonymously
                </label>
              </div>

              {complaintData.anonymous && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Anonymous complaints help us identify
                    issues but may limit our ability to follow up directly with
                    you.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowComplaintForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === "submitting"
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main local data
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
  },
  {
    id: 2,
    date: "Yesterday",
    time: "4:15 PM",
    type: "warning",
    title: "Routine Health Check",
    message:
      "ASHA worker will visit for routine health checkup on Friday morning.",
    icon: "👩‍⚕️",
  },
];

const CommunityDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintData, setComplaintData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    anonymous: false,
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (showComplaintForm) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showComplaintForm]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showComplaintForm) {
        setShowComplaintForm(false);
      }
    };

    if (showComplaintForm) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showComplaintForm]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleComplaintSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitStatus("submitting");

      try {
        const complaintPayload = {
          ...complaintData,
          userId: user?.uid || "anonymous",
          userEmail: user?.email || complaintData.contactEmail,
          timestamp: new Date().toISOString(),
          status: "pending",
          village: localWaterQuality.village,
        };

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3001"
          }/api/complaints`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(complaintPayload),
          }
        );

        if (response.ok) {
          setSubmitStatus("success");
          setComplaintData({
            title: "",
            description: "",
            category: "",
            location: "",
            priority: "",
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            anonymous: false,
          });
          setTimeout(() => {
            setShowComplaintForm(false);
            setSubmitStatus(null);
          }, 2000);
        } else {
          setSubmitStatus("error");
        }
      } catch (error) {
        console.error("Complaint submission error:", error);
        setSubmitStatus("error");
      }
    },
    [complaintData, user]
  );

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
                  className="w-5 h-5 mr-2"
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

              {/* Report Issue Button */}
              <button
                onClick={() => setShowComplaintForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>Report Issue</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 font-medium"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-2 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.email?.split("@")[0] || "Community Member"}!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor your local water quality, access health tips, and stay
            informed about important alerts in your community.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Water Quality Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Water Quality
              </h3>
              <div
                className={`px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r ${getRiskColor(
                  localWaterQuality.risk
                )}`}
              >
                {localWaterQuality.risk} Risk
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">pH Level:</span>
                <span className="font-semibold">{localWaterQuality.ph}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Turbidity:</span>
                <span className="font-semibold">
                  {localWaterQuality.turbidity} NTU
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">E. coli:</span>
                <span className="font-semibold">
                  {localWaterQuality.ecoli} CFU/100ml
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Last Updated: {localWaterQuality.lastUpdated}
                </p>
                <p className="text-sm">
                  Next Test: {localWaterQuality.nextTest}
                </p>
              </div>
            </div>
          </div>

          {/* Village Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
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
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Village
                </h3>
                <p className="text-xl text-green-600 font-semibold">
                  {localWaterQuality.village}
                </p>
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Your Area Map
            </h3>
            <div
              className="h-80 bg-gray-100 rounded-xl overflow-hidden relative"
              style={{ zIndex: 1 }}
            >
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
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
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
              {healthTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {tip.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
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
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${getAlertStyle(
                    alert.type
                  )}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {alert.icon && (
                          <span className="text-lg">{alert.icon}</span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span>{alert.date}</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Form Modal */}
      <ComplaintForm
        showComplaintForm={showComplaintForm}
        setShowComplaintForm={setShowComplaintForm}
        complaintData={complaintData}
        setComplaintData={setComplaintData}
        submitStatus={submitStatus}
        handleComplaintSubmit={handleComplaintSubmit}
      />
    </div>
  );
};

export default CommunityDashboard;
