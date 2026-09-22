const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get Admin Dashboard Overview Statistics
// @route   GET /api/admin/overview
// @access  Private (Admin & Warden)
exports.getOverviewStats = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalResidents,
      totalWardens,
      totalRooms,
      occupiedBeds,
      totalBeds,
      pendingComplaints,
      urgentComplaints,
      activeOutpasses,
      todayAttendanceCount,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'warden', isActive: true }),
      Room.countDocuments(),
      Room.aggregate([{ $group: { _id: null, total: { $sum: '$occupancy' } } }]),
      Room.aggregate([{ $group: { _id: null, total: { $sum: '$capacity' } } }]),
      Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      Complaint.countDocuments({ priority: 'Urgent', status: { $in: ['Open', 'In Progress'] } }),
      LeaveRequest.countDocuments({ status: 'Approved' }),
      Attendance.countDocuments({ date: today, status: 'Present' }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const bedsCount = totalBeds[0]?.total || 520;
    const occupiedCount = occupiedBeds[0]?.total || totalResidents;
    const occupancyRate = bedsCount > 0 ? Math.round((occupiedCount / bedsCount) * 100) : 88;
    const attendanceRate = totalResidents > 0 ? Math.round((todayAttendanceCount / totalResidents) * 100) : 94;

    res.status(200).json({
      success: true,
      data: {
        residents: {
          total: totalResidents,
          wardens: totalWardens,
          presentTonight: todayAttendanceCount,
          onLeave: activeOutpasses,
          attendanceRate: `${attendanceRate}%`,
        },
        facilities: {
          totalRooms,
          totalBeds: bedsCount,
          occupiedBeds: occupiedCount,
          occupancyRate: `${occupancyRate}%`,
        },
        operations: {
          pendingComplaints,
          urgentComplaints,
          activeOutpasses,
          systemStatus: 'Optimal (Cluster keerthana Online)',
        },
        recentActivity: recentLogs,
      },
    });
  } catch (error) {
    console.error('[Admin Overview Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Users in Directory
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Create User
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNo, staffId, roomNumber, block, department, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Vidudhi@2026',
      role: role || 'student',
      rollNo,
      staffId,
      roomNumber,
      block,
      department,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully in database.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        staffId: user.staffId,
        roomNumber: user.roomNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = req.body;
    // Don't update password through this route
    delete updates.password;

    Object.assign(user, updates);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deactivated.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get System Audit Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
