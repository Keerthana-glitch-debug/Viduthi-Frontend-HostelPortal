const Equipment = require('../models/Equipment');

// @desc    Get all equipments (sports and gym)
// @route   GET /api/equipment
// @access  Public / Private
exports.getEquipments = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const equipments = await Equipment.find(filter).sort({ type: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: equipments.length,
      data: equipments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new equipment (Warden only)
// @route   POST /api/equipment
// @access  Private (Warden, Admin)
exports.addEquipment = async (req, res) => {
  try {
    const { name, type, category, totalStock, availableStock, location, specs, status, maxBorrowHours } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Equipment name and category are required.' });
    }

    const stock = Number(totalStock) || 1;
    const avail = availableStock !== undefined ? Number(availableStock) : stock;

    const equipment = await Equipment.create({
      name: name.trim(),
      type: type === 'gym' ? 'gym' : 'sports',
      category: category.trim(),
      totalStock: stock,
      availableStock: avail,
      location: location ? location.trim() : 'North Sports Pavilion',
      specs: specs ? specs.trim() : '',
      status: status || 'Optimal',
      maxBorrowHours: Number(maxBorrowHours) || 3,
      updatedBy: req.user ? req.user.name : 'Jeyanthi (Warden)',
    });

    res.status(201).json({
      success: true,
      message: 'Equipment added successfully.',
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update equipment (Warden only)
// @route   PUT /api/equipment/:id
// @access  Private (Warden, Admin)
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    let equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    const updates = { ...req.body, updatedBy: req.user ? req.user.name : 'Jeyanthi (Warden)' };
    if (updates.totalStock !== undefined) updates.totalStock = Number(updates.totalStock);
    if (updates.availableStock !== undefined) updates.availableStock = Number(updates.availableStock);

    equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully.',
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete equipment (Warden only)
// @route   DELETE /api/equipment/:id
// @access  Private (Warden, Admin)
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    await Equipment.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Borrow sports equipment (Student)
// @route   POST /api/equipment/:id/borrow
// @access  Private (Student)
exports.borrowSportsEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }
    if (equipment.availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'No units currently available to borrow.' });
    }

    equipment.availableStock -= 1;
    await equipment.save();

    res.status(200).json({
      success: true,
      message: `Checked out ${equipment.name} successfully.`,
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return sports equipment
// @route   POST /api/equipment/:id/return
// @access  Private
exports.returnSportsEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    equipment.availableStock = Math.min(equipment.totalStock, equipment.availableStock + 1);
    await equipment.save();

    res.status(200).json({
      success: true,
      message: `Returned ${equipment.name} successfully.`,
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
