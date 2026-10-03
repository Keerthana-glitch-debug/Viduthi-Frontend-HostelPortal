const express = require('express');
const router = express.Router();
const {
  getRecentlyAccessed,
  logRecentlyAccessed,
  updateLanguage,
  enrollFace,
  getFaceProfile,
  enrollFingerprint,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recently-accessed', getRecentlyAccessed);
router.post('/recently-accessed', logRecentlyAccessed);
router.patch('/language', updateLanguage);
router.post('/enroll-face', enrollFace);
router.get('/face-profile', getFaceProfile);
router.get('/biometric-profile', getFaceProfile);
router.post('/enroll-fingerprint', enrollFingerprint);
router.patch('/profile', updateProfile);

module.exports = router;

