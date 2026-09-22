const express = require('express');
const router = express.Router();
const {
  getRecentlyAccessed,
  logRecentlyAccessed,
  updateLanguage,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recently-accessed', getRecentlyAccessed);
router.post('/recently-accessed', logRecentlyAccessed);
router.patch('/language', updateLanguage);

module.exports = router;
