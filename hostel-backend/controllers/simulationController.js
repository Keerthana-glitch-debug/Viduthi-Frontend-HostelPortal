const { runOperationalSimulation, PRESET_SCENARIOS } = require('../utils/simulationAlgorithm');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Run What-If Operational Simulation
// @route   POST /api/simulation/forecast
// @access  Private (Warden, Admin, Student)
exports.runSimulation = async (req, res) => {
  try {
    const simulationResult = runOperationalSimulation(req.body);

    if (req.user) {
      await recordActivity({
        user: req.user,
        action: 'RUN_SIMULATION',
        resourceType: 'simulation',
        title: `Simulation Run: ${simulationResult.scenario}`,
        route: '/app/simulation',
        metadata: {
          scenario: simulationResult.scenario,
          waterBurnRate: simulationResult.projectedMetrics.water.hourlyBurnRateLiters,
          contingencyINR: simulationResult.projectedMetrics.financialSummary.estimatedTotalContingencyINR,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: simulationResult,
    });
  } catch (error) {
    console.error('[Simulation Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Available Simulation Preset Scenarios
// @route   GET /api/simulation/scenarios
// @access  Public
exports.getScenarios = (req, res) => {
  res.status(200).json({
    success: true,
    scenarios: PRESET_SCENARIOS,
  });
};
