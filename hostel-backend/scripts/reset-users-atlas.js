const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function resetUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';
  console.log('Connecting to MongoDB Atlas at:', uri.split('@')[1] || uri);
  await mongoose.connect(uri);
  console.log('Connected to database:', mongoose.connection.name);

  // 1. Clear ALL existing users from Atlas
  const deleteResult = await User.deleteMany({});
  console.log(`Cleared ${deleteResult.deletedCount} old users from vidudhi.users.`);

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('Vidudhi@2026', 10);

  // 3. Insert Student: Keerthana (24104030@nec.edu.in, Roll 24104030, CSE, Block B, Room B-37)
  const student = await User.create({
    name: 'Keerthana',
    email: '24104030@nec.edu.in',
    password: hashedPassword,
    role: 'student',
    rollNo: '24104030',
    department: 'Computer Science & Engineering',
    block: 'Block B',
    roomNumber: 'B-37',
    year: '3rd Year B.E. (CSE)',
    phone: '+91 98401 23456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    language: 'en',
    isActive: true,
    authProvider: 'google',
  });
  console.log(`✅ Created Student: ${student.name} (${student.email}, Roll: ${student.rollNo}, Block: ${student.block}, Room: ${student.roomNumber})`);

  // 4. Insert Warden: Jeyanthi (keerthana020706@gmail.com, Role: warden)
  const warden = await User.create({
    name: 'Jeyanthi',
    email: 'keerthana020706@gmail.com',
    password: hashedPassword,
    role: 'warden',
    staffId: 'WRD-1001',
    department: 'Hostel Administration',
    block: 'Block B',
    roomNumber: 'Warden Office',
    phone: '+91 94440 01101',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    language: 'en',
    isActive: true,
    authProvider: 'google',
  });
  console.log(`✅ Created Warden: ${warden.name} (${warden.email}, Staff ID: ${warden.staffId}, Role: ${warden.role})`);

  // 5. Query and display the live roster from MongoDB Atlas
  const activeUsers = await User.find({}).select('name email role rollNo staffId block roomNumber');
  console.log('\n======================================================');
  console.log(' CURRENT USERS IN MONGODB ATLAS (vidudhi.users)');
  console.log('======================================================');
  console.table(
    activeUsers.map((u) => ({
      ID: u._id.toString(),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      'Roll/Staff No': u.rollNo || u.staffId || '—',
      Block: u.block,
      Room: u.roomNumber,
    }))
  );
  console.log('======================================================\n');

  await mongoose.connection.close();
  console.log('Database connection closed.');
}

resetUsers().catch((err) => {
  console.error('Failed to reset users in Atlas:', err);
  process.exit(1);
});
