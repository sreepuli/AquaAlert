import React, { useState } from "react";
import {
  addPatientRecord,
  COMMON_SYMPTOMS,
  WATER_SOURCES,
  WATER_TREATMENTS,
} from "../../services/patientService";
import { useAuth } from "../../contexts/AuthContext";

const PatientRecordForm = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    age: "",
    gender: "",
    phoneNumber: "",

    // Location Information
    village: "",
    district: "Jorhat",
    state: "Assam",

    // Health Information
    symptoms: [],
    symptomSeverity: "",
    durationOfSymptoms: "",
    waterSource: "",
    waterTreatment: "",

    // Medical Details
    temperature: "",
    dehydrationLevel: "",
    additionalNotes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSymptomChange = (symptomValue) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomValue)
        ? prev.symptoms.filter((s) => s !== symptomValue)
        : [...prev.symptoms, symptomValue],
    }));
  };

  const validateForm = () => {
    if (!formData.patientName.trim()) return "Patient name is required";
    if (!formData.age || formData.age < 1) return "Valid age is required";
    if (!formData.gender) return "Gender is required";
    if (!formData.village.trim()) return "Village is required";
    if (formData.symptoms.length === 0)
      return "At least one symptom must be selected";
    if (!formData.symptomSeverity) return "Symptom severity is required";
    if (!formData.waterSource) return "Water source is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await addPatientRecord(
        {
          ...formData,
          age: parseInt(formData.age),
          temperature: formData.temperature
            ? parseFloat(formData.temperature)
            : 0,
        },
        user
      );

      if (result.success) {
        setSuccess("Patient record submitted successfully!");
        setFormData({
          patientName: "",
          age: "",
          gender: "",
          phoneNumber: "",
          village: "",
          district: "Jorhat",
          state: "Assam",
          symptoms: [],
          symptomSeverity: "",
          durationOfSymptoms: "",
          waterSource: "",
          waterTreatment: "",
          temperature: "",
          dehydrationLevel: "",
          additionalNotes: "",
        });

        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(result);
        }
      } else {
        setError(result.error || "Failed to submit patient record");
      }
    } catch (err) {
      setError("An error occurred while submitting the record");
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Patient Record
        </h2>
        <p className="text-gray-600">
          Record patient details and symptoms for waterborne disease monitoring
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Information Section */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div className="bg-green-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Location Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village *
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Health Information Section */}
        <div className="bg-yellow-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Health Information
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms * (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMMON_SYMPTOMS.map((symptom) => (
                <label
                  key={symptom.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom.value)}
                    onChange={() => handleSymptomChange(symptom.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{symptom.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptom Severity *
              </label>
              <select
                name="symptomSeverity"
                value={formData.symptomSeverity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Severity</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration of Symptoms
              </label>
              <select
                name="durationOfSymptoms"
                value={formData.durationOfSymptoms}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Duration</option>
                <option value="less_than_1_day">Less than 1 day</option>
                <option value="1_2_days">1-2 days</option>
                <option value="3_5_days">3-5 days</option>
                <option value="more_than_5_days">More than 5 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Source *
              </label>
              <select
                name="waterSource"
                value={formData.waterSource}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Water Source</option>
                {WATER_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Treatment
              </label>
              <select
                name="waterTreatment"
                value={formData.waterTreatment}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Treatment</option>
                {WATER_TREATMENTS.map((treatment) => (
                  <option key={treatment.value} value={treatment.value}>
                    {treatment.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medical Details Section */}
        <div className="bg-purple-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Medical Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (°F)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                step="0.1"
                min="95"
                max="110"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dehydration Level
              </label>
              <select
                name="dehydrationLevel"
                value={formData.dehydrationLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Level</option>
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional observations or notes..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {loading ? "Submitting..." : "Submit Patient Record"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRecordForm;
