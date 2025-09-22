# AquaAlert - Render Deployment Guide

## 🚀 Production Deployment Instructions

This guide will help you deploy the AquaAlert application to Render with full-stack configuration.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Email Configuration**: Gmail account with App Password enabled
4. **Firebase Project**: Optional (system works in demo mode)

## 📁 Deployment Files Overview

- `render.yaml` - Render deployment configuration
- `.env.production` - Production environment variables template
- `backend/server.js` - Production-ready backend server
- `vite.config.js` - Frontend build configuration
- `Dockerfile` - Optional containerized deployment

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Ensure all files are committed to your GitHub repository
2. Verify the following files exist:
   - `render.yaml`
   - `.env.production`
   - `backend/package.json`
   - `package.json`
   - `vite.config.js`

### Step 2: Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select your AquaAlert repository

### Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

#### Backend Service Environment Variables:

```env
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
GOVERNMENT_EMAILS=srilakshmipulisri@gmail.com,sreepuli24@gmail.com,manidweep2005@gmail.com
DEMO_MODE=true
SEND_DAILY_REPORTS=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

#### Frontend Service Environment Variables:

```env
NODE_ENV=production
VITE_ENVIRONMENT=production
```

### Step 4: Deploy Services

1. **Backend Deployment**:

   - Service Type: Web Service
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Health Check Path: `/health`

2. **Frontend Deployment**:
   - Service Type: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Step 5: Configure Service Communication

1. After both services are deployed, update environment variables:
   - `FRONTEND_URL` in backend service (set to frontend URL)
   - `CORS_ORIGIN` in backend service (set to frontend URL)
   - `VITE_API_URL` in frontend service (set to backend URL)

## 🔒 Security Configuration

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS` in environment variables

### Firebase Configuration (Optional)

If you want to use Firebase instead of demo mode:

1. Create a Firebase project
2. Generate a service account key
3. Add the credentials to environment variables
4. Set `DEMO_MODE=false`

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- Backend: `https://your-backend-url.onrender.com/health`
- Frontend: Automatic via Render

### Log Monitoring

- Check Render dashboard for real-time logs
- Monitor email sending functionality
- Watch sensor simulation status

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Build Failures

```bash
# Check package.json scripts
npm run build  # Should work locally first
```

#### 2. CORS Errors

- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check environment variable spelling

#### 3. Email Issues

- Verify Gmail App Password is correct
- Check firewall/network restrictions
- Test with fewer recipients first

#### 4. Service Communication

- Ensure both services are deployed and running
- Check environment variables are set correctly
- Verify URLs don't have trailing slashes

### Debug Commands

```bash
# Test backend health
curl https://your-backend-url.onrender.com/health

# Test email system
curl -X POST https://your-backend-url.onrender.com/api/test/email

# Check simulation status
curl https://your-backend-url.onrender.com/api/sensors/simulation/status
```

## 🔄 Automatic Deployments

Render will automatically redeploy when you push to your main branch:

1. Make changes locally
2. Commit and push to GitHub
3. Render automatically builds and deploys
4. Monitor deployment in Render dashboard

## 📈 Scaling & Performance

### Production Optimizations

- **Frontend**: Static files served via CDN
- **Backend**: Auto-scaling based on traffic
- **Database**: Demo mode for development, Firebase for production
- **Email**: Rate limiting and retry logic included

### Monitoring

- **Uptime**: Render provides automatic monitoring
- **Performance**: Check response times in dashboard
- **Errors**: Monitor application logs

## 🎯 Post-Deployment Checklist

- [ ] Both services are deployed and healthy
- [ ] Frontend loads correctly
- [ ] Backend health check passes
- [ ] Email system works (test endpoint)
- [ ] Sensor simulation starts properly
- [ ] Environment variables are configured
- [ ] CORS is working (no console errors)
- [ ] Government officials receive test emails

## 💡 Tips for Success

1. **Test Locally First**: Ensure everything works locally before deploying
2. **Environment Variables**: Double-check all environment variables
3. **Gradual Rollout**: Test with a subset of features first
4. **Monitor Logs**: Watch deployment logs for any issues
5. **Backup Plan**: Keep local development environment ready

## 🆘 Support

If you encounter issues:

1. Check Render documentation
2. Review application logs in Render dashboard
3. Test individual components (backend, frontend, email)
4. Verify environment variables
5. Check GitHub repository settings

## 📞 Contact Information

- **Project**: AquaAlert Water Quality Monitoring System
- **Version**: 1.0.0
- **Deployment**: Render Platform
- **Environment**: Production

---

**Success!** 🎉 Your AquaAlert application is now running in production on Render!
