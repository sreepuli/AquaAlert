import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings,
  Database,
  Mail,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit3,
} from "lucide-react";
import AdminVerification from "../components/admin/AdminVerification";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // State for various admin data
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    activeAlerts: 0,
    totalReports: 0,
  });

  const [users, setUsers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Check if user is admin
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.userType !== "admin")) {
      navigate("/auth");
      return;
    }

    fetchAdminData();
    setupRealTimeListeners();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      // Fetch pending verifications
      const pendingQuery = query(
        collection(db, "users"),
        where("verificationStatus", "==", "pending"),
        where("role", "==", "official")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingVerifications(pendingData);

      // Calculate system stats
      const stats = {
        totalUsers: usersData.length,
        pendingVerifications: pendingData.length,
        activeAlerts: usersData.filter(
          (u) => u.role === "official" && u.verificationStatus === "approved"
        ).length,
        totalReports: usersData.filter(
          (u) => u.role === "asha" || u.role === "community"
        ).length,
      };
      setSystemStats(stats);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    // Real-time listener for pending verifications
    const pendingQuery = query(
      collection(db, "users"),
      where("verificationStatus", "==", "pending"),
      where("role", "==", "official")
    );

    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      const pendingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingVerifications(pendingData);

      // Update stats
      setSystemStats((prev) => ({
        ...prev,
        pendingVerifications: pendingData.length,
      }));
    });

    return () => unsubscribe();
  };

  const handleUserAction = async (userId, action, userData = {}) => {
    try {
      const userRef = doc(db, "users", userId);

      switch (action) {
        case "approve":
          await updateDoc(userRef, {
            verificationStatus: "approved",
            isActive: true,
            approvedAt: new Date(),
            approvedBy: user.uid,
          });
          break;

        case "reject":
          await updateDoc(userRef, {
            verificationStatus: "rejected",
            isActive: false,
            rejectedAt: new Date(),
            rejectedBy: user.uid,
            rejectionReason: userData.reason || "No reason provided",
          });
          break;

        case "suspend":
          await updateDoc(userRef, {
            isActive: false,
            suspendedAt: new Date(),
            suspendedBy: user.uid,
            suspensionReason: userData.reason || "No reason provided",
          });
          break;

        case "activate":
          await updateDoc(userRef, {
            isActive: true,
            reactivatedAt: new Date(),
            reactivatedBy: user.uid,
          });
          break;

        case "delete":
          if (
            window.confirm(
              "Are you sure you want to delete this user? This action cannot be undone."
            )
          ) {
            await deleteDoc(userRef);
          }
          break;
      }

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-white/70">
                    AquaAlert System Administration
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white/90 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm">Admin: </span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "users", label: "User Management", icon: Users },
              { id: "verifications", label: "Verifications", icon: UserCheck },
              { id: "system", label: "System Health", icon: Settings },
              { id: "reports", label: "Reports", icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === id
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={systemStats.totalUsers}
                icon={Users}
                color="text-blue-600"
                description="All registered users"
              />
              <StatCard
                title="Pending Verifications"
                value={systemStats.pendingVerifications}
                icon={Clock}
                color="text-orange-600"
                description="Government officials awaiting approval"
              />
              <StatCard
                title="Active Officials"
                value={systemStats.activeAlerts}
                icon={CheckCircle}
                color="text-green-600"
                description="Verified government users"
              />
              <StatCard
                title="Field Workers"
                value={systemStats.totalReports}
                icon={Activity}
                color="text-purple-600"
                description="ASHA + Community members"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {pendingVerifications.slice(0, 5).map((verification, index) => (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {verification.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          {verification.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-orange-400 text-sm font-medium">
                      Pending Verification
                    </span>
                  </div>
                ))}
                {pendingVerifications.length === 0 && (
                  <p className="text-white/60 text-center py-4">
                    No pending verifications
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all" className="bg-gray-800">
                    All Roles
                  </option>
                  <option value="official" className="bg-gray-800">
                    Government Officials
                  </option>
                  <option value="asha" className="bg-gray-800">
                    ASHA Workers
                  </option>
                  <option value="community" className="bg-gray-800">
                    Community Members
                  </option>
                  <option value="admin" className="bg-gray-800">
                    Administrators
                  </option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-xl font-bold text-white">
                  User Management
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">
                              {user.name}
                            </p>
                            <p className="text-white/60 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "official"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "asha"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.verificationStatus === "approved"
                                ? "bg-green-100 text-green-800"
                                : user.verificationStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : user.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.verificationStatus || "active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/60 text-sm">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {user.verificationStatus === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUserAction(user.id, "approve")
                                  }
                                  className="text-green-400 hover:text-green-300 p-1"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt(
                                      "Reason for rejection:"
                                    );
                                    if (reason)
                                      handleUserAction(user.id, "reject", {
                                        reason,
                                      });
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {user.isActive ? (
                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    "Reason for suspension:"
                                  );
                                  if (reason)
                                    handleUserAction(user.id, "suspend", {
                                      reason,
                                    });
                                }}
                                className="text-orange-400 hover:text-orange-300 p-1"
                                title="Suspend"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUserAction(user.id, "activate")
                                }
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Activate"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleUserAction(user.id, "delete")
                              }
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/60">
                      No users found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "verifications" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <AdminVerification />
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                System Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300">
                    Database Status
                  </h4>
                  <p className="text-green-200">Connected</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300">API Status</h4>
                  <p className="text-blue-200">Operational</p>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-300">
                    Email Service
                  </h4>
                  <p className="text-purple-200">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              System Reports
            </h3>
            <p className="text-white/70">
              Report generation and analytics coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
