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
