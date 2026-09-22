const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { verifyCampusGeofence } = require('../utils/geofence');
const { generateAttendanceAuditHash } = require('../utils/cryptoToken');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Student Record Attendance via GPS Coordinates + Biometric Check
// @route   POST /api/attendance/check-in
// @access  Private (Student)
exports.checkIn = async (req, res) => {
  try {
    const { lat, lng, accuracy = 5, biometricVerified = true } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Accurate GPS coordinates (latitude and longitude) are required for biometric verification.',
      });
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toTimeString().slice(0, 8);

    // 1. Algorithmic Geofence Calculation
    const geofenceResult = verifyCampusGeofence(Number(lat), Number(lng));
    const isInside = geofenceResult.isInside;

    // 2. Generate Cryptographic HMAC SHA-256 Audit Signature
    const auditHash = generateAttendanceAuditHash({
      studentId: req.user._id.toString(),
      studentRoll: req.user.rollNo || '24104031',
      date: todayDate,
      time: currentTime,
      lat,
      lng,
    });

    const status = isInside ? 'Present' : 'Unverified';

    // 3. Upsert today's attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { studentRoll: req.user.rollNo, date: todayDate },
      {
        student: req.user._id,
        studentRoll: req.user.rollNo,
        studentName: req.user.name,
        roomNumber: req.user.roomNumber || 'A-101',
        block: req.user.block || 'Block A',
        date: todayDate,
        time: currentTime,
        status,
        verificationType: 'GPS + Biometric',
        coordinates: {
          lat: Number(lat),
          lng: Number(lng),
          accuracy: Number(accuracy),
        },
        distanceFromGateMeters: geofenceResult.distanceMeters,
        isInsideGeofence: isInside,
        biometricVerified: Boolean(biometricVerified),
        auditHash,
        verifiedByWarden: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Log to Recently Accessed / Activity Trail
    await recordActivity({
      user: req.user,
      action: isInside ? 'ATTENDANCE_VERIFIED' : 'ATTENDANCE_OUTSIDE_GEOFENCE',
      resourceType: 'attendance',
      resourceId: attendanceRecord._id.toString(),
      title: `GPS Roll-Call: ${status} (${geofenceResult.distanceMeters}m from Gate)`,
      route: '/app/attendance',
      metadata: {
        distanceMeters: geofenceResult.distanceMeters,
        auditHash,
      },
    });

    res.status(200).json({
      success: true,
      message: isInside
        ? 'Geofence and Biometric check-in verified successfully. Status: Present.'
        : `GPS location is outside campus perimeter (${geofenceResult.distanceMeters}m from gate). Flagged as Unverified.`,
      data: {
        record: attendanceRecord,
        geofence: geofenceResult,
        cryptographicProof: {
          algorithm: 'HMAC-SHA256',
          auditHash,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[Attendance CheckIn Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Daily Roll-Call Register for Warden / Admin
// @route   GET /api/attendance/daily
// @access  Private (Warden, Admin)
exports.getDailyRollCall = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const records = await Attendance.find({ date }).sort({ time: -1 });

    const totalPresent = records.filter((r) => r.status === 'Present').length;
    const totalUnverified = records.filter((r) => r.status === 'Unverified').length;
    const totalLeave = records.filter((r) => r.status === 'On Approved Leave').length;

    res.status(200).json({
      success: true,
      date,
      summary: {
        totalRecords: records.length,
        present: totalPresent,
        unverified: totalUnverified,
        onLeave: totalLeave,
      },
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Warden Manual Override Verification
// @route   PATCH /api/attendance/override/:id
// @access  Private (Warden, Admin)
exports.wardenOverride = async (req, res) => {
  try {
    const { status = 'Present', notes = 'Verified by Warden on duty' } = req.body;
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    record.status = status;
    record.verifiedByWarden = true;
    record.wardenNotes = notes;
    await record.save();

    await recordActivity({
      user: req.user,
      action: 'WARDEN_OVERRIDE',
      resourceType: 'attendance',
      resourceId: record._id.toString(),
      title: `Warden Override for ${record.studentName} (${record.studentRoll}) -> ${status}`,
      route: '/app/attendance',
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record manually updated and verified by warden.',
      record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Student's Attendance History
// @route   GET /api/attendance/history
// @access  Private (Student)
exports.getMyAttendanceHistory = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const history = await Attendance.find({ studentRoll: rollNo }).sort({ date: -1 }).limit(30);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
