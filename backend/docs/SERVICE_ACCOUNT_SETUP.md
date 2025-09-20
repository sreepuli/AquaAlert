# Firebase Service Account Key Setup

## Why do you need a service account key?

The service account key (key.json) is needed for:
- Server-side Firebase operations
- Reading/writing to Firestore from backend
- Managing users from server
- Sending notifications
- Administrative tasks

## How to get your service account key:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: "project-md-2acd4"

2. **Navigate to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

3. **Go to Service Accounts Tab**
   - Click on "Service accounts" tab
   - You'll see "Firebase Admin SDK" section

4. **Generate Private Key**
   - Click "Generate new private key" button
   - A dialog will appear warning about security
   - Click "Generate key"

5. **Download the Key**
   - A JSON file will be downloaded
   - Rename it to "service-account-key.json"
   - Place it in your backend folder

## ⚠️ SECURITY WARNING

**NEVER commit service-account-key.json to version control!**

Add to your .gitignore:
```
service-account-key.json
*.json
.env
```

## Alternative: Environment Variables

Instead of using a JSON file, you can use environment variables:
- More secure for production
- No file to accidentally commit
- Works well with hosting platforms