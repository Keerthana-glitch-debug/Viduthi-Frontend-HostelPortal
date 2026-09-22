const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const Complaint = require('../models/Complaint');
const LeaveRequest = require('../models/LeaveRequest');
const Room = require('../models/Room');

async function viewDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keerthana';

  console.log('\n===============================================================');
  console.log('       VIDUDHI PORTAL — LIVE MONGODB INSPECTOR');
  console.log(` Target Cluster / Database: keerthana`);
  console.log(` Connection URI: ${uri}`);
  console.log('===============================================================\n');

  try {
    await mongoose.connect(uri);
    console.log(`[STATUS] Successfully connected to MongoDB: ${mongoose.connection.host}\n`);

    // 1. Users Collection
    const users = await User.find().select('name email role rollNo staffId roomNumber');
    console.log(`=== 1. USERS COLLECTION (${users.length} accounts) ===`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Role: u.role.toUpperCase(),
        Identifier: u.rollNo || u.staffId || u.email,
        Email: u.email,
        Room: u.roomNumber || '—',
      }))
    );

    // 2. Real-Time Activity & Recently Accessed Logs
    const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);
    console.log(`\n=== 2. RECENT ACTIVITY & AUDIT LOGS (${activities.length} recent entries) ===`);
    console.table(
      activities.map((a) => ({
        User: a.userName,
        Role: a.userRole,
        Action: a.action,
        Resource: a.resourceType,
        Title: a.title,
        Time: new Date(a.createdAt).toLocaleTimeString(),
      }))
    );

    // 3. Attendance Records (GPS Geofenced + HMAC Signatures)
    const attendances = await Attendance.find().sort({ date: -1 }).limit(5);
    console.log(`\n=== 3. ATTENDANCE & GEOFENCE LOGS (${attendances.length} records) ===`);
    console.table(
      attendances.map((att) => ({
        Student: att.studentName,
        RollNo: att.studentRoll,
        Status: att.status,
        GateDistance: `${att.distanceFromGateMeters}m`,
        InsideGeofence: att.isInsideGeofence ? 'YES' : 'NO',
        AuditHMAC: att.auditHash ? `${att.auditHash.slice(0, 16)}...` : '—',
        Date: att.date,
      }))
    );

    // 4. Leave & Outpass Passes
    const leaves = await LeaveRequest.find().limit(5);
    console.log(`\n=== 4. LEAVE & OUTPASS REQUESTS (${leaves.length} records) ===`);
    console.table(
      leaves.map((l) => ({
        PassID: l.passId,
        Student: l.studentName,
        Destination: l.destination,
        Status: l.status,
        CurfewCompliant: l.isCurfewCompliant ? 'YES' : 'VIOLATION',
        TurnstileToken: l.turnstileQrToken.slice(0, 18) + '...',
      }))
    );

    // 5. Maintenance Complaints
    const complaints = await Complaint.find().limit(5);
    console.log(`\n=== 5. MAINTENANCE GRIEVANCE TICKETS (${complaints.length} tickets) ===`);
    console.table(
      complaints.map((c) => ({
        Ticket: c.ticketId,
        Title: c.title.slice(0, 30) + '...',
        Category: c.category,
        Priority: c.priority,
        Status: c.status,
        Room: `${c.roomNumber} (${c.block})`,
      }))
    );

    console.log('\n===============================================================');
    console.log(' Inspection Complete. All data stored persistently in MongoDB.');
    console.log('===============================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

viewDatabase();
