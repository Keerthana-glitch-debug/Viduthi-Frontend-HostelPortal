const LeaveRequest = require('../models/LeaveRequest');
const { generateTurnstilePassToken } = require('../utils/cryptoToken');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get Leave Requests
// @route   GET /api/leave
// @access  Private
exports.getLeaveRequests = async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { student: req.user._id } : {};
    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for Leave / Outpass
// @route   POST /api/leave
// @access  Private (Student)
exports.createLeaveRequest = async (req, res) => {
  try {
    const {
      type = 'Day Pass',
      destination,
      reason,
      parentContact,
      departureDate,
      departureTime,
      expectedReturnDate,
      expectedReturnTime,
    } = req.body;

    if (!destination || !reason || !departureDate || !expectedReturnDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination, reason, departure date, and expected return date are required.',
      });
    }

    const passId = `LP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Curfew check: Return time should be by 21:30 (9:30 PM)
    let isCurfewCompliant = true;
    if (expectedReturnTime) {
      const [hours, minutes] = expectedReturnTime.split(':').map(Number);
      if (hours > 21 || (hours === 21 && minutes > 30)) {
        isCurfewCompliant = false;
      }
    }

    // Cryptographic Turnstile token
    const turnstileQrToken = generateTurnstilePassToken({
      passId,
      studentRoll: req.user.rollNo,
      departureDate,
      returnDate: expectedReturnDate,
    });

    const leave = await LeaveRequest.create({
      passId,
      student: req.user._id,
      studentName: req.user.name,
      studentRoll: req.user.rollNo,
      roomNumber: req.user.roomNumber || 'A-101',
      type,
      destination,
      reason,
      parentContact: parentContact || req.user.phone || '+91 94440 01100',
      departureDate,
      departureTime: departureTime || '16:00',
      expectedReturnDate,
      expectedReturnTime: expectedReturnTime || '21:00',
      status: 'Pending',
      isCurfewCompliant,
      turnstileQrToken,
    });

    await recordActivity({
      user: req.user,
      action: 'APPLIED_OUTPASS',
      resourceType: 'leave',
      resourceId: leave._id.toString(),
      title: `Outpass Request #${passId} to ${destination}`,
      route: '/app/leave',
      metadata: { passId, isCurfewCompliant, destination },
    });

    res.status(201).json({
      success: true,
      message: 'Outpass application submitted for warden clearance.',
      leave,
    });
  } catch (error) {
    console.error('[Leave Create Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Warden Approve/Reject Leave Request
// @route   PATCH /api/leave/:id
// @access  Private (Warden, Admin)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave pass not found.' });
    }

    leave.status = status;
    leave.approvedBy = req.user.name;
    await leave.save();

    await recordActivity({
      user: req.user,
      action: 'LEAVE_STATUS_UPDATED',
      resourceType: 'leave',
      resourceId: leave._id.toString(),
      title: `Outpass #${leave.passId} ${status} by ${req.user.name}`,
      route: '/app/leave',
    });

    res.status(200).json({
      success: true,
      message: `Outpass status updated to ${status}.`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Gate Security Kiosk Verify Outpass & Log Departure
// @route   POST /api/leave/verify/:id
// @access  Private
exports.verifyGatePass = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave pass not found.' });
    }

    leave.turnstileScanned = true;
    leave.gateExitTime = new Date();
    await leave.save();

    await recordActivity({
      user: req.user,
      action: 'GATEPASS_VERIFIED',
      resourceType: 'leave',
      resourceId: leave._id.toString(),
      title: `Student Gate Pass #${leave.passId || leave._id} Verified - Allowed Exit`,
      route: '/app/leave',
    });

    res.status(200).json({
      success: true,
      message: 'Gate Pass Verified Successfully. Resident permitted to exit campus.',
      leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

