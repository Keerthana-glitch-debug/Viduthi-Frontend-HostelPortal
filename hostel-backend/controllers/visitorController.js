const Visitor = require('../models/Visitor');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get All Gate Visitors
// @route   GET /api/visitors
// @access  Private (Warden, Admin, Staff)
exports.getVisitors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const visitors = await Visitor.find(filter).sort({ entryTime: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register Gate Visitor
// @route   POST /api/visitors
// @access  Private (Staff, Warden, Admin)
exports.registerVisitor = async (req, res) => {
  try {
    const { visitorName, visitorPhone, relation, hostStudentRoll, hostStudentName, hostRoom, purpose, idProofType, idProofNumber } = req.body;

    const passNumber = `V-PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    const visitor = await Visitor.create({
      passNumber,
      visitorName,
      visitorPhone,
      relation,
      hostStudentRoll,
      hostStudentName,
      hostRoom,
      purpose,
      idProofType: idProofType || 'Aadhaar',
      idProofNumber: idProofNumber || 'XXXX-XXXX-XXXX',
    });

    await recordActivity({
      user: req.user,
      action: 'REGISTERED_VISITOR',
      resourceType: 'system',
      resourceId: visitor._id.toString(),
      title: `Visitor Check-In: ${visitorName} (Host: ${hostStudentName})`,
      route: '/app/visitors',
    });

    res.status(201).json({
      success: true,
      message: 'Gate entry visitor pass issued.',
      visitor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sign Out Visitor
// @route   PATCH /api/visitors/:id/checkout
// @access  Private (Staff, Warden, Admin)
exports.checkoutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    visitor.exitTime = new Date();
    visitor.status = 'Checked Out';
    await visitor.save();

    res.status(200).json({
      success: true,
      message: `Visitor ${visitor.visitorName} checked out successfully.`,
      visitor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Visitor Pass Status (Approve / Reject / Update)
// @route   PATCH /api/visitors/:id/status
// @access  Private (Warden, Admin)
exports.updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    if (!['Pending', 'Approved', 'Rejected', 'Active Inside', 'Checked Out', 'Overstayed Alert'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    visitor.status = status;
    if (status === 'Checked Out' && !visitor.exitTime) {
      visitor.exitTime = new Date();
    }
    await visitor.save();

    await recordActivity({
      user: req.user,
      action: 'UPDATED_VISITOR_STATUS',
      resourceType: 'system',
      resourceId: visitor._id.toString(),
      title: `Visitor Pass ${visitor.passNumber} status updated to ${status} by ${req.user.name}`,
      route: '/app/visitors',
    });

    res.status(200).json({
      success: true,
      message: `Visitor pass status updated to ${status}.`,
      visitor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

