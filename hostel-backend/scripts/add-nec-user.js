const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

async function addNecAccount() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';
  await mongoose.connect(uri);
  console.log('Connected to Atlas:', mongoose.connection.host);

  const hashedPassword = await bcrypt.hash('Vidudhi@2026', 10);

  const existing = await User.findOne({ email: '24104030@nec.edu.in' });
  if (!existing) {
    await User.create({
      name: 'Keerthana G.',
      email: '24104030@nec.edu.in',
      password: hashedPassword,
      role: 'student',
      rollNo: '24104030',
      roomNumber: 'A-101',
      block: 'Block A',
      department: 'Computer Science & Engineering',
      year: '3rd Year B.E.',
      phone: '+91 98401 23456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      language: 'en',
      authProvider: 'google',
    });
    console.log('Successfully added 24104030@nec.edu.in to MongoDB Atlas!');
  } else {
    console.log('24104030@nec.edu.in already exists in MongoDB Atlas!');
  }

  const all = await User.find().select('name email role rollNo');
  console.table(all.map(u => ({ Name: u.name, Email: u.email, Role: u.role, RollNo: u.rollNo })));

  await mongoose.connection.close();
}

addNecAccount();
