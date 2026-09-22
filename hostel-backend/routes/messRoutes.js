const express = require('express');
const router = express.Router();
const { getMessMenu, updateDayMenu } = require('../controllers/messController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/menu', getMessMenu);
router.put('/menu/:day', protect, authorize('mess_manager', 'warden', 'admin'), updateDayMenu);

module.exports = router;
