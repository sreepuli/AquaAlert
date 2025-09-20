// Admin User Creation Script
// Run this script to create the first admin user

const createAdminUser = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@aquaalert.gov.in',
        password: 'AdminAqua2025!',
        name: 'System Administrator',
        secretKey: 'AQUAALERT_ADMIN_SECRET_2025'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@aquaalert.gov.in');
      console.log('🔑 Password: AdminAqua2025!');
      console.log('🆔 Admin ID:', result.adminId);
    } else {
      console.error('❌ Failed to create admin:', result.message);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Also manually create admin user in Firebase
const manualAdminData = {
  email: 'admin@aquaalert.gov.in',
  name: 'System Administrator',
  role: 'admin',
  userType: 'admin',
  isActive: true,
  verificationStatus: 'approved',
  createdAt: new Date(),
  permissions: ['user_management', 'system_admin', 'verification_admin'],
  lastLogin: new Date()
};

console.log('🔧 Manual Admin User Data for Firebase:');
console.log(JSON.stringify(manualAdminData, null, 2));

console.log('\n📋 To create admin user:');
console.log('1. Start your backend server');
console.log('2. Run: createAdminUser()');
console.log('3. OR manually add to Firebase with the data above');
console.log('4. Login with: admin@aquaalert.gov.in / AdminAqua2025!');

// Export for use
if (typeof window !== 'undefined') {
  window.createAdminUser = createAdminUser;
}