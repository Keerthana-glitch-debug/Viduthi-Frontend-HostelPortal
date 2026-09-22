const express = require('express');
const router = express.Router();
const { runSimulation, getScenarios } = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/scenarios', getScenarios);
router.post('/forecast', protect, runSimulation);

module.exports = router;
