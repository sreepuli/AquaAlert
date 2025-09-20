import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

// Patient Record Data Model
const PATIENT_RECORD_SCHEMA = {
  // Patient Information
  patientName: "",
  age: 0,
  gender: "",
  phoneNumber: "",
  
  // Location Information
  village: "",
  district: "",
  state: "",
  coordinates: { lat: 0, lng: 0 },
  
  // Health Information
  symptoms: [],
  symptomSeverity: "", // mild, moderate, severe
  durationOfSymptoms: "", // days
  waterSource: "", // tube well, river, pond, municipal
  waterTreatment: "", // boiled, filtered, none
  
  // Medical Details
  temperature: 0,
  dehydrationLevel: "", // none, mild, moderate, severe
  additionalNotes: "",
  
  // ASHA Worker Information
  ashaWorkerId: "",
  ashaWorkerName: "",
  ashaWorkerPhone: "",
  
  // Administrative
  status: "pending", // pending, reviewed, treated, closed
  priority: "normal", // low, normal, high, critical
  createdAt: null,
  updatedAt: null,
  reviewedBy: "",
  reviewNotes: ""
};

// Collection name
const PATIENT_RECORDS_COLLECTION = "patientRecords";

// Add new patient record
export const addPatientRecord = async (patientData, ashaWorkerInfo) => {
  try {
    const recordData = {
      ...patientData,
      ashaWorkerId: ashaWorkerInfo.uid,
      ashaWorkerName: ashaWorkerInfo.email,
      ashaWorkerPhone: ashaWorkerInfo.phoneNumber || "",
      status: "pending",
      priority: determinePriority(patientData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, PATIENT_RECORDS_COLLECTION), recordData);
    console.log("Patient record added with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding patient record: ", error);
    return { success: false, error: error.message };
  }
};

// Get patient records for specific ASHA worker
export const getAshaPatientRecords = (ashaWorkerId, callback) => {
  const q = query(
    collection(db, PATIENT_RECORDS_COLLECTION),
    where("ashaWorkerId", "==", ashaWorkerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    callback(records);
  });
};

// Get all patient records for government portal
export const getAllPatientRecords = (callback) => {
  const q = query(
    collection(db, PATIENT_RECORDS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    callback(records);
  });
};

// Get patient records by status
export const getPatientRecordsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, PATIENT_RECORDS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
  } catch (error) {
    console.error("Error fetching patient records by status: ", error);
    return [];
  }
};

// Get patient records by village
export const getPatientRecordsByVillage = (village, callback) => {
  const q = query(
    collection(db, PATIENT_RECORDS_COLLECTION),
    where("village", "==", village),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    callback(records);
  });
};

// Determine priority based on symptoms and severity
const determinePriority = (patientData) => {
  const { symptoms, symptomSeverity, dehydrationLevel, temperature } = patientData;
  
  // Critical conditions
  if (
    symptomSeverity === "severe" ||
    dehydrationLevel === "severe" ||
    temperature > 103 ||
    symptoms.includes("blood_in_stool") ||
    symptoms.includes("severe_dehydration")
  ) {
    return "critical";
  }
  
  // High priority conditions
  if (
    symptomSeverity === "moderate" ||
    dehydrationLevel === "moderate" ||
    temperature > 101 ||
    symptoms.includes("persistent_vomiting") ||
    symptoms.includes("severe_diarrhea")
  ) {
    return "high";
  }
  
  // Mild symptoms get normal priority
  return "normal";
};

// Common symptoms list for dropdown
export const COMMON_SYMPTOMS = [
  { value: "diarrhea", label: "Diarrhea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "fever", label: "Fever" },
  { value: "stomach_pain", label: "Stomach Pain" },
  { value: "dehydration", label: "Dehydration" },
  { value: "nausea", label: "Nausea" },
  { value: "headache", label: "Headache" },
  { value: "fatigue", label: "Fatigue" },
  { value: "blood_in_stool", label: "Blood in Stool" },
  { value: "persistent_vomiting", label: "Persistent Vomiting" },
  { value: "severe_diarrhea", label: "Severe Diarrhea" },
  { value: "severe_dehydration", label: "Severe Dehydration" }
];

// Water sources list
export const WATER_SOURCES = [
  { value: "tube_well", label: "Tube Well" },
  { value: "river", label: "River" },
  { value: "pond", label: "Pond" },
  { value: "municipal", label: "Municipal Supply" },
  { value: "well", label: "Open Well" },
  { value: "spring", label: "Natural Spring" },
  { value: "other", label: "Other" }
];

// Water treatment methods
export const WATER_TREATMENTS = [
  { value: "none", label: "No Treatment" },
  { value: "boiled", label: "Boiled" },
  { value: "filtered", label: "Filtered" },
  { value: "chlorinated", label: "Chlorinated" },
  { value: "purification_tablets", label: "Purification Tablets" },
  { value: "other", label: "Other" }
];