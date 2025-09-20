import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Edit,
  Eye,
} from "lucide-react";

const PatientRecordsOverview = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    highRisk: 0,
    recentCases: 0,
    criticalConditions: 0,
  });

  // Fetch patient data
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPatients(data.patients || []);
      setStatistics(data.statistics || statistics);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id?.toString().includes(searchTerm) ||
      patient.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      patient.riskLevel === filterStatus ||
      (filterStatus === "recent" && isRecentCase(patient.dateAdded));

    return matchesSearch && matchesFilter;
  });

  // Check if case is recent (within 7 days)
  const isRecentCase = (dateAdded) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(dateAdded) > weekAgo;
  };

  // Get risk level color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={statistics.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="High Risk Cases"
          value={statistics.highRisk}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Recent Cases"
          value={statistics.recentCases}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Critical Conditions"
          value={statistics.criticalConditions}
          icon={Heart}
          color="yellow"
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Patient Records</h2>
          <button
            onClick={() => setShowAddPatient(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Patient</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Patients</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
              <option value="recent">Recent Cases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Patient Records ({filteredPatients.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "No patients found matching your criteria."
                  : "No patient records available."}
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
                getRiskColor={getRiskColor}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onAdd={(patientData) => {
            // Handle adding patient
            console.log("Adding patient:", patientData);
            setShowAddPatient(false);
            fetchPatients(); // Refresh list
          }}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          getRiskColor={getRiskColor}
        />
      )}
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Individual Patient Card Component
const PatientCard = ({ patient, onClick, getRiskColor }) => {
  const riskColor = getRiskColor(patient.riskLevel);

  return (
    <div
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-medium text-gray-900">
                {patient.name}
              </h4>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  riskColor === "red"
                    ? "bg-red-100 text-red-800"
                    : riskColor === "yellow"
                    ? "bg-yellow-100 text-yellow-800"
                    : riskColor === "green"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {patient.riskLevel} risk
              </span>
            </div>

            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>ID: {patient.id}</span>
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {patient.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Added: {new Date(patient.dateAdded).toLocaleDateString()}
              </span>
            </div>

            {patient.condition && (
              <p className="text-sm text-gray-700 mt-1">{patient.condition}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Patient Modal Component
const AddPatientModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    contact: "",
    condition: "",
    symptoms: "",
    riskLevel: "low",
    waterQualityExposure: {
      ph: "",
      turbidity: "",
      ecoli: "",
      exposureDate: "",
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: Date.now(), // Simple ID generation
      dateAdded: new Date().toISOString(),
      age: parseInt(formData.age) || 0,
      waterQualityExposure: {
        ...formData.waterQualityExposure,
        ph: parseFloat(formData.waterQualityExposure.ph) || 0,
        turbidity: parseFloat(formData.waterQualityExposure.turbidity) || 0,
        ecoli: parseInt(formData.waterQualityExposure.ecoli) || 0,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add New Patient Record
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Risk Level
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) =>
                  setFormData({ ...formData, riskLevel: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

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
              placeholder="Village, District"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Phone number or address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medical Condition
            </label>
            <input
              type="text"
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Primary diagnosis or concern"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Symptoms
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows="2"
              placeholder="Describe symptoms..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Quality Exposure
            </label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs text-gray-600">pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waterQualityExposure.ph}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waterQualityExposure: {
                        ...formData.waterQualityExposure,
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
                  value={formData.waterQualityExposure.turbidity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waterQualityExposure: {
                        ...formData.waterQualityExposure,
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
                  value={formData.waterQualityExposure.ecoli}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waterQualityExposure: {
                        ...formData.waterQualityExposure,
                        ecoli: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">
                  Exposure Date
                </label>
                <input
                  type="date"
                  value={formData.waterQualityExposure.exposureDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waterQualityExposure: {
                        ...formData.waterQualityExposure,
                        exposureDate: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Patient Detail Modal Component
const PatientDetailModal = ({ patient, onClose, getRiskColor }) => {
  const riskColor = getRiskColor(patient.riskLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
            <p className="text-gray-600">Patient ID: {patient.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Age:</span>
                <span className="ml-2 font-medium">{patient.age}</span>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <span className="ml-2 font-medium">{patient.gender}</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2 font-medium">{patient.location}</span>
              </div>
              <div>
                <span className="text-gray-600">Contact:</span>
                <span className="ml-2 font-medium">{patient.contact}</span>
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    riskColor === "red"
                      ? "bg-red-100 text-red-800"
                      : riskColor === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : riskColor === "green"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {patient.riskLevel}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date Added:</span>
                <span className="ml-2 font-medium">
                  {new Date(patient.dateAdded).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Medical Information
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Condition:</span>
                <span className="ml-2 font-medium">
                  {patient.condition || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Symptoms:</span>
                <p className="mt-1 text-gray-900">
                  {patient.symptoms || "No symptoms recorded"}
                </p>
              </div>
            </div>
          </div>

          {/* Water Quality Exposure */}
          {patient.waterQualityExposure && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Water Quality Exposure
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">pH Level:</span>
                  <span className="ml-2 font-medium">
                    {patient.waterQualityExposure.ph || "Not recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Turbidity:</span>
                  <span className="ml-2 font-medium">
                    {patient.waterQualityExposure.turbidity || "Not recorded"}{" "}
                    NTU
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">E.coli Count:</span>
                  <span className="ml-2 font-medium">
                    {patient.waterQualityExposure.ecoli || "Not recorded"}{" "}
                    CFU/100ml
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Exposure Date:</span>
                  <span className="ml-2 font-medium">
                    {patient.waterQualityExposure.exposureDate
                      ? new Date(
                          patient.waterQualityExposure.exposureDate
                        ).toLocaleDateString()
                      : "Not recorded"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Handle edit functionality
              console.log("Edit patient:", patient.id);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientRecordsOverview;
