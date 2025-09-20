import React, { createContext, useContext, useState, useEffect } from "react";

// Translation data
const translations = {
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    signOut: "Sign Out",
    logout: "Logout",

    // User roles
    ashaWorker: "ASHA WORKER",
    governmentOfficial: "GOVERNMENT OFFICIAL",

    // Dashboard titles
    ashaDashboard: "ASHA Worker Dashboard",
    officialDashboard: "Government Official Dashboard",

    // Tab names
    overview: "Overview",
    submitReport: "Submit Report",
    reports: "My Reports",
    alerts: "Alerts",
    patientRecords: "Patient Records",
    riskMap: "Risk Map",
    analytics: "Analytics",

    // Form labels
    waterQualityReport: "Water Quality Report",
    patientRecord: "Patient Record",
    village: "Village",
    district: "District",
    state: "State",
    patientName: "Patient Name",
    age: "Age",
    gender: "Gender",
    phoneNumber: "Phone Number",
    symptoms: "Symptoms",
    severity: "Severity",
    temperature: "Temperature",
    priority: "Priority",
    status: "Status",
    date: "Date",
    time: "Time",

    // Status options
    pending: "Pending",
    reviewed: "Reviewed",
    approved: "Approved",
    actionTaken: "Action Taken",
    underReview: "Under Review",

    // Priority levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    urgent: "URGENT",
    normal: "NORMAL",

    // Water quality parameters
    phLevel: "pH Level",
    turbidity: "Turbidity",
    ecoli: "E. Coli",
    riskLevel: "Risk Level",

    // Actions
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    review: "Review",
    details: "Details",
    download: "Download",
    export: "Export",
    refresh: "Refresh",

    // Messages
    loading: "Loading...",
    noData: "No data available",
    success: "Success",
    error: "Error",
    warning: "Warning",

    // Dashboard sections
    dashboardOverview: "Dashboard Overview",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    totalReports: "Total Reports",
    villagesMonitored: "Villages Monitored",
    todaysRecords: "Today's Records",

    // Patient management
    patientDetails: "Patient Details",
    location: "Location",
    symptomsAndSeverity: "Symptoms & Severity",
    dateSubmitted: "Date Submitted",
    totalPatients: "Total Patients",
    criticalCases: "Critical Cases",
    pendingReview: "Pending Review",

    // Alert messages
    patientRecordSubmitted: "Patient record submitted successfully!",
    waterQualitySubmitted: "Water quality report submitted successfully!",
    failedToSubmit: "Failed to submit. Please try again.",

    // Common phrases
    submittedBy: "Submitted By",
    submittedOn: "Submitted On",
    lastUpdated: "Last Updated",
    viewAll: "View All",
    showMore: "Show More",
    showLess: "Show Less",
    currentLanguage: "Current Language",

    // Sensor Dashboard
    sensorDashboard: "Sensor Dashboard",
    realTimeWaterQualityMonitoring: "Real-time Water Quality Monitoring",
    totalSensors: "Total Sensors",
    onlineSensors: "Online Sensors",
    activeAlerts: "Active Alerts",
    criticalAlerts: "Critical Alerts",
    recentAlerts: "Recent Alerts",
    sensorStatus: "Sensor Status",
    allSensors: "All Sensors",
    allAlerts: "All Alerts",
    noActiveAlerts: "No active alerts - all systems normal",
    noAlertsFound: "No Alerts Found",
    allSensorsOperatingNormally: "All sensors are operating normally",
    level: "Level",
    flowRate: "Flow Rate",
    noDataAvailable: "No data available",
    loadingSensorData: "Loading sensor data",
    sensors: "Sensors",
  },

  hi: {
    // Navigation
    home: "होम",
    dashboard: "डैशबोर्ड",
    signOut: "साइन आउट",
    logout: "लॉगआउट",

    // User roles
    ashaWorker: "आशा कार्यकर्ता",
    governmentOfficial: "सरकारी अधिकारी",

    // Dashboard titles
    ashaDashboard: "आशा कार्यकर्ता डैशबोर्ड",
    officialDashboard: "सरकारी अधिकारी डैशबोर्ड",

    // Tab names
    overview: "सिंहावलोकन",
    submitReport: "रिपोर्ट जमा करें",
    reports: "मेरी रिपोर्ट",
    alerts: "अलर्ट",
    patientRecords: "रोगी रिकॉर्ड",
    riskMap: "जोखिम मानचित्र",
    analytics: "विश्लेषण",

    // Form labels
    waterQualityReport: "पानी की गुणवत्ता रिपोर्ट",
    patientRecord: "रोगी रिकॉर्ड",
    village: "गांव",
    district: "जिला",
    state: "राज्य",
    patientName: "रोगी का नाम",
    age: "उम्र",
    gender: "लिंग",
    phoneNumber: "फोन नंबर",
    symptoms: "लक्षण",
    severity: "गंभीरता",
    temperature: "तापमान",
    priority: "प्राथमिकता",
    status: "स्थिति",
    date: "दिनांक",
    time: "समय",

    // Status options
    pending: "लंबित",
    reviewed: "समीक्षित",
    approved: "अनुमोदित",
    actionTaken: "कार्रवाई की गई",
    underReview: "समीक्षाधीन",

    // Priority levels
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
    urgent: "तत्काल",
    normal: "सामान्य",

    // Water quality parameters
    phLevel: "पीएच स्तर",
    turbidity: "मैलापन",
    ecoli: "ई. कोली",
    riskLevel: "जोखिम स्तर",

    // Actions
    cancel: "रद्द करें",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "हटाएं",
    view: "देखें",
    review: "समीक्षा करें",
    details: "विवरण",
    download: "डाउनलोड",
    export: "निर्यात",
    refresh: "ताज़ा करें",

    // Messages
    loading: "लोड हो रहा है...",
    noData: "कोई डेटा उपलब्ध नहीं",
    success: "सफलता",
    error: "त्रुटि",
    warning: "चेतावनी",

    // Dashboard sections
    dashboardOverview: "डैशबोर्ड सिंहावलोकन",
    recentActivity: "हालिया गतिविधि",
    quickActions: "त्वरित कार्य",
    totalReports: "कुल रिपोर्ट",
    villagesMonitored: "निगरानी किए गए गांव",
    todaysRecords: "आज के रिकॉर्ड",

    // Patient management
    patientDetails: "रोगी विवरण",
    location: "स्थान",
    symptomsAndSeverity: "लक्षण और गंभीरता",
    dateSubmitted: "जमा करने की तारीख",
    totalPatients: "कुल रोगी",
    criticalCases: "गंभीर मामले",
    pendingReview: "समीक्षा लंबित",

    // Alert messages
    patientRecordSubmitted: "रोगी रिकॉर्ड सफलतापूर्वक जमा किया गया!",
    waterQualitySubmitted: "पानी की गुणवत्ता रिपोर्ट सफलतापूर्वक जमा की गई!",
    failedToSubmit: "जमा करने में विफल। कृपया पुनः प्रयास करें।",

    // Common phrases
    submittedBy: "द्वारा जमा",
    submittedOn: "जमा किया गया",
    lastUpdated: "अंतिम अपडेट",
    viewAll: "सभी देखें",
    showMore: "और दिखाएं",
    showLess: "कम दिखाएं",
    currentLanguage: "वर्तमान भाषा",

    // Sensor Dashboard
    sensorDashboard: "सेंसर डैशबोर्ड",
    realTimeWaterQualityMonitoring: "वास्तविक समय पानी गुणवत्ता निगरानी",
    totalSensors: "कुल सेंसर",
    onlineSensors: "ऑनलाइन सेंसर",
    activeAlerts: "सक्रिय अलर्ट",
    criticalAlerts: "गंभीर अलर्ट",
    recentAlerts: "हाल की अलर्ट",
    sensorStatus: "सेंसर स्थिति",
    allSensors: "सभी सेंसर",
    allAlerts: "सभी अलर्ट",
    noActiveAlerts: "कोई सक्रिय अलर्ट नहीं - सभी सिस्टम सामान्य",
    noAlertsFound: "कोई अलर्ट नहीं मिली",
    allSensorsOperatingNormally: "सभी सेंसर सामान्य रूप से काम कर रहे हैं",
    level: "स्तर",
    flowRate: "प्रवाह दर",
    noDataAvailable: "कोई डेटा उपलब्ध नहीं",
    loadingSensorData: "सेंसर डेटा लोड हो रहा है",
    sensors: "सेंसर",
  },

  as: {
    // Navigation (Assamese)
    home: "ঘৰ",
    dashboard: "ডেচবোৰ্ড",
    signOut: "ছাইন আউট",
    logout: "লগআউট",

    // User roles
    ashaWorker: "আশা কৰ্মী",
    governmentOfficial: "চৰকাৰী বিষয়া",

    // Dashboard titles
    ashaDashboard: "আশা কৰ্মী ডেচবোৰ্ড",
    officialDashboard: "চৰকাৰী বিষয়া ডেচবোৰ্ড",

    // Tab names
    overview: "সাৰাংশ",
    submitReport: "প্ৰতিবেদন দাখিল কৰক",
    reports: "মোৰ প্ৰতিবেদন",
    alerts: "সতৰ্কবাণী",
    patientRecords: "ৰোগীৰ নথি",
    riskMap: "বিপদৰ মানচিত্ৰ",
    analytics: "বিশ্লেষণ",

    // Form labels
    waterQualityReport: "পানীৰ গুণগত প্ৰতিবেদন",
    patientRecord: "ৰোগীৰ নথি",
    village: "গাঁও",
    district: "জিলা",
    state: "ৰাজ্য",
    patientName: "ৰোগীৰ নাম",
    age: "বয়স",
    gender: "লিংগ",
    phoneNumber: "ফোন নম্বৰ",
    symptoms: "লক্ষণ",
    severity: "গুৰুত্ব",
    temperature: "উষ্ণতা",
    priority: "অগ্ৰাধিকাৰ",
    status: "অৱস্থা",
    date: "তাৰিখ",
    time: "সময়",

    // Status options
    pending: "বিচাৰাধীন",
    reviewed: "পৰীক্ষা কৰা হৈছে",
    approved: "অনুমোদিত",
    actionTaken: "ব্যৱস্থা লোৱা হৈছে",
    underReview: "পৰীক্ষাধীন",

    // Priority levels
    low: "কম",
    medium: "মধ্যম",
    high: "উচ্চ",
    critical: "গুৰুতৰ",
    urgent: "জৰুৰী",
    normal: "স্বাভাৱিক",

    // Water quality parameters
    phLevel: "পিএইচ স্তৰ",
    turbidity: "ঘোলা",
    ecoli: "ই. কলি",
    riskLevel: "বিপদৰ স্তৰ",

    // Actions
    cancel: "বাতিল কৰক",
    save: "সংৰক্ষণ কৰক",
    edit: "সম্পাদনা কৰক",
    delete: "মচি পেলাওক",
    view: "চাওক",
    review: "পৰীক্ষা কৰক",
    details: "বিৱৰণ",
    download: "ডাউনলোড",
    export: "ৰপ্তানি",
    refresh: "পুনৰ লোড কৰক",

    // Messages
    loading: "লোড হৈ আছে...",
    noData: "কোনো তথ্য উপলব্ধ নহয়",
    success: "সফল",
    error: "ত্ৰুটি",
    warning: "সতৰ্কবাণী",

    // Dashboard sections
    dashboardOverview: "ডেচবোৰ্ড সাৰাংশ",
    recentActivity: "শেহতীয়া কাৰ্যকলাপ",
    quickActions: "দ্ৰুত কাৰ্য",
    totalReports: "মুঠ প্ৰতিবেদন",
    villagesMonitored: "নিৰীক্ষণ কৰা গাঁও",
    todaysRecords: "আজিৰ নথি",

    // Patient management
    patientDetails: "ৰোগীৰ বিৱৰণ",
    location: "স্থান",
    symptomsAndSeverity: "লক্ষণ আৰু গুৰুত্ব",
    dateSubmitted: "দাখিল কৰাৰ তাৰিখ",
    totalPatients: "মুঠ ৰোগী",
    criticalCases: "গুৰুতৰ ক্ষেত্ৰ",
    pendingReview: "পৰীক্ষা বিচাৰাধীন",

    // Alert messages
    patientRecordSubmitted: "ৰোগীৰ নথি সফলভাৱে দাখিল কৰা হ'ল!",
    waterQualitySubmitted: "পানীৰ গুণগত প্ৰতিবেদন সফলভাৱে দাখিল কৰা হ'ল!",
    failedToSubmit: "দাখিল কৰিবলৈ ব্যৰ্থ। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",

    // Common phrases
    submittedBy: "দ্বাৰা দাখিল",
    submittedOn: "দাখিল কৰা হৈছে",
    lastUpdated: "শেষ আপডেট",
    viewAll: "সকলো চাওক",
    showMore: "অধিক দেখুৱাওক",
    showLess: "কম দেখুৱাওক",
    currentLanguage: "বৰ্তমান ভাষা",

    // Sensor Dashboard
    sensorDashboard: "চেন্সৰ ডেচবোৰ্ড",
    realTimeWaterQualityMonitoring: "প্ৰকৃত সময়ৰ পানীৰ গুণগত নিৰীক্ষণ",
    totalSensors: "মুঠ চেন্সৰ",
    onlineSensors: "অনলাইন চেন্সৰ",
    activeAlerts: "সক্ৰিয় সতৰ্কবাণী",
    criticalAlerts: "গুৰুতৰ সতৰ্কবাণী",
    recentAlerts: "শেহতীয়া সতৰ্কবাণী",
    sensorStatus: "চেন্সৰৰ অৱস্থা",
    allSensors: "সকলো চেন্সৰ",
    allAlerts: "সকলো সতৰ্কবাণী",
    noActiveAlerts: "কোনো সক্ৰিয় সতৰ্কবাণী নাই - সকলো ব্যৱস্থা স্বাভাৱিক",
    noAlertsFound: "কোনো সতৰ্কবাণী পোৱা নগ'ল",
    allSensorsOperatingNormally: "সকলো চেন্সৰ স্বাভাৱিকভাৱে কাম কৰি আছে",
    level: "স্তৰ",
    flowRate: "প্ৰবাহৰ হাৰ",
    noDataAvailable: "কোনো তথ্য উপলব্ধ নহয়",
    loadingSensorData: "চেন্সৰৰ তথ্য লোড হৈ আছে",
    sensors: "চেন্সৰ",
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("aquaalert-language");
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("aquaalert-language", currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "Hindi", nativeName: "हिंदी" },
      { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
