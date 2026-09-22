const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Overview available to both Admin and Warden
router.get('/overview', authorize('admin', 'warden'), getOverviewStats);

// User directory & management accessible to Central Admin and Hostel Warden
router.get('/users', authorize('admin', 'warden'), getUsers);
router.post('/users', authorize('admin', 'warden'), createUser);
router.patch('/users/:id', authorize('admin', 'warden'), updateUser);
router.delete('/users/:id', authorize('admin', 'warden'), deleteUser);
router.get('/logs', authorize('admin'), getAuditLogs);

module.exports = router;
