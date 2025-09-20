import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/firebase.js';
import { verifyIdToken, setUserClaims } from './firebase-admin.js';

// User Registration with Role
export const registerUser = async (email, password, role, additionalData = {}) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      ...additionalData
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: role
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// User Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: userData?.role || 'community'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// User Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get User Profile
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: 'User profile not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Auth State Observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      callback({
        uid: user.uid,
        email: user.email,
        role: userData?.role || 'community'
      });
    } else {
      callback(null);
    }
  });
};