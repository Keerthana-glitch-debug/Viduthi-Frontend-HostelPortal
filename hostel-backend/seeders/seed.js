const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Equipment = require('../models/Equipment');
const MessMenu = require('../models/MessMenu');
const { generateAttendanceAuditHash, generateTurnstilePassToken } = require('../utils/cryptoToken');
const { HOSTEL_DEFAULT_LAT, HOSTEL_DEFAULT_LNG } = require('../utils/geofence');

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keerthana';
    console.log(`[Seeder] Connecting to MongoDB (Cluster: keerthana)...`);
    await mongoose.connect(uri);
    console.log(`[Seeder] Connected to database: ${mongoose.connection.name}`);

    // Clear existing collections
    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Complaint.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Attendance.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
      Equipment.deleteMany({}),
      MessMenu.deleteMany({}),
    ]);

    // Pre-hash default passwords: 123 for students on first login, Vidudhi@2026 for staff
    const studentHashedPassword = await bcrypt.hash('123', 10);
    const staffHashedPassword = await bcrypt.hash('Vidudhi@2026', 10);

    // 1. Seed Real Users: 10 Authentic CSE Students + 4 Single Staff Roles
    console.log('[Seeder] Creating 14 authentic user accounts (10 Students with default password 123 + 4 Staff)...');
    const users = await User.create([
      // Students (Default First-time Login Password: 123)
      {
        name: 'Keerthana',
        email: '24104030@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104030',
        roomNumber: 'B-37',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '3rd Year B.E. (CSE)',
        phone: '+91 98401 23456',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        language: 'en',
      },
      {
        name: 'P.Sri Rooba',
        email: '24104404@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104404',
        roomNumber: 'B-38',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04404',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        language: 'en',
      },
      {
        name: 'S.Santhosha',
        email: '24104123@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104123',
        roomNumber: 'B-38',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        language: 'en',
      },
      {
        name: 'S.Renuka Devi',
        email: '24104022@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104022',
        roomNumber: 'B-39',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04022',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        language: 'en',
      },
      {
        name: 'Karthika L',
        email: '24104052@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104052',
        roomNumber: 'B-39',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04052',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        language: 'en',
      },
      {
        name: 'L.Dheiva Lakshmi',
        email: '24104096@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104096',
        roomNumber: 'B-40',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04096',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
        language: 'en',
      },
      {
        name: 'AXD Nevesa',
        email: '24104122@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104122',
        roomNumber: 'B-40',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04122',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
        language: 'en',
      },
      {
        name: 'M.Anu Rahini',
        email: '24104073@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104073',
        roomNumber: 'B-41',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04073',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        language: 'en',
      },
      {
        name: 'N.M.Viswa Meera',
        email: '24104124@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104124',
        roomNumber: 'B-41',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '2nd Year B.E. (CSE)',
        phone: '+91 94421 04124',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        language: 'en',
      },
      {
        name: 'M.Afrose Nisha',
        email: '24104084@nec.edu.in',
        password: studentHashedPassword,
        role: 'student',
        rollNo: '24104084',
        roomNumber: 'B-37',
        block: 'Block B',
        department: 'Computer Science & Engineering',
        year: '3rd Year B.E. (CSE)',
        phone: '+91 94421 04084',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        language: 'en',
      },

      // Single Staff Roles
      {
        name: 'Jeyanthi',
        email: 'keerthana020706@gmail.com',
        password: staffHashedPassword,
        role: 'warden',
        staffId: 'WRD-1001',
        department: 'Hostel Administration',
        roomNumber: 'Warden Office',
        block: 'Block B',
        phone: '+91 94440 01101',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        language: 'en',
      },
      {
        name: 'Prof. K. Venkatesh',
        email: 'admin.venkatesh@vidudhi.edu',
        password: staffHashedPassword,
        role: 'admin',
        staffId: 'ADM-0001',
        department: 'Executive Residential Directorate',
        phone: '+91 94440 01100',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        language: 'en',
      },
      {
        name: 'Mrs. Muthumari',
        email: 'muthumari@vidudhi.edu',
        password: staffHashedPassword,
        role: 'mess_manager',
        staffId: 'MESS-101',
        department: 'Catering & Dietary Operations',
        roomNumber: 'Mess Management Office',
        block: 'Dining Block',
        phone: '+91 98401 77889',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        language: 'ta',
      },
      {
        name: 'Dr. Madhu',
        email: 'doctor.madhu@vidudhi.edu',
        password: staffHashedPassword,
        role: 'doctor',
        staffId: 'DOC-201',
        department: 'Campus Health & Medical Center',
        roomNumber: 'Health Clinic 1',
        block: 'Health Wing',
        phone: '+91 94440 22334',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        language: 'en',
      },
    ]);

    const keerthana = users[0];
    const sriRooba = users[1];
    const santhosha = users[2];
    const renukaDevi = users[3];
    const karthika = users[4];
    const dheivaLakshmi = users[5];
    const nevesa = users[6];
    const anuRahini = users[7];
    const viswaMeera = users[8];
    const afroseNisha = users[9];

    const warden = users[10];
    const admin = users[11];
    const messManager = users[12];
    const doctor = users[13];

    // 2. Seed Real Hostel Rooms
    console.log('[Seeder] Seeding residential rooms across Block A, B, and C...');
    await Room.create([
      {
        roomNumber: 'B-37',
        block: 'Block B',
        floor: 3,
        capacity: 2,
        occupancy: 2,
        status: 'Full',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Balcony', 'Ceiling Fan', 'Study Table'],
        residents: [
          {
            studentId: keerthana._id,
            name: keerthana.name,
            rollNo: keerthana.rollNo,
            department: keerthana.department,
            phone: keerthana.phone,
          },
          {
            studentId: afroseNisha._id,
            name: afroseNisha.name,
            rollNo: afroseNisha.rollNo,
            department: afroseNisha.department,
            phone: afroseNisha.phone,
          },
        ],
      },
      {
        roomNumber: 'B-38',
        block: 'Block B',
        floor: 3,
        capacity: 2,
        occupancy: 2,
        status: 'Full',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Ceiling Fan', 'Study Desk'],
        residents: [
          {
            studentId: sriRooba._id,
            name: sriRooba.name,
            rollNo: sriRooba.rollNo,
            department: sriRooba.department,
            phone: sriRooba.phone,
          },
          {
            studentId: santhosha._id,
            name: santhosha.name,
            rollNo: santhosha.rollNo,
            department: santhosha.department,
            phone: santhosha.phone,
          },
        ],
      },
      {
        roomNumber: 'B-39',
        block: 'Block B',
        floor: 3,
        capacity: 2,
        occupancy: 2,
        status: 'Full',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Balcony', 'Study Table'],
        residents: [
          {
            studentId: renukaDevi._id,
            name: renukaDevi.name,
            rollNo: renukaDevi.rollNo,
            department: renukaDevi.department,
            phone: renukaDevi.phone,
          },
          {
            studentId: karthika._id,
            name: karthika.name,
            rollNo: karthika.rollNo,
            department: karthika.department,
            phone: karthika.phone,
          },
        ],
      },
      {
        roomNumber: 'B-40',
        block: 'Block B',
        floor: 3,
        capacity: 2,
        occupancy: 2,
        status: 'Full',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Ceiling Fan'],
        residents: [
          {
            studentId: dheivaLakshmi._id,
            name: dheivaLakshmi.name,
            rollNo: dheivaLakshmi.rollNo,
            department: dheivaLakshmi.department,
            phone: dheivaLakshmi.phone,
          },
          {
            studentId: nevesa._id,
            name: nevesa.name,
            rollNo: nevesa.rollNo,
            department: nevesa.department,
            phone: nevesa.phone,
          },
        ],
      },
      {
        roomNumber: 'B-41',
        block: 'Block B',
        floor: 3,
        capacity: 2,
        occupancy: 2,
        status: 'Full',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Study Table', 'Balcony'],
        residents: [
          {
            studentId: anuRahini._id,
            name: anuRahini.name,
            rollNo: anuRahini.rollNo,
            department: anuRahini.department,
            phone: anuRahini.phone,
          },
          {
            studentId: viswaMeera._id,
            name: viswaMeera.name,
            rollNo: viswaMeera.rollNo,
            department: viswaMeera.department,
            phone: viswaMeera.phone,
          },
        ],
      },

      {
        roomNumber: 'A-101',
        block: 'Block A',
        floor: 1,
        capacity: 2,
        occupancy: 0,
        status: 'Available',
        type: 'Double Sharing',
        amenities: ['High-Speed LAN', 'Balcony', 'AC Unit'],
        residents: [],
      },
      {
        roomNumber: 'A-201',
        block: 'Block B',
        floor: 2,
        capacity: 1,
        occupancy: 0,
        status: 'Available',
        type: 'Single AC',
        amenities: ['Split AC', 'Private Balcony', 'LAN Port', 'Study Library'],
        residents: [],
      },
      {
        roomNumber: 'C-101',
        block: 'Block C',
        floor: 1,
        capacity: 2,
        occupancy: 0,
        status: 'Maintenance',
        type: 'Double Sharing',
        amenities: ['Ceiling Fan', 'LAN Port'],
        residents: [],
      },
    ]);

        // 3. Seed Maintenance Complaints
    console.log('[Seeder] Seeding maintenance grievance tickets...');
    await Complaint.create([
      {
        ticketId: 'TKT-1042',
        title: 'Geyser Thermostat Trip in 1st Floor Common Washroom',
        description: 'The solar-electric hybrid water heater in Block A 1st floor trips every 10 minutes when both heating elements engage.',
        category: 'Plumbing',
        priority: 'High',
        roomNumber: 'B-37',
        block: 'Block B',
        student: keerthana._id,
        studentName: keerthana.name,
        studentRoll: keerthana.rollNo,
        status: 'In Progress',
        assignedStaff: 'K. Murugan (Senior Electrician)',
      },
      {
        ticketId: 'TKT-1088',
        title: 'Wi-Fi Access Point AP-204 Packet Drop',
        description: 'Packet drop exceeding 40% during evening study hours on SSID Vidudhi-Resident-Secure in corridor B2.',
        category: 'Internet / Wi-Fi',
        priority: 'Medium',
        roomNumber: 'B-37',
        block: 'Block B',
        student: keerthana._id,
        studentName: keerthana.name,
        studentRoll: keerthana.rollNo,
        status: 'Open',
        assignedStaff: 'Campus IT Helpdesk',
      },
      {
        ticketId: 'TKT-0955',
        title: 'Window Mesh Replacement',
        description: 'Mosquito mesh on northern balcony window frame is torn and needs restretching.',
        category: 'Carpentry',
        priority: 'Low',
        roomNumber: 'B-37',
        block: 'Block B',
        student: keerthana._id,
        studentName: keerthana.name,
        studentRoll: keerthana.rollNo,
        status: 'Resolved',
        assignedStaff: 'R. Velu (Campus Carpenter)',
        resolutionNotes: 'Stainless steel 304 insect wire screen installed and bolted.',
        resolvedAt: new Date(Date.now() - 86400000 * 2),
      },
    ]);

    // 4. Seed Leave Outpasses with Cryptographic QR tokens
    console.log('[Seeder] Seeding leave requests with turnstile QR clearance tokens...');
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const tokenKeerthana = generateTurnstilePassToken({
      passId: 'LP-3142',
      studentRoll: keerthana.rollNo,
      departureDate: todayStr,
      returnDate: todayStr,
    });

    

    await LeaveRequest.create([
      {
        passId: 'LP-3142',
        student: keerthana._id,
        studentName: keerthana.name,
        studentRoll: keerthana.rollNo,
        roomNumber: 'B-37',
        type: 'Day Pass',
        destination: 'Anna Centenary Library, Kotturpuram',
        reason: 'Final year thesis reference collection and digital journal access.',
        parentContact: '+91 98401 23456',
        departureDate: todayStr,
        departureTime: '15:30',
        expectedReturnDate: todayStr,
        expectedReturnTime: '20:30',
        status: 'Approved',
        approvedBy: warden.name,
        isCurfewCompliant: true,
        turnstileQrToken: tokenKeerthana,
      },
      {
        passId: 'LP-8821',
        student: keerthana._id,
        studentName: keerthana.name,
        studentRoll: keerthana.rollNo,
        roomNumber: 'B-37',
        type: 'Weekend Outpass',
        destination: 'Home Residence (Coimbatore)',
        reason: 'Attending family wedding reception.',
        parentContact: '+91 98402 34567',
        departureDate: todayStr,
        departureTime: '17:00',
        expectedReturnDate: tomorrowStr,
        expectedReturnTime: '21:00',
        status: 'Approved',
        approvedBy: warden.name,
        isCurfewCompliant: true,
        turnstileQrToken: tokenKeerthana,
      },
    ]);

    // 5. Seed Attendance with GPS Coordinates and SHA-256 HMAC Hashes
    console.log('[Seeder] Seeding cryptographic GPS attendance records...');
    const auditHashKeerthana = generateAttendanceAuditHash({
      studentId: keerthana._id.toString(),
      studentRoll: keerthana.rollNo,
      date: todayStr,
      time: '20:15:32',
      lat: HOSTEL_DEFAULT_LAT,
      lng: HOSTEL_DEFAULT_LNG,
    });

    

    await Attendance.create([
      {
        student: keerthana._id,
        studentRoll: keerthana.rollNo,
        studentName: keerthana.name,
        roomNumber: 'B-37',
        block: 'Block B',
        date: todayStr,
        time: '20:15:32',
        status: 'Present',
        verificationType: 'GPS + Biometric',
        coordinates: {
          lat: HOSTEL_DEFAULT_LAT,
          lng: HOSTEL_DEFAULT_LNG,
          accuracy: 4,
        },
        distanceFromGateMeters: 12.4,
        isInsideGeofence: true,
        biometricVerified: true,
        auditHash: auditHashKeerthana,
        verifiedByWarden: false,
      },
    ]);

    // 6. Seed Recently Accessed Activity Logs
    console.log('[Seeder] Seeding user activity & recently accessed trails...');
    await ActivityLog.create([
      {
        user: keerthana._id,
        userName: keerthana.name,
        userRole: keerthana.role,
        action: 'CHECK_IN_ATTENDANCE',
        resourceType: 'attendance',
        title: 'Verified GPS & Biometric Roll-Call',
        route: '/app/attendance',
        metadata: { distanceMeters: 12.4, auditHash: auditHashKeerthana },
      },
      {
        user: keerthana._id,
        userName: keerthana.name,
        userRole: keerthana.role,
        action: 'VIEWED_ROOM',
        resourceType: 'room',
        title: 'Inspected Room A-101 Allocation Matrix',
        route: '/app/rooms?search=A-101',
      },
      {
        user: keerthana._id,
        userName: keerthana.name,
        userRole: keerthana.role,
        action: 'APPLIED_OUTPASS',
        resourceType: 'leave',
        title: 'Approved Day Pass #LP-3142',
        route: '/app/leave',
      },
      {
        user: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'ADMIN_AUDIT',
        resourceType: 'admin',
        title: 'Generated Institutional Occupancy & Capacity Report',
        route: '/app',
      },
      {
        user: warden._id,
        userName: warden.name,
        userRole: warden.role,
        action: 'RUN_SIMULATION',
        resourceType: 'simulation',
        title: 'Executed What-If Simulator: Final Semester Exam Week',
        route: '/app/simulation',
      },
    ]);

    // 7. Seed Broadcast Notifications
    console.log('[Seeder] Seeding broadcast notifications and announcements...');
    await Notification.create([
      {
        title: 'Curfew & Gate Closure Notice',
        message: 'Night curfew lock is at 09:30 PM sharp on weekdays and 10:00 PM on weekends. Verify your GPS & Biometric attendance prior to curfew lock.',
        type: 'gate',
        audience: 'students',
        author: 'Chief Warden Jeyanthi',
        pinned: true,
      },
      {
        title: 'Dining Hall Mess Menu Add-ons',
        message: 'Express dinner add-ons (Chicken curry ₹60, Omelette ₹25, Egg Poriyal ₹20) are now active and billed directly to your room tab.',
        type: 'mess',
        audience: 'all',
        author: 'Mrs. Muthumari (Mess Supervisor)',
        pinned: true,
      },
      {
        title: 'Block A Solar Hybrid Geyser Maintenance',
        message: 'Maintenance team is servicing the 1st floor hybrid heating coil today from 14:00 to 16:30.',
        type: 'maintenance',
        audience: 'block_a',
        author: 'Campus Maintenance Desk',
        pinned: false,
      },
      {
        title: 'Smart Laundry Machine Availability',
        message: 'Machines 1 & 2 (Block A) and 3 & 4 (Block B) are operational from 06:00 to 22:00. Steam ironing available at ₹20/cloth.',
        type: 'announcement',
        audience: 'all',
        author: 'Hostel Facilities Team',
        pinned: false,
      },
      {
        title: 'Recreational Badminton & Gym Slots',
        message: 'Evening gym and badminton slots are open 05:00 PM – 08:30 PM. Collect equipment from Block B desk.',
        type: 'announcement',
        audience: 'all',
        author: 'Sports Committee',
        pinned: false,
      },
    ]);

    console.log('================================================================');
    console.log(' Vidudhi MERN Database Seeded Successfully (Cluster: keerthana)');
    console.log('================================================================');
    console.log(' Authentic Accounts Available for Login:');
    console.log(' 1. 24104030@nec.edu.in / 24104030 (Student - Keerthana) -> Pass: Vidudhi@2026');
    console.log(' 2. keerthana020706@gmail.com / WRD-1001 (Warden - Jeyanthi) -> Pass: Vidudhi@2026');
    console.log(' 3. admin.venkatesh@vidudhi.edu / ADM-0001 (Admin - Prof. Venkatesh) -> Pass: Vidudhi@2026');
    console.log(' 4. muthumari@vidudhi.edu / MESS-101 (Mess - Mrs. Muthumari) -> Pass: Vidudhi@2026');
    console.log(' 5. doctor.madhu@vidudhi.edu / DOC-201 (Doctor - Dr. Madhu) -> Pass: Vidudhi@2026');
    
    // 7. Seed Equipment (Sports & Gym)
    console.log('[Seeder] Seeding Sports & Gym Equipments...');
    await Equipment.create([
      { name: 'Volleyball', type: 'sports', category: 'Outdoor Ball Sports', totalStock: 6, availableStock: 4, location: 'Sports Room', specs: '', maxBorrowHours: 3, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Table Tennis Items', type: 'sports', category: 'Indoor Racket Sports', totalStock: 8, availableStock: 5, location: 'Sports Room', specs: '', maxBorrowHours: 2, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Shuttle for Badminton', type: 'sports', category: 'Racket Sports', totalStock: 12, availableStock: 8, location: 'Sports Room', specs: '', maxBorrowHours: 3, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Cork (Shuttlecock)', type: 'sports', category: 'Consumables', totalStock: 20, availableStock: 14, location: 'Sports Room', specs: '', maxBorrowHours: 2, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Throwball', type: 'sports', category: 'Team Sports', totalStock: 5, availableStock: 3, location: 'Sports Room', specs: '', maxBorrowHours: 3, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Chess Board', type: 'sports', category: 'Board Games', totalStock: 6, availableStock: 4, location: 'Sports Room', specs: '', maxBorrowHours: 4, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Carrom Board', type: 'sports', category: 'Board Games', totalStock: 5, availableStock: 3, location: 'Sports Room', specs: '', maxBorrowHours: 3, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Treadmill', type: 'gym', category: 'Cardio Equipment', totalStock: 3, availableStock: 3, location: 'Cardio Zone', specs: 'Commercial Heavy-Duty Motorized 4.0 HP, Auto Incline', maxBorrowHours: 1, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Big Ball (Gym/Swiss Ball)', type: 'gym', category: 'Aerobics & Core', totalStock: 3, availableStock: 3, location: 'Stretching & Core Zone', specs: '65cm Anti-burst Heavy Gauge Inflatable Balance Ball', maxBorrowHours: 1, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Cycle Machine', type: 'gym', category: 'Cardio Equipment', totalStock: 1, availableStock: 1, location: 'Cardio Zone', specs: 'Magnetic Flywheel Upright Spin Bike with LCD Pulse Monitor', maxBorrowHours: 1, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Dumbbells', type: 'gym', category: 'Free Weights', totalStock: 1, availableStock: 1, location: 'Free Weights Section', specs: 'Complete Hex Rubber Encased Set (2.5 kg to 25 kg)', maxBorrowHours: 1, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Hip Twister (Waist Rotator)', type: 'gym', category: 'Core & Flexibility', totalStock: 2, availableStock: 2, location: 'Core Zone', specs: 'Dual Standing Disc Rotator Machine with Gripped Handlebars', maxBorrowHours: 1, updatedBy: 'Jeyanthi (Warden)' },
      { name: 'Yoga Mat', type: 'gym', category: 'Flexibility & Yoga', totalStock: 12, availableStock: 12, location: 'Stretching & Yoga Deck', specs: '6mm High-Density Textured Non-Slip TPE Exercise Mats', maxBorrowHours: 2, updatedBy: 'Jeyanthi (Warden)' },
    ]);

    // 8. Seed Handwritten 7-Day Mess Menu
    console.log('[Seeder] Seeding Handwritten 7-Day Mess Menu...');
    await MessMenu.create([
      {
        day: 'Monday',
        breakfast: 'Pongal - sambar - chutney (Bread)',
        lunch: 'Paruppu kolambu, Potato, valakai fry',
        snacksWeek1: 'Steamed peanuts',
        snacksWeek2: 'Fried peanut',
        dinner: 'Chappati - mushroom / meal-maker gravy',
        lunchSpecial: 'Paruppu Kolambu & Valakai Fry',
        dietType: 'South Indian Veg',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Tuesday',
        breakfast: 'Poori with channa gravy',
        lunch: 'Sambar rice & Beetroot (Tomato rice & curd rice) with (meal maker) (Egg - opt.)',
        snacksWeek1: 'Cutlet / Popcorn',
        snacksWeek2: 'Paruppu vadai',
        dinner: 'Dosa - Tomato chutney',
        lunchSpecial: 'Sambar Rice & Beetroot / Egg Optional',
        dietType: 'South Indian Veg / Egg Optional',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Wednesday',
        breakfast: 'Pongal with vadai',
        lunch: 'Biriyani (mushroom) / Pulao + (chicken + egg add.)',
        snacksWeek1: 'Pacha Payiru',
        snacksWeek2: 'Pacha Payiru',
        dinner: 'Idli with malli chutney / pudina chutney',
        lunchSpecial: 'Mushroom Biriyani / Chicken Biriyani + Egg',
        dietType: 'Special Biriyani (Veg / Non-Veg Optional)',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Thursday',
        breakfast: 'Dosa with kesari',
        lunch: 'Vatha kulambu [Egg gravy - addn.] [Moor kolambu - lemon juice]',
        snacksWeek1: 'Puffs / Veg roll',
        snacksWeek2: 'Samosa / Poli',
        dinner: 'Variety rice (Pudina, lemon, Puliyotharai rice)',
        lunchSpecial: 'Vatha Kulambu & Moor Kolambu',
        dietType: 'Traditional South Indian Veg',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Friday',
        breakfast: 'Idly - Tomato chutney',
        lunch: 'Full meals with (Payasam -> milk/paruppu)',
        snacksWeek1: 'Black konda kadali',
        snacksWeek2: 'White konda kadali',
        dinner: 'Chapati / mushroom meal maker / Paneer (add. chicken) gravy',
        lunchSpecial: 'Traditional Full Meals Feast with Sweet Payasam',
        dietType: 'Grand Friday Meals & Sweet Payasam',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Saturday',
        breakfast: 'Poori - Pattani',
        lunch: 'Oorunda kolambu / moor kolambu (valakai chips) (senai kilangu chips)',
        snacksWeek1: 'Onion vadai',
        snacksWeek2: 'Onion vadai',
        dinner: 'Idiyappam - Thengapaal - kadali curry',
        lunchSpecial: 'Oorunda Kolambu & Crunchy Senai Kilangu Chips',
        dietType: 'South Indian Veg',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
      {
        day: 'Sunday',
        breakfast: 'Special dosa - Sambar - Chutney',
        lunch: 'Biriyani / sambar (lady\'s finger)',
        snacksWeek1: 'Kozhukattai',
        snacksWeek2: 'Bajji',
        dinner: 'Semiya biriyani / ragi semiya / Idli (Chutney (malli), Tomato / katti chutney)',
        lunchSpecial: 'Sunday Special Biriyani & Lady\'s Finger Sambar',
        dietType: 'Weekend Feast (Biriyani / Sambar)',
        updatedBy: 'Mrs. Muthumari (Mess Supervisor)',
      },
    ]);

    console.log('================================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedDatabase();
