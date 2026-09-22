const MessMenu = require('../models/MessMenu');

// @desc    Get complete 7-day mess menu
// @route   GET /api/mess/menu
// @access  Public / Private
exports.getMessMenu = async (req, res) => {
  try {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menus = await MessMenu.find({});
    // Sort by day order
    menus.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update day menu (Mess Manager Mrs. Muthumari & Warden)
// @route   PUT /api/mess/menu/:day
// @access  Private (mess_manager, warden, admin)
exports.updateDayMenu = async (req, res) => {
  try {
    const { day } = req.params;
    const { breakfast, lunch, snacksWeek1, snacksWeek2, dinner, lunchSpecial, dietType } = req.body;

    let dayMenu = await MessMenu.findOne({ day });
    if (!dayMenu) {
      dayMenu = await MessMenu.create({
        day,
        breakfast,
        lunch,
        snacksWeek1,
        snacksWeek2,
        dinner,
        lunchSpecial: lunchSpecial || '',
        dietType: dietType || 'South Indian Veg / Non-Veg Optional',
        updatedBy: req.user ? req.user.name : 'Mrs. Muthumari (Mess Supervisor)',
      });
    } else {
      dayMenu = await MessMenu.findOneAndUpdate(
        { day },
        {
          ...req.body,
          updatedBy: req.user ? req.user.name : 'Mrs. Muthumari (Mess Supervisor)',
        },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `${day} menu updated successfully.`,
      data: dayMenu,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
