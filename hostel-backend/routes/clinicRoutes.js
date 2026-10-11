const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// In-memory / database synced state for clinic operations
let clinicState = {
  doctorStatus: 'Available in Hostel Clinic', // 'Available in Hostel Clinic' | 'On Emergency Ward Rounds' | 'Off Duty'
  lastCheckIn: `Today at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
  doctorName: 'Dr. Madhu',
  specialization: 'Campus Health & Medical Officer',
  waitingQueue: [
    {
      id: 'OPD-101',
      token: '#OPD-101',
      studentName: 'Keerthana G.',
      rollNo: '24104030',
      roomNumber: 'B-37',
      department: 'B.E. CSE - III Year',
      symptoms: 'Acute frontal throbbing migraine headache, eye strain & mild nausea',
      priority: 'Normal',
      arrivedAt: '10 mins ago',
      status: 'Waiting',
    },
    {
      id: 'OPD-102',
      token: '#OPD-102',
      studentName: 'P.Sri Rooba',
      rollNo: '24104404',
      roomNumber: 'B-38',
      department: 'B.E. CSE - II Year',
      symptoms: 'Left ankle twist sustained during evening sports; localized swelling',
      priority: 'Urgent',
      arrivedAt: '18 mins ago',
      status: 'Waiting',
    },
  ],
  completedConsultations: [],
};

// GET /api/clinic/status - Anyone authenticated can view clinic availability
router.get('/status', protect, (req, res) => {
  res.status(200).json({
    success: true,
    doctorStatus: clinicState.doctorStatus,
    lastCheckIn: clinicState.lastCheckIn,
    doctorName: clinicState.doctorName,
    specialization: clinicState.specialization,
    waitingCount: clinicState.waitingQueue.length,
    waitingQueue: clinicState.waitingQueue,
  });
});

// POST /api/clinic/status - Doctor / Warden / Admin can update clinic shift & availability
router.post('/status', protect, authorize('doctor', 'warden', 'admin'), (req, res) => {
  const { status, action } = req.body;
  const timeStr = `Today at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  if (action === 'check-in' || status === 'Available in Hostel Clinic' || status === 'Available') {
    clinicState.doctorStatus = 'Available in Hostel Clinic';
    clinicState.lastCheckIn = timeStr;
  } else if (status) {
    clinicState.doctorStatus = status;
    if (status.includes('Available')) {
      clinicState.lastCheckIn = timeStr;
    }
  }
  res.status(200).json({
    success: true,
    message: `Clinic status successfully updated to: ${clinicState.doctorStatus}`,
    doctorStatus: clinicState.doctorStatus,
    lastCheckIn: clinicState.lastCheckIn,
  });
});

// GET /api/clinic/queue - Queue access (privacy-filtered for students)
router.get('/queue', protect, (req, res) => {
  const user = req.user;
  if (user.role === 'student') {
    // Privacy protection: Residents only view queue count and their own status
    const residentItem = clinicState.waitingQueue.find((item) => item.rollNo === user.rollNo);
    return res.status(200).json({
      success: true,
      waitingCount: clinicState.waitingQueue.length,
      yourPosition: residentItem ? clinicState.waitingQueue.indexOf(residentItem) + 1 : null,
      yourRecord: residentItem || null,
      doctorStatus: clinicState.doctorStatus,
    });
  }

  // Doctor, Warden, and Admin get full queue access
  res.status(200).json({
    success: true,
    waitingQueue: clinicState.waitingQueue,
    doctorStatus: clinicState.doctorStatus,
    lastCheckIn: clinicState.lastCheckIn,
  });
});

// POST /api/clinic/consultation - Doctor / Warden completes consultation & issues prescription
router.post('/consultation', protect, authorize('doctor', 'warden', 'admin'), (req, res) => {
  const { studentId, rollNo, diagnosis, medicines, notes, followUpDays } = req.body;

  const consultationRecord = {
    id: `RX-${Date.now()}`,
    studentId,
    rollNo,
    doctor: req.user.name || clinicState.doctorName,
    diagnosis: diagnosis || 'General Clinical Evaluation',
    medicines: medicines || [],
    notes: notes || '',
    followUpDays: followUpDays || 3,
    prescribedAt: new Date().toISOString(),
  };

  clinicState.completedConsultations.unshift(consultationRecord);
  // Remove student from queue
  clinicState.waitingQueue = clinicState.waitingQueue.filter((item) => item.rollNo !== rollNo);

  res.status(201).json({
    success: true,
    message: 'Digital consultation prescription issued successfully.',
    consultation: consultationRecord,
  });
});

module.exports = router;
