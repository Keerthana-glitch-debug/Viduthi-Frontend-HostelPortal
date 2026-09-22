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

async function seedFiveRoles() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected to database:', mongoose.connection.name);

  // Clear existing users to ensure clean 5 roles
  await User.deleteMany({});
  console.log('Cleared existing users in vidudhi.users');

  const hashedPassword = await bcrypt.hash('Vidudhi@2026', 10);

  const usersToSeed = [
    // 1. STUDENT
    {
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
    },
    // 2. WARDEN
    {
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
    },
    // 3. ADMIN
    {
      name: 'Prof. K. Venkatesh',
      email: 'admin.venkatesh@vidudhi.edu',
      password: hashedPassword,
      role: 'admin',
      staffId: 'ADM-0001',
      department: 'Executive Residential Directorate',
      block: 'Admin Tower',
      roomNumber: 'Suite 204',
      phone: '+91 94440 00010',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      language: 'en',
      isActive: true,
      authProvider: 'local',
    },
    // 4. MESS MANAGER
    {
      name: 'S. Meenakshi',
      email: 'mess.meenakshi@vidudhi.edu',
      password: hashedPassword,
      role: 'mess_manager',
      staffId: 'MESS-101',
      department: 'Catering & Dietary Operations',
      block: 'Dining Block',
      roomNumber: 'Mess Office',
      phone: '+91 98401 77889',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      language: 'en',
      isActive: true,
      authProvider: 'local',
    },
    // 5. DOCTOR
    {
      name: 'Dr. Anitha Mohan',
      email: 'doctor.anitha@vidudhi.edu',
      password: hashedPassword,
      role: 'doctor',
      staffId: 'DOC-201',
      department: 'Campus Health & Medical Center',
      block: 'Health Wing',
      roomNumber: 'Clinic 1',
      phone: '+91 94440 22334',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      language: 'en',
      isActive: true,
      authProvider: 'local',
    },
  ];

  await User.insertMany(usersToSeed);
  console.log('✅ Successfully seeded 5 authentic role accounts in MongoDB Atlas!');

  const all = await User.find({}).select('name email role rollNo staffId roomNumber block');
  console.table(
    all.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Identifier: u.rollNo || u.staffId,
      Location: `${u.roomNumber} (${u.block})`,
    }))
  );

  await mongoose.connection.close();
}

seedFiveRoles().catch((err) => {
  console.error('Failed to seed 5 roles:', err);
  process.exit(1);
});
