import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("community");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Government official specific fields
  const [officialId, setOfficialId] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [verificationDocument, setVerificationDocument] = useState(null);

  // ASHA worker specific fields
  const [village, setVillage] = useState("");
  const [primaryHealthCenter, setPrimaryHealthCenter] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [district, setDistrict] = useState("Majuli");

  // Community member specific fields
  const [familySize, setFamilySize] = useState("");
  const [primaryConcerns, setPrimaryConcerns] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation for different user types
    if (!isLogin) {
      if (role === "official") {
        if (
          !officialId ||
          !department ||
          !designation ||
          !officeAddress ||
          !verificationDocument
        ) {
          setError(
            "Please fill all fields and upload verification document for government officials"
          );
          setLoading(false);
          return;
        }
      } else if (role === "asha") {
        if (!village || !primaryHealthCenter || !contactNumber) {
          setError(
            "Please fill all required fields for ASHA worker registration"
          );
          setLoading(false);
          return;
        }
      } else if (role === "community") {
        if (!village || !contactNumber) {
          setError(
            "Please fill all required fields for community member registration"
          );
          setLoading(false);
          return;
        }
      }
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;

          if (userRole === "asha") {
            navigate("/asha-dashboard");
          } else if (userRole === "community") {
            navigate("/community-dashboard");
          } else if (userRole === "official") {
            navigate("/official-dashboard");
          } else if (userRole === "government") {
            navigate("/official-dashboard"); // government officials use official dashboard
          } else if (userRole === "admin") {
            navigate("/admin-dashboard"); // admin users go to admin dashboard
          } else {
            navigate("/dashboard");
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userData = {
          uid: user.uid,
          email: user.email,
          name: name,
          role: role, // 'community', 'asha', or 'official'
          userType: role, // Store user type for easy filtering
          createdAt: new Date(),
          emailVerified: user.emailVerified,
          isActive: true,
          lastLogin: new Date(),
        };

        // Add role-specific fields
        if (role === "official") {
          userData.officialId = officialId;
          userData.department = department;
          userData.designation = designation;
          userData.officeAddress = officeAddress;
          userData.verificationStatus = "pending";
          userData.verificationDocument = verificationDocument?.name || null;
          userData.position = designation; // For government alert system
          userData.alertTypes = ["water_quality", "critical_alerts"]; // Default alert types
          userData.district = officeAddress?.includes("Jorhat")
            ? "Jorhat"
            : "Majuli"; // Extract district
        } else if (role === "asha") {
          userData.ashaId =
            name.replace(/\s+/g, "_").toLowerCase() + "_" + Date.now();
          userData.village = village;
          userData.district = district;
          userData.primaryHealthCenter = primaryHealthCenter;
          userData.contactNumber = contactNumber;
          userData.supervisorName = supervisorName;
          userData.alertTypes = ["health_outbreak", "community_alerts"];
          userData.position = "ASHA Worker";
          userData.verificationStatus = "pending"; // ASHA workers need verification
        } else if (role === "community") {
          userData.communityId =
            name.replace(/\s+/g, "_").toLowerCase() + "_" + Date.now();
          userData.village = village;
          userData.district = district;
          userData.familySize = parseInt(familySize) || 1;
          userData.primaryConcerns = primaryConcerns;
          userData.contactNumber = contactNumber;
          userData.alertTypes = ["water_quality", "health_outbreak"];
          userData.position = "Community Member";
          userData.verificationStatus = "active"; // Community members are auto-approved
        }

        await setDoc(doc(db, "users", user.uid), userData);

        if (role === "asha") {
          navigate("/asha-dashboard");
        } else if (role === "community") {
          navigate("/community-dashboard");
        } else if (role === "official") {
          navigate("/official-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid document (JPG, PNG, or PDF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setVerificationDocument(file);
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AquaAlert System
            </h1>
            <p className="text-white/70 text-lg">
              {isLogin ? "Welcome back!" : "Join the water safety network"}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-white text-blue-900 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-white text-blue-900 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Register as <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("community")}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      role === "community"
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold">Community Member</h3>
                      <p className="text-sm opacity-80">Report water issues</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("asha")}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      role === "asha"
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold">ASHA Worker</h3>
                      <p className="text-sm opacity-80">Health monitoring</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("official")}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      role === "official"
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold">Government Official</h3>
                      <p className="text-sm opacity-80">Policy & oversight</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && role === "official" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Department/Ministry{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 appearance-none"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      <option value="" className="bg-gray-800">
                        Select Department
                      </option>
                      <option value="health" className="bg-gray-800">
                        Ministry of Health & Family Welfare
                      </option>
                      <option value="water" className="bg-gray-800">
                        Ministry of Jal Shakti
                      </option>
                      <option value="environment" className="bg-gray-800">
                        Ministry of Environment
                      </option>
                      <option value="rural" className="bg-gray-800">
                        Ministry of Rural Development
                      </option>
                      <option value="urban" className="bg-gray-800">
                        Ministry of Housing & Urban Affairs
                      </option>
                      <option value="state" className="bg-gray-800">
                        State Government
                      </option>
                      <option value="local" className="bg-gray-800">
                        Local Administration
                      </option>
                      <option value="other" className="bg-gray-800">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Designation <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="e.g., District Collector, Health Officer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Official ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Employee ID / Service Number"
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Office Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none"
                      placeholder="Complete office address with district and state"
                      rows="3"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Verification Document{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="verification-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {verificationDocument ? (
                          <div className="text-center">
                            <p className="text-sm text-green-400 font-medium">
                              {verificationDocument.name}
                            </p>
                            <p className="text-xs text-white/60">
                              Click to change file
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="mb-2 text-sm text-white/70">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              verification document
                            </p>
                            <p className="text-xs text-white/60">
                              ID Card, Service Certificate, or Official Letter
                              (JPG, PNG, PDF up to 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        id="verification-upload"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        required
                      />
                    </label>
                  </div>
                  <p className="text-xs text-white/60">
                    Upload your official ID card, service certificate, or an
                    official letter from your department to verify your
                    identity.
                  </p>
                </div>
              </>
            )}

            {!isLogin && role === "asha" && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-6">
                  <h3 className="text-cyan-300 font-semibold mb-2">
                    🏥 ASHA Worker Information
                  </h3>
                  <p className="text-white/70 text-sm">
                    Please provide your health center details and contact
                    information for verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Village/Area <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Your assigned village or area"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      District <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 appearance-none"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                    >
                      <option value="Majuli" className="bg-gray-800">
                        Majuli
                      </option>
                      <option value="Jorhat" className="bg-gray-800">
                        Jorhat
                      </option>
                      <option value="Sivasagar" className="bg-gray-800">
                        Sivasagar
                      </option>
                      <option value="Dibrugarh" className="bg-gray-800">
                        Dibrugarh
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Primary Health Center{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Name of your PHC"
                      value={primaryHealthCenter}
                      onChange={(e) => setPrimaryHealthCenter(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="+91-XXXXXXXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white/90">
                      Supervisor Name (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Name of your supervisor or ANM"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {!isLogin && role === "community" && (
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <h3 className="text-green-300 font-semibold mb-2">
                    👥 Community Member Information
                  </h3>
                  <p className="text-white/70 text-sm">
                    Help us understand your community better by providing basic
                    information.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Village/Area <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Your village or locality"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      District <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 appearance-none"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                    >
                      <option value="Majuli" className="bg-gray-800">
                        Majuli
                      </option>
                      <option value="Jorhat" className="bg-gray-800">
                        Jorhat
                      </option>
                      <option value="Sivasagar" className="bg-gray-800">
                        Sivasagar
                      </option>
                      <option value="Dibrugarh" className="bg-gray-800">
                        Dibrugarh
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="+91-XXXXXXXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/90">
                      Family Size (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      placeholder="Number of family members"
                      value={familySize}
                      onChange={(e) => setFamilySize(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">
                    Primary Health Concerns (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Water Quality",
                      "Sanitation",
                      "Maternal Health",
                      "Child Health",
                      "Nutrition",
                      "Disease Prevention",
                    ].map((concern) => (
                      <label
                        key={concern}
                        className="flex items-center space-x-2 text-white/80 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0"
                          checked={primaryConcerns.includes(concern)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrimaryConcerns([...primaryConcerns, concern]);
                            } else {
                              setPrimaryConcerns(
                                primaryConcerns.filter((c) => c !== concern)
                              );
                            }
                          }}
                        />
                        <span>{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {isLogin ? "Sign In" : "Create Account"}
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
