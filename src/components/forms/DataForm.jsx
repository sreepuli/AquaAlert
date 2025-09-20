import React, { useState } from "react";

const initialState = {
  // Location Information
  village: "",

  // Case Information
  diseaseCategory: "",
  affectedCount: "",

  // Basic Notes
  notes: "",
};

const DataForm = ({ onSubmit }) => {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Add timestamp and IoT sensor note
    const submissionData = {
      ...form,
      submissionDate: new Date().toISOString(),
      submittedBy: "ASHA Worker",
      iotSensorNote:
        "Water quality parameters will be automatically fetched from IoT sensors",
    };

    // Simulate submission delay
    setTimeout(() => {
      onSubmit(submissionData);
      setForm(initialState);
      setIsSubmitting(false);
    }, 1000);
  };

  const InputField = ({
    name,
    placeholder,
    type = "text",
    options,
    icon,
    required = true,
  }) => (
    <div className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {placeholder}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
          </div>
        )}
        {type === "select" ? (
          <select
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full ${
              icon ? "pl-12" : "pl-4"
            } pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 
              focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none
              transition-all duration-200 hover:border-gray-300 font-medium text-sm`}
            required={required}
          >
            <option value="">Select {placeholder.toLowerCase()}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={`Enter ${placeholder.toLowerCase()}`}
            rows={3}
            className={`w-full ${
              icon ? "pl-12" : "pl-4"
            } pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
              focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none
              transition-all duration-200 hover:border-gray-300 font-medium text-sm resize-none`}
            required={required}
          />
        ) : (
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={`Enter ${placeholder.toLowerCase()}`}
            type={type}
            className={`w-full ${
              icon ? "pl-12" : "pl-4"
            } pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
              focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none
              transition-all duration-200 hover:border-gray-300 font-medium text-sm`}
            required={required}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full px-1">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
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
            <div>
              <h2 className="text-xl font-bold text-white">
                Health Case Report
              </h2>
              <p className="text-emerald-100 text-sm">
                Quick report for waterborne disease cases in your area
              </p>
            </div>
          </div>
        </div>

        {/* IoT Sensors Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mt-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">
                💡 Water quality parameters (pH, turbidity, E. Coli, etc.) are
                automatically collected from IoT sensors
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Location Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
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
              Location
            </h3>
            <InputField
              name="village"
              placeholder="Village/Area Name"
              icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </div>

          {/* Case Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
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
              Health Issue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="diseaseCategory"
                placeholder="Type of Health Issue"
                type="select"
                options={[
                  { value: "diarrheal", label: "Diarrhea/Stomach Issues" },
                  { value: "fever", label: "Fever/Body Aches" },
                  { value: "skin", label: "Skin Problems" },
                  { value: "other", label: "Other Water-related Issue" },
                ]}
                icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
              <InputField
                name="affectedCount"
                placeholder="How Many People Affected"
                type="select"
                options={[
                  { value: "1", label: "1 person" },
                  { value: "2-5", label: "2-5 people" },
                  { value: "6-10", label: "6-10 people" },
                  { value: "many", label: "Many people (10+)" },
                ]}
                icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              Additional Information
            </h3>
            <InputField
              name="notes"
              placeholder="Any other details you want to share (optional)"
              type="textarea"
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              required={false}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl 
                transform transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200
                ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-105"
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Submitting Health Case Report...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>Submit Health Case Report</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataForm;
