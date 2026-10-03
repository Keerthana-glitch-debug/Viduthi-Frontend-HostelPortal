const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get Current User's Recently Accessed Items
// @route   GET /api/user/recently-accessed
// @access  Private
exports.getRecentlyAccessed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recentItems = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recentItems.length,
      items: recentItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explicitly Record a Recently Accessed Item
// @route   POST /api/user/recently-accessed
// @access  Private
exports.logRecentlyAccessed = async (req, res) => {
  try {
    const { action, resourceType, resourceId, title, route, metadata } = req.body;

    if (!title || !resourceType) {
      return res.status(400).json({
        success: false,
        message: 'Resource title and resourceType are required.',
      });
    }

    const log = await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: action || 'ACCESSED_MODULE',
      resourceType,
      resourceId: resourceId || '',
      title,
      route: route || '/app',
      metadata: metadata || {},
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Recently accessed item logged successfully.',
      log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Multilingual Language Preference
// @route   PATCH /api/user/language
// @access  Private
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    if (!['en', 'ta', 'hi'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Allowed values: 'en' (English), 'ta' (Tamil), 'hi' (Hindi).",
      });
    }

    const user = await User.findById(req.user._id);
    user.language = language;
    await user.save({ validateBeforeSave: false });

    await recordActivity({
      user,
      action: 'CHANGED_LANGUAGE',
      resourceType: 'profile',
      title: `Language updated to ${language.toUpperCase()}`,
      route: '/app/settings',
    });

    res.status(200).json({
      success: true,
      message: `Preferred language updated to ${language}.`,
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll / Update Student Face Biometric Descriptor
// @route   POST /api/user/enroll-face
// @access  Private
exports.enrollFace = async (req, res) => {
  try {
    const { descriptor, photo } = req.body;

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: 'Invalid biometric descriptor. A valid 128-element Float32 vector is required.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.faceDescriptor = descriptor;
    user.isFaceEnrolled = true;
    user.faceEnrolledAt = new Date();
    if (photo) {
      user.facePhoto = photo;
    }
    await user.save({ validateBeforeSave: false });

    await recordActivity({
      user,
      action: 'ENROLLED_BIOMETRIC_FACE',
      resourceType: 'biometrics',
      title: `Biometric 128-D FaceID vector enrolled for ${user.name}`,
      route: '/app/settings',
    });

    res.status(200).json({
      success: true,
      message: 'Facial biometric profile enrolled successfully in database.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,
        isFaceEnrolled: user.isFaceEnrolled,
        faceEnrolledAt: user.faceEnrolledAt,
        facePhoto: user.facePhoto,
        faceDescriptor: user.faceDescriptor,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Student Face Biometric Profile
// @route   GET /api/user/face-profile
// @access  Private
exports.getFaceProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      isFaceEnrolled: user.isFaceEnrolled || false,
      faceEnrolledAt: user.faceEnrolledAt,
      facePhoto: user.facePhoto,
      faceDescriptor: user.faceDescriptor,
      isFingerprintEnrolled: user.isFingerprintEnrolled || false,
      fingerprintEnrolledAt: user.fingerprintEnrolledAt,
      fingerprintProofHash: user.fingerprintProofHash,
      fingerprintCredentialId: user.fingerprintCredentialId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll / Update Student Hardware Fingerprint Biometric Proof
// @route   POST /api/user/enroll-fingerprint
// @access  Private
exports.enrollFingerprint = async (req, res) => {
  try {
    const { credentialId, proofHash } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fingerprintCredentialId = credentialId || `WEBAUTHN_${user.rollNo || user._id}_${Date.now().toString(16)}`;
    user.fingerprintProofHash = proofHash || `SHA256:BIOMETRIC_PROOF_${Date.now().toString(16)}`;
    user.isFingerprintEnrolled = true;
    user.fingerprintEnrolledAt = new Date();
    await user.save({ validateBeforeSave: false });

    await recordActivity({
      user,
      action: 'ENROLLED_BIOMETRIC_FINGERPRINT',
      resourceType: 'biometrics',
      title: `Hardware Biometric Fingerprint enrolled for ${user.name}`,
      route: '/app/attendance',
    });

    res.status(200).json({
      success: true,
      message: 'Fingerprint biometric proof successfully saved to database.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        isFingerprintEnrolled: user.isFingerprintEnrolled,
        fingerprintEnrolledAt: user.fingerprintEnrolledAt,
        fingerprintProofHash: user.fingerprintProofHash,
        fingerprintCredentialId: user.fingerprintCredentialId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Current User Profile Information
// @route   PATCH /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, roomNumber, block, department } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (roomNumber) user.roomNumber = roomNumber.trim();
    if (block) user.block = block.trim();
    if (department) user.department = department.trim();

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully in database.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        roomNumber: user.roomNumber,
        block: user.block,
        department: user.department,
        phone: user.phone,
        isFaceEnrolled: user.isFaceEnrolled,
        isFingerprintEnrolled: user.isFingerprintEnrolled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


