# AquaAlert Complaint System

## Overview

The AquaAlert complaint system allows community members to report water quality issues, infrastructure problems, and health concerns directly through the application. All complaints are stored in the database and high-priority complaints trigger email notifications to government officials.

## Features

### Community Dashboard Integration

- **Report Issue Button**: Orange gradient button in the navigation bar
- **Modal Form**: Comprehensive complaint submission form
- **Real-time Validation**: Form validation with error messages
- **Success Feedback**: Confirmation messages after submission

### Complaint Categories

1. **Water Quality**: Contamination, taste, odor, clarity issues
2. **Water Supply**: Shortages, pressure problems, irregular supply
3. **Infrastructure**: Pipe leaks, equipment failures, maintenance issues
4. **Health Concerns**: Waterborne illnesses, safety hazards

### Priority Levels

- **Low**: Minor issues, non-urgent matters
- **Medium**: Moderate issues affecting daily activities
- **High**: Serious issues requiring prompt attention
- **Critical**: Emergency situations, immediate health risks

## Technical Implementation

### Frontend (React)

- **Component**: `ComplaintForm` in `CommunityDashboard.jsx`
- **State Management**: Local component state for form data
- **Validation**: Client-side form validation
- **API Integration**: POST requests to `/api/complaints`

### Backend (Node.js/Express)

- **Endpoint**: `POST /api/complaints` - Submit new complaints
- **Endpoint**: `GET /api/complaints` - Retrieve complaints (for officials)
- **Database**: Firebase Firestore with fallback to in-memory storage
- **Email Notifications**: Automatic emails for high/critical priority complaints

### Database Schema

```javascript
{
  id: "timestamp_string",
  title: "Complaint title",
  category: "water_quality|water_supply|infrastructure|health_concerns",
  priority: "low|medium|high|critical",
  description: "Detailed description",
  location: "Location details (optional)",
  contactName: "Reporter name (optional)",
  contactEmail: "Reporter email (optional)",
  contactPhone: "Reporter phone (optional)",
  anonymous: boolean,
  status: "open|in_progress|resolved|closed",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

## Usage Guide

### For Community Members

1. **Access**: Navigate to Community Dashboard
2. **Report**: Click "Report Issue" button
3. **Fill Form**: Complete the complaint form with details
4. **Submit**: Submit the form and receive confirmation
5. **Follow Up**: Note the complaint ID for future reference

### For Government Officials

1. **Access**: Use GET `/api/complaints` endpoint
2. **Filter**: Filter by status, category, or priority
3. **Review**: Review complaint details and contact information
4. **Action**: Take appropriate action and update status

## Email Notifications

### Automatic Notifications

- **Trigger**: High and Critical priority complaints
- **Recipients**: Government officials (configured in environment)
- **Content**: Complete complaint details with ID for tracking
- **Timing**: Immediate upon submission

### Email Template

```
Subject: 🚨 [PRIORITY] Priority Complaint - [Title]

A new [priority] priority complaint has been submitted:

Title: [complaint title]
Category: [category]
Priority: [priority level]
Location: [location if provided]

Description:
[detailed description]

Contact Information:
[contact details or "Anonymous submission"]

Submitted: [timestamp]
Complaint ID: [unique identifier]
```

## API Documentation

### Submit Complaint

**POST** `/api/complaints`

**Request Body:**

```javascript
{
  "title": "Required string",
  "category": "Required enum",
  "priority": "Required enum",
  "description": "Required string",
  "location": "Optional string",
  "contactName": "Optional string",
  "contactEmail": "Optional string",
  "contactPhone": "Optional string",
  "anonymous": "Optional boolean"
}
```

**Response:**

```javascript
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaintId": "unique_id",
  "status": "open"
}
```

### Retrieve Complaints

**GET** `/api/complaints`

**Query Parameters:**

- `status`: Filter by complaint status
- `category`: Filter by complaint category
- `priority`: Filter by priority level

**Response:**

```javascript
{
  "success": true,
  "complaints": [
    {
      "id": "complaint_id",
      "title": "Complaint title",
      // ... other complaint fields
    }
  ]
}
```

## Security Considerations

### Data Protection

- Optional anonymous submissions
- Contact information stored securely
- Email notifications only for authorized officials

### Validation

- Server-side input validation
- XSS protection through proper encoding
- Rate limiting to prevent spam

### Privacy

- Anonymous option for sensitive reports
- Contact information optional
- Secure transmission over HTTPS

## Deployment Notes

### Environment Variables

```bash
EMAIL_USER=aquaalert9@gmail.com
EMAIL_PASS=yceu_gpig_ncmi_akkm
GOVT_EMAIL=official@government.com
```

### Database Setup

- Firebase Firestore collection: `complaints`
- Automatic collection creation on first complaint
- Indexes for filtering by status, category, priority

### Testing

1. **Unit Tests**: Form validation and API endpoints
2. **Integration Tests**: End-to-end complaint submission
3. **Email Tests**: Notification delivery verification

## Future Enhancements

### Planned Features

- **Status Updates**: Track complaint resolution progress
- **Admin Dashboard**: Management interface for officials
- **Photo Uploads**: Visual evidence attachment
- **SMS Notifications**: Alternative notification method
- **Complaint Analytics**: Reporting and trend analysis

### Technical Improvements

- **Real-time Updates**: WebSocket notifications
- **Advanced Search**: Full-text search capabilities
- **Bulk Operations**: Mass status updates
- **API Rate Limiting**: Enhanced spam protection
- **Audit Logging**: Complete action history

## Troubleshooting

### Common Issues

1. **Form Not Submitting**: Check network connectivity and backend status
2. **Email Not Received**: Verify email configuration and spam folders
3. **Database Errors**: Check Firebase configuration and credentials

### Debug Endpoints

- `GET /health` - Server and database status
- `POST /api/debug/email/test` - Test email functionality
- `GET /api/debug/email/status` - Check email configuration

## Support

For technical support or feature requests, contact the AquaAlert development team or submit a complaint through the system itself.
