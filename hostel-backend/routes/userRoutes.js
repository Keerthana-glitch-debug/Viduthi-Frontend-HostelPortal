const express = require('express');
const router = express.Router();
const {
  getRecentlyAccessed,
  logRecentlyAccessed,
  updateLanguage,
  enrollFace,
  getFaceProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recently-accessed', getRecentlyAccessed);
router.post('/recently-accessed', logRecentlyAccessed);
router.patch('/language', updateLanguage);
router.post('/enroll-face', enrollFace);
router.get('/face-profile', getFaceProfile);

module.exports = router;
