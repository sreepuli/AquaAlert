# Firebase Firestore Rules Setup Guide

## The Problem

You're getting "Missing or insufficient permissions" because Firestore has default security rules that block all reads/writes.

## Quick Fix - Temporary Rules (FOR TESTING ONLY)

For immediate testing, you can temporarily use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Update Firestore Rules

### Option 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **project-md-2acd4**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Replace the existing rules with either:
   - The temporary rules above (for quick testing)
   - The production rules from `firestore.rules` file (for proper security)
6. Click **Publish**

### Option 2: Firebase CLI (Advanced)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

## Current Rules Explanation

The `firestore.rules` file I created includes:

- ✅ **Users**: Can read/write their own profile
- ✅ **ASHA Workers**: Can manage health data and reports
- ✅ **Community Members**: Can read alerts, create community reports
- ✅ **Government Officials**: Full access to analytics and administrative data
- ✅ **Role-based permissions**: Each user type has appropriate access levels

## Recommended Steps

1. **For immediate testing**: Use the temporary permissive rules
2. **For production**: Use the detailed rules from `firestore.rules`
3. **Test your app**: Try signup/login after updating rules
4. **Monitor**: Check Firebase Console > Firestore > Usage for any issues

## Security Note

Never use permissive rules (`allow read, write: if true;`) in production. Always authenticate users and implement proper role-based access.
