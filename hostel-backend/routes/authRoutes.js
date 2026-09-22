const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// Public self-registration is strictly disabled by hostel policy.
// Only Hostel Wardens and Administrators can provision resident accounts via /api/admin/users
router.post('/register', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public self-registration is closed. Resident accounts must be provisioned by a Hostel Warden or Administrator.',
  });
});
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/change-password', optionalProtect, changePassword);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

router.get('/oauth/config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || '108249827391-vidudhi-portal-demo.apps.googleusercontent.com',
  });
});

module.exports = router;
