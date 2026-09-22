const express = require('express');
const router = express.Router();
const {
  getEquipments,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  borrowSportsEquipment,
  returnSportsEquipment,
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getEquipments);
router.post('/', protect, authorize('warden', 'admin'), addEquipment);
router.put('/:id', protect, authorize('warden', 'admin'), updateEquipment);
router.delete('/:id', protect, authorize('warden', 'admin'), deleteEquipment);
router.post('/:id/borrow', protect, borrowSportsEquipment);
router.post('/:id/return', protect, returnSportsEquipment);

module.exports = router;
