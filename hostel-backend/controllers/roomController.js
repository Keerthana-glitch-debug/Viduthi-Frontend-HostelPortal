const Room = require('../models/Room');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get All Rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const { block, floor, status } = req.query;
    const filter = {};
    if (block) filter.block = block;
    if (floor) filter.floor = Number(floor);
    if (status) filter.status = status;

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Room Details
// @route   GET /api/rooms/:roomNumber
// @access  Private
exports.getRoomByNumber = async (req, res) => {
  try {
    const room = await Room.findOne({ roomNumber: req.params.roomNumber });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (req.user) {
      await recordActivity({
        user: req.user,
        action: 'VIEWED_ROOM',
        resourceType: 'room',
        resourceId: room._id.toString(),
        title: `Inspected Room ${room.roomNumber} (${room.block})`,
        route: `/app/rooms?search=${room.roomNumber}`,
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
