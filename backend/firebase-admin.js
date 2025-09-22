import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin SDK
let adminApp;

export const initializeFirebaseAdmin = () => {
  if (adminApp) {
    return adminApp; // Already initialized
  }

  // Skip initialization if in demo mode
  if (process.env.DEMO_MODE === 'true') {
    console.log('📝 Demo mode enabled - Firebase Admin SDK disabled');
    return null;
  }

  try {
    // Method 1: Using service account key file (for development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const serviceAccountPath = join(process.cwd(), 'service-account-key.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        
        console.log('✅ Firebase Admin initialized with service account key');
        return adminApp;
      } catch (error) {
        console.log('⚠️ Service account key not found, trying environment variables...');
      }
    }

    // Method 2: Using environment variables (for production)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized with environment variables');
      return adminApp;
    }

    // If no credentials available, return null instead of trying default
    console.log('⚠️ No Firebase credentials found - running in demo mode');
    return null;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    
    // For development without Firebase Admin
    console.log('⚠️ Running without Firebase Admin SDK');
    console.log('💡 To enable full functionality:');
    console.log('   1. Download service account key from Firebase Console');
    console.log('   2. Save as "service-account-key.json" in backend folder');
    console.log('   3. Or set up environment variables');
    
    return null;
  }
};

// Get Firebase Admin instance
export const getFirebaseAdmin = () => {
  if (!adminApp) {
    return initializeFirebaseAdmin();
  }
  return adminApp;
};

// Helper functions for common operations
export const adminAuth = () => {
  const app = getFirebaseAdmin();
  return app ? admin.auth() : null;
};

export const adminFirestore = () => {
  const app = getFirebaseAdmin();
  return app ? admin.firestore() : null;
};

// Verify ID token (for API authentication)
export const verifyIdToken = async (idToken) => {
  try {
    const auth = adminAuth();
    if (!auth) {
      throw new Error('Firebase Admin not initialized');
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    return { success: true, user: decodedToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user by UID
export const getUserByUid = async (uid) => {
  try {
    const auth = adminAuth();
    if (!auth) {
      throw new Error('Firebase Admin not initialized');
    }
    
    const userRecord = await auth.getUser(uid);
    return { success: true, user: userRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create custom token
export const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const auth = adminAuth();
    if (!auth) {
      throw new Error('Firebase Admin not initialized');
    }
    
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return { success: true, token: customToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user claims (for roles)
export const setUserClaims = async (uid, claims) => {
  try {
    const auth = adminAuth();
    if (!auth) {
      throw new Error('Firebase Admin not initialized');
    }
    
    await auth.setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};