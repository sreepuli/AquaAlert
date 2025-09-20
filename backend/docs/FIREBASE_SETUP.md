# Firebase Setup Guide for AquaAlert

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "aquaalert" or your preferred name
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

## Step 3: Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>)
4. Register your app with name "AquaAlert"
5. Copy the Firebase configuration object

## Step 5: Update Configuration

Replace the demo config in `src/firebase.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

## Step 6: Test Authentication

1. Start your development server: `npm run dev`
2. Go to `/auth` page
3. Try signing up with different roles
4. Check Firebase Console → Authentication → Users

## Database Structure

The app creates this Firestore structure:

```
users/
  └── {userId}/
      ├── email: string
      ├── role: string ("asha" | "community" | "official")
      ├── createdAt: timestamp
      └── [additional profile data]
```

## Security Rules (Production)

Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features Enabled

✅ Email/Password Authentication  
✅ Role-based User Registration  
✅ Automatic Dashboard Redirection  
✅ Protected Routes  
✅ User Profile Storage  
✅ Logout Functionality
