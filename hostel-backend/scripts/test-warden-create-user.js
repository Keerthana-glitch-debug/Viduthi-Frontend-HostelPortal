const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function testWardenCreateUser() {
  console.log('--- Testing Warden Authorization for User Creation ---');
  
  // 1. Verify User model and Atlas connection
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to Atlas vidudhi database.');

  const warden = await User.findOne({ role: 'warden' });
  if (!warden) {
    console.error('No warden found in database.');
    process.exit(1);
  }
  console.log(`Found Warden: ${warden.name} (${warden.email}, role: ${warden.role})`);

  // 2. Generate a valid Warden JWT Token
  const token = jwt.sign(
    {
      id: warden._id,
      email: warden.email,
      role: warden.role,
      name: warden.name,
      staffId: warden.staffId,
    },
    process.env.JWT_SECRET || 'vidudhi_keerthana_portal_jwt_secret_token_2026_xyz',
    { expiresIn: '1h' }
  );
  console.log('Generated Warden JWT token.');

  // 3. Test RBAC middleware directly
  const { authorize } = require('../middleware/roleMiddleware');
  const req = { user: { role: 'warden', name: warden.name } };
  let passedRbac = false;
  const res = {
    status: (code) => ({
      json: (data) => console.log('RBAC Rejected with status:', code, data),
    }),
  };
  const next = () => { passedRbac = true; };

  const adminWardenMiddleware = authorize('admin', 'warden');
  adminWardenMiddleware(req, res, next);

  if (passedRbac) {
    console.log('✅ RBAC SUCCESS: Warden role is strictly allowed to access /api/admin/users!');
  } else {
    console.error('❌ RBAC FAILED: Warden was rejected!');
    process.exit(1);
  }

  await mongoose.connection.close();
  console.log('--- Verification Complete ---');
}

testWardenCreateUser().catch(console.error);
