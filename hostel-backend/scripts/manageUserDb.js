const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://keerthana:vidudhi2026@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function listUsers() {
  await connect();
  const users = await User.find({}).sort({ role: 1, name: 1 }).lean();
  console.log(`\n=== Central Registry: ${users.length} Users in Database ===\n`);
  console.table(
    users.map((u) => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      RollOrStaffId: u.rollNo || u.staffId || '—',
      Room: `${u.roomNumber || '—'} (${u.block || '—'})`,
      FaceID: u.isFaceEnrolled ? '✓ Enrolled' : 'Pending',
      Fingerprint: u.isFingerprintEnrolled ? '✓ Linked' : 'Pending',
    }))
  );
  await mongoose.disconnect();
}

async function findUser(query) {
  await connect();
  const user = await User.findOne({
    $or: [{ email: query.toLowerCase() }, { rollNo: query }, { staffId: query }, { name: new RegExp(query, 'i') }],
  }).lean();

  if (!user) {
    console.log(`❌ No user found matching "${query}".`);
    await mongoose.disconnect();
    return;
  }

  console.log(`\n=== User Profile in MongoDB Atlas ===`);
  console.log(`ID:           ${user._id}`);
  console.log(`Name:         ${user.name}`);
  console.log(`Email:        ${user.email}`);
  console.log(`Role:         ${user.role}`);
  console.log(`Roll Number:  ${user.rollNo || 'N/A'}`);
  console.log(`Staff ID:     ${user.staffId || 'N/A'}`);
  console.log(`Room/Block:   ${user.roomNumber || 'N/A'} (${user.block || 'N/A'})`);
  console.log(`Department:   ${user.department || 'N/A'}`);
  console.log(`Phone:        ${user.phone || 'N/A'}`);
  console.log(`Active:       ${user.isActive}`);
  console.log(`\n--- Biometric Proofs ---`);
  console.log(`Face ID Enrolled:     ${user.isFaceEnrolled ? 'YES' : 'NO'}`);
  console.log(`Face Enrolled At:     ${user.faceEnrolledAt || 'Never'}`);
  console.log(`Face Photo Snapshot:  ${user.facePhoto ? `Available (${user.facePhoto.length} chars data URI)` : 'None'}`);
  console.log(`Face 128-D Vector:    ${user.faceDescriptor ? `Available (${user.faceDescriptor.length} dimensions Float32)` : 'None'}`);
  console.log(`Fingerprint Enrolled: ${user.isFingerprintEnrolled ? 'YES' : 'NO'}`);
  console.log(`Fingerprint Enrolled: ${user.fingerprintEnrolledAt || 'Never'}`);
  console.log(`Fingerprint Cred ID:  ${user.fingerprintCredentialId || 'None'}`);
  console.log(`Fingerprint Proof:    ${user.fingerprintProofHash || 'None'}`);
  console.log('=====================================\n');

  await mongoose.disconnect();
}

async function updateUser(query, updates) {
  await connect();
  const user = await User.findOne({
    $or: [{ email: query.toLowerCase() }, { rollNo: query }, { staffId: query }],
  });

  if (!user) {
    console.log(`❌ No user found matching "${query}".`);
    await mongoose.disconnect();
    return;
  }

  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email.toLowerCase();
  if (updates.roomNumber) user.roomNumber = updates.roomNumber;
  if (updates.block) user.block = updates.block;
  if (updates.department) user.department = updates.department;
  if (updates.phone) user.phone = updates.phone;
  if (updates.rollNo) user.rollNo = updates.rollNo;

  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updates.password, salt);
    console.log(`✓ Password updated and re-hashed with bcrypt.`);
  }

  if (updates.resetBiometrics) {
    user.faceDescriptor = null;
    user.facePhoto = null;
    user.isFaceEnrolled = false;
    user.faceEnrolledAt = null;
    user.fingerprintCredentialId = null;
    user.fingerprintProofHash = null;
    user.isFingerprintEnrolled = false;
    user.fingerprintEnrolledAt = null;
    console.log(`✓ All Biometrics (Face ID & Fingerprint) have been cleared.`);
  }

  if (updates.setFingerprint) {
    user.isFingerprintEnrolled = true;
    user.fingerprintEnrolledAt = new Date();
    user.fingerprintCredentialId = `CLI_ENROLLED_${user.rollNo || user._id}_${Date.now().toString(16)}`;
    user.fingerprintProofHash = `SHA256:FINGERPRINT_PROOF_${Date.now().toString(16)}`;
    console.log(`✓ Fingerprint biometric proof recorded in database.`);
  }

  await user.save({ validateBeforeSave: false });
  console.log(`✅ Successfully updated user "${user.name}" (${user.email}) in MongoDB Atlas!`);
  await mongoose.disconnect();
}

// CLI Argument Parser
const args = process.argv.slice(2);
const command = args[0] || 'list';

if (command === 'list') {
  listUsers().catch(console.error);
} else if (command === 'find') {
  const query = args[1];
  if (!query) {
    console.log('Usage: node scripts/manageUserDb.js find <email_or_roll>');
    process.exit(1);
  }
  findUser(query).catch(console.error);
} else if (command === 'update') {
  const query = args[1];
  if (!query) {
    console.log('Usage: node scripts/manageUserDb.js update <email_or_roll> [--name "..."] [--room "..."] [--password "..."]');
    process.exit(1);
  }
  const updates = {};
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--name') updates.name = args[++i];
    if (args[i] === '--email') updates.email = args[++i];
    if (args[i] === '--room') updates.roomNumber = args[++i];
    if (args[i] === '--block') updates.block = args[++i];
    if (args[i] === '--department') updates.department = args[++i];
    if (args[i] === '--phone') updates.phone = args[++i];
    if (args[i] === '--password') updates.password = args[++i];
    if (args[i] === '--reset-biometrics') updates.resetBiometrics = true;
    if (args[i] === '--set-fingerprint') updates.setFingerprint = true;
  }
  updateUser(query, updates).catch(console.error);
} else {
  console.log(`
Vidudhi Resident Portal - Database User Management CLI
Commands:
  node scripts/manageUserDb.js list
  node scripts/manageUserDb.js find <email_or_roll>
  node scripts/manageUserDb.js update <email_or_roll> --name "New Name" --room "B-204" --phone "9840100000" --password "123"
  node scripts/manageUserDb.js update <email_or_roll> --reset-biometrics
  node scripts/manageUserDb.js update <email_or_roll> --set-fingerprint
  `);
}
