const express = require('express');
const router = express.Router();
const { getLeaveRequests, createLeaveRequest, updateLeaveStatus, verifyGatePass } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest);
router.patch('/:id', authorize('warden', 'admin'), updateLeaveStatus);
router.post('/verify/:id', authorize('warden', 'admin', 'staff'), verifyGatePass);

module.exports = router;
