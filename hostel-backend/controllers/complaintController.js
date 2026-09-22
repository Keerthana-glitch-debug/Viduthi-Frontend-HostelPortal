const Complaint = require('../models/Complaint');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get Complaints (Students get their own, Staff/Warden/Admin get all)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { student: req.user._id } : {};
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Maintenance Complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, roomNumber, block } = req.body;
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaint = await Complaint.create({
      ticketId,
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      roomNumber: roomNumber || req.user.roomNumber || 'A-101',
      block: block || req.user.block || 'Block A',
      student: req.user._id,
      studentName: req.user.name,
      studentRoll: req.user.rollNo,
    });

    await recordActivity({
      user: req.user,
      action: 'FILED_COMPLAINT',
      resourceType: 'complaint',
      resourceId: complaint._id.toString(),
      title: `Grievance #${ticketId}: ${title}`,
      route: '/app/complaints',
      metadata: { category, priority },
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance grievance ticket filed successfully.',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Complaint Status (Warden/Admin/Staff)
// @route   PATCH /api/complaints/:id
// @access  Private (Warden, Admin, Staff)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, assignedStaff, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) complaint.status = status;
    if (assignedStaff) complaint.assignedStaff = assignedStaff;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    await recordActivity({
      user: req.user,
      action: 'UPDATED_COMPLAINT_STATUS',
      resourceType: 'complaint',
      resourceId: complaint._id.toString(),
      title: `Ticket #${complaint.ticketId} updated to ${status}`,
      route: '/app/complaints',
    });

    res.status(200).json({
      success: true,
      message: 'Ticket status updated.',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
