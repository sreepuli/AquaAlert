import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const AdminVerification = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fetch real pending verifications from Firebase
  useEffect(() => {
    fetchPendingVerifications();
    setupRealTimeListener();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const pendingQuery = query(
        collection(db, "users"),
        where("verificationStatus", "==", "pending"),
        where("role", "==", "official"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(pendingQuery);
      const verifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      }));

      setPendingVerifications(verifications);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeListener = () => {
    const pendingQuery = query(
      collection(db, "users"),
      where("verificationStatus", "==", "pending"),
      where("role", "==", "official"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      const verifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt:
          doc.data().createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      }));
      setPendingVerifications(verifications);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleVerification = async (applicationId, action, notes = "") => {
    try {
      // API call to approve/reject verification
      console.log(`${action} application ${applicationId}`, { notes });

      // Update local state
      setPendingVerifications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: action,
                adminNotes: notes,
                reviewedAt: new Date().toISOString(),
              }
            : app
        )
      );

      setSelectedApplication(null);

      // Show success message
      alert(
        `Application ${
          action === "approved" ? "approved" : "rejected"
        } successfully!`
      );
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to process verification. Please try again.");
    }
  };

  const getDepartmentName = (dept) => {
    const departments = {
      health: "Ministry of Health & Family Welfare",
      water: "Ministry of Water Resources",
      environment: "Ministry of Environment",
      rural: "Ministry of Rural Development",
      urban: "Ministry of Housing & Urban Affairs",
      state_health: "State Health Department",
      district: "District Administration",
      municipal: "Municipal Corporation",
      other: "Other Government Department",
    };
    return departments[dept] || dept;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-2">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Government Official Verification
              </h2>
              <p className="text-blue-100 text-sm">
                Review and approve pending applications
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white font-semibold">
                {
                  pendingVerifications.filter((app) => app.status === "pending")
                    .length
                }{" "}
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="p-6">
          {pendingVerifications.filter((app) => app.status === "pending")
            .length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Pending Verifications
              </h3>
              <p className="text-gray-500">
                All government official applications have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerifications
                .filter((app) => app.status === "pending")
                .map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
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
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {application.email}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Submitted {formatDate(application.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Official ID
                            </p>
                            <p className="text-sm text-gray-900">
                              {application.officialId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Department
                            </p>
                            <p className="text-sm text-gray-900">
                              {getDepartmentName(application.department)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Designation
                            </p>
                            <p className="text-sm text-gray-900">
                              {application.designation}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Verification Document
                            </p>
                            <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                              📄 {application.verificationDocument}
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Office Address
                          </p>
                          <p className="text-sm text-gray-900">
                            {application.officeAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Review Application
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
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

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Application Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Official ID:
                      </span>
                      <p>{selectedApplication.officialId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Department:
                      </span>
                      <p>{getDepartmentName(selectedApplication.department)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Designation:
                      </span>
                      <p>{selectedApplication.designation}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">
                      Office Address:
                    </span>
                    <p className="text-sm">
                      {selectedApplication.officeAddress}
                    </p>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Verification Checklist
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Official ID format and number verified
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Department and designation match records
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Office address is authentic
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Verification document is valid
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Cross-verified with department records
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    handleVerification(selectedApplication.id, "approved")
                  }
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✓ Approve Application
                </button>
                <button
                  onClick={() => {
                    const notes = prompt(
                      "Please provide reason for rejection:"
                    );
                    if (notes) {
                      handleVerification(
                        selectedApplication.id,
                        "rejected",
                        notes
                      );
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  ✗ Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
