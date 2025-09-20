// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbHBLWoBCtc69DqRIXiMCKXn9snsUmx8c",
  authDomain: "project-md-2acd4.firebaseapp.com",
  projectId: "project-md-2acd4",
  storageBucket: "project-md-2acd4.firebasestorage.app",
  messagingSenderId: "903888212506",
  appId: "1:903888212506:web:3a4357c61ec0c92e0eb7a3",
  measurementId: "G-9L43E4QLHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
