const express = require('express');
const router = express.Router();
const {
  checkIn,
  getDailyRollCall,
  wardenOverride,
  getMyAttendanceHistory,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.get('/history', getMyAttendanceHistory);
router.get('/daily', authorize('warden', 'admin'), getDailyRollCall);
router.patch('/override/:id', authorize('warden', 'admin'), wardenOverride);

module.exports = router;
