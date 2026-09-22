const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function run() {
  const args = process.argv.slice(2);
  let email = args[0];
  let name = args[1];
  let role = args[2] || 'student';
  let rollNo = args[3];

  const isInteractive = args.length === 0;

  if (isInteractive) {
    console.log('\n======================================================');
    console.log(' Vidudhi Resident Portal - Add User to MongoDB Atlas  ');
    console.log('======================================================\n');
    email = await prompt('Enter user Gmail or institutional email: ');
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  email = email.toLowerCase().trim();

  const suggestedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (isInteractive) {
    const inputName = await prompt(`Enter full name [default: ${suggestedName}]: `);
    name = inputName || suggestedName;

    const inputRole = await prompt('Enter role (student / warden / admin) [default: student]: ');
    if (['student', 'warden', 'admin'].includes(inputRole.toLowerCase())) {
      role = inputRole.toLowerCase();
    }

    if (role === 'student') {
      const defaultRoll = email.match(/\d{5,}/)?.[0] || `2410${Math.floor(1000 + Math.random() * 9000)}`;
      const inputRoll = await prompt(`Enter student roll number [default: ${defaultRoll}]: `);
      rollNo = inputRoll || defaultRoll;
    }
  } else {
    name = name || suggestedName;
    role = role || 'student';
    if (!rollNo && role === 'student') {
      rollNo = email.match(/\d{5,}/)?.[0] || `2410${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';

  console.log(`\nConnecting to MongoDB Atlas...`);
  await mongoose.connect(uri);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log(`\n⚠️ User with email "${email}" already exists!`);
    console.log(`   ID: ${existingUser._id}`);
    console.log(`   Name: ${existingUser.name}`);
    console.log(`   Role: ${existingUser.role}`);
    console.log(`   Roll No / Staff ID: ${existingUser.rollNo || existingUser.staffId || 'N/A'}`);
    console.log(`   Active: ${existingUser.isActive}`);
    console.log(`\nThis account is already authorized to log in via Google OAuth and Password.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Vidudhi@2026', 10);

  const block = role === 'student' ? 'A Block' : 'Admin Wing';
  const roomNumber = role === 'student' ? `A-${Math.floor(100 + Math.random() * 200)}` : 'W-01';

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    rollNo: role === 'student' ? rollNo : undefined,
    staffId: role !== 'student' ? `STAFF-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    roomNumber,
    block,
    department: 'Computer Science & Engineering',
    phone: '+91 98401 ' + Math.floor(10000 + Math.random() * 90000),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    language: 'en',
    isActive: true,
  });

  console.log('\n======================================================');
  console.log('✅ NEW USER SUCCESSFULLY ADDED TO MONGODB ATLAS!');
  console.log('======================================================');
  console.log(`Name:        ${newUser.name}`);
  console.log(`Email:       ${newUser.email}`);
  console.log(`Role:        ${newUser.role}`);
  console.log(`Roll Number: ${newUser.rollNo || newUser.staffId || 'N/A'}`);
  console.log(`Room/Block:  ${newUser.roomNumber} (${newUser.block})`);
  console.log(`Default Pwd: Vidudhi@2026`);
  console.log(`Database:    Atlas (vidudhi.users)`);
  console.log('======================================================\n');
  console.log(`👉 This user can now immediately sign in:`);
  console.log(`   1. Click "Continue with Google" using this Gmail account.`);
  console.log(`   2. Or enter Roll/Email: "${newUser.email}" and Password: "Vidudhi@2026"\n`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Failed to add user to MongoDB Atlas:', err.message);
  process.exit(1);
});
