const express = require('express');
const router = express.Router();
const { getRooms, getRoomByNumber } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRooms);
router.get('/:roomNumber', getRoomByNumber);

module.exports = router;
