const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.patch('/:id', authorize('warden', 'admin', 'staff'), updateComplaint);

module.exports = router;
