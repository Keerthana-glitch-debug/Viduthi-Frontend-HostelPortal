/**
 * utils/simulationAlgorithm.js
 * 
 * Non-CRUD Algorithmic Service: What-If Capacity & Resource Simulator Engine
 * Implements discrete numerical modelling for campus resources:
 * - Water reserve drawdown curves and time-to-depletion
 * - Electrical grid demand, diesel generator runtime & fuel consumption
 * - Dining hall food stockout vs. waste probability
 * - Dynamic warden contingency checklists with estimated cost impacts
 */

const PRESET_SCENARIOS = {
  EXAM_PREP: {
    name: 'Final Semester Examination Week',
    description: 'Hostel density increases to 98% as residents stay back to prepare for university finals.',
    residentMultiplier: 0.98,
    studyHoursExtension: 4.5,
    powerLoadMultiplier: 1.35,
    waterPerCapitaLiters: 140,
    messTurnoutPct: 96,
  },
  MONSOON_FLOOD: {
    name: 'Severe Monsoon / Cyclone Alert',
    description: 'Heavy rainfall in Chennai; municipal supply interrupted, 100% residents confined to blocks.',
    residentMultiplier: 1.0,
    studyHoursExtension: 0,
    powerLoadMultiplier: 0.85,
    waterPerCapitaLiters: 120,
    municipalSupplyInterrupted: true,
    messTurnoutPct: 99,
  },
  FESTIVAL_EXODUS: {
    name: 'Long Holiday / Pongal Exodus',
    description: 'Over 65% of students travel back home on approved outpasses.',
    residentMultiplier: 0.35,
    studyHoursExtension: 0,
    powerLoadMultiplier: 0.45,
    waterPerCapitaLiters: 110,
    messTurnoutPct: 32,
  },
  SUMMER_HEATWAVE: {
    name: 'Peak Summer Heatwave (41°C)',
    description: 'Extreme temperatures in Chennai trigger air cooler and hydration load spikes.',
    residentMultiplier: 0.90,
    studyHoursExtension: 1.5,
    powerLoadMultiplier: 1.60,
    waterPerCapitaLiters: 175,
    messTurnoutPct: 88,
  },
};

/**
 * Runs the operational simulation model given parameters.
 */
function runOperationalSimulation({
  totalCapacity = 500,
  occupancyPercent = 90,
  scenarioKey = 'EXAM_PREP',
  customPowerCutHours = 2,
  reservoirCapacityLiters = 75000,
  currentReservoirLiters = 55000,
  dieselPricePerLiter = 94,
  foodCostPerMeal = 55,
}) {
  const preset = PRESET_SCENARIOS[scenarioKey] || PRESET_SCENARIOS.EXAM_PREP;
  const simulatedResidents = Math.round(totalCapacity * (occupancyPercent / 100) * preset.residentMultiplier);

  // 1. Water Drawdown Modelling
  const dailyWaterConsumptionLiters = simulatedResidents * preset.waterPerCapitaLiters;
  const hourlyWaterBurnRate = Math.round(dailyWaterConsumptionLiters / 16); // 16 waking hours
  const municipalReplenishmentLiters = preset.municipalSupplyInterrupted ? 0 : 25000;
  const netHourlyDepletion = Math.max(0, hourlyWaterBurnRate - (municipalReplenishmentLiters / 16));
  const hoursUntilDry = netHourlyDepletion > 0 
    ? Math.round((currentReservoirLiters / netHourlyDepletion) * 10) / 10 
    : 99.9;

  // 2. Electrical Grid & Generator Fuel Simulation
  const baseKWPerResident = 0.38; // Laptop, lights, fans
  const peakGridDemandKW = Math.round(simulatedResidents * baseKWPerResident * preset.powerLoadMultiplier * 10) / 10;
  // Diesel generator burns approx 0.28 L per kWh delivered
  const generatorHourlyBurnLiters = Math.round(peakGridDemandKW * 0.28 * 10) / 10;
  const totalFuelLitersNeeded = Math.round(generatorHourlyBurnLiters * customPowerCutHours * 10) / 10;
  const totalPowerCostINR = Math.round(totalFuelLitersNeeded * dieselPricePerLiter);

  // 3. Dining Hall Buffer & Stockout Risk
  const expectedMealsPerDay = Math.round(simulatedResidents * (preset.messTurnoutPct / 100) * 3);
  const plannedMeals = Math.round(totalCapacity * (occupancyPercent / 100) * 0.90 * 3);
  const foodDelta = expectedMealsPerDay - plannedMeals;
  const stockoutRiskScore = foodDelta > 0 
    ? Math.min(100, Math.round((foodDelta / plannedMeals) * 100 * 2.5)) 
    : 0;
  const wasteRiskScore = foodDelta < 0 
    ? Math.min(100, Math.round((Math.abs(foodDelta) / plannedMeals) * 100 * 2)) 
    : 0;
  const estimatedFoodFinancialImpactINR = Math.abs(foodDelta) * foodCostPerMeal;

  // 4. Warden Contingency Checklists
  const actionChecklist = [];
  if (hoursUntilDry < 14) {
    actionChecklist.push({
      priority: 'CRITICAL',
      title: 'Emergency Tanker Procurement',
      action: `Order 2x 12,000L private Chennai MetroWater tankers immediately. Current reserve will deplete in ${hoursUntilDry}h.`,
      estimatedCost: 3800,
    });
  }
  if (customPowerCutHours >= 3) {
    actionChecklist.push({
      priority: 'HIGH',
      title: 'DG Diesel Reserve Dispatch',
      action: `Top up DG tank with at least ${Math.ceil(totalFuelLitersNeeded * 1.2)}L diesel before 18:00 to prevent study hall blackouts.`,
      estimatedCost: Math.round(totalFuelLitersNeeded * 1.2 * dieselPricePerLiter),
    });
  }
  if (stockoutRiskScore > 25) {
    actionChecklist.push({
      priority: 'HIGH',
      title: 'Mess Ingredient Buffer Alert',
      action: `Resident dinner turnout surge detected (+${foodDelta} extra plates). Notify dining staff to prepare express batch.`,
      estimatedCost: estimatedFoodFinancialImpactINR,
    });
  } else if (wasteRiskScore > 30) {
    actionChecklist.push({
      priority: 'MEDIUM',
      title: 'Food Waste Mitigation Plan',
      action: `Dining hall headcount deficit (-${Math.abs(foodDelta)} meals). Scale down evening batch cooking to avoid spoiling.`,
      estimatedCost: 0,
    });
  }
  actionChecklist.push({
    priority: 'ROUTINE',
    title: 'Curfew & Biometric Geofence Sync',
    action: `Synchronize GPS gate turnstiles for ${simulatedResidents} expected residents tonight.`,
    estimatedCost: 0,
  });

  return {
    scenario: preset.name,
    scenarioDescription: preset.description,
    inputs: {
      totalCapacity,
      occupancyPercent,
      scenarioKey,
      customPowerCutHours,
      currentReservoirLiters,
    },
    projectedMetrics: {
      activeResidents: simulatedResidents,
      water: {
        dailyUsageLiters: dailyWaterConsumptionLiters,
        hourlyBurnRateLiters: hourlyWaterBurnRate,
        hoursUntilDepletion: hoursUntilDry,
        status: hoursUntilDry < 12 ? 'CRITICAL_SHORTAGE' : hoursUntilDry < 24 ? 'CAUTION' : 'STABLE',
      },
      electricity: {
        peakDemandKW: peakGridDemandKW,
        generatorFuelLiters: totalFuelLitersNeeded,
        emergencyPowerCostINR: totalPowerCostINR,
      },
      dining: {
        expectedMealsPerDay,
        stockoutRiskPercent: stockoutRiskScore,
        wasteRiskPercent: wasteRiskScore,
        variancePlates: foodDelta,
      },
      financialSummary: {
        emergencyDieselCostINR: totalPowerCostINR,
        waterEmergencyCostINR: hoursUntilDry < 14 ? 3800 : 0,
        estimatedTotalContingencyINR: totalPowerCostINR + (hoursUntilDry < 14 ? 3800 : 0) + (stockoutRiskScore > 25 ? estimatedFoodFinancialImpactINR : 0),
      },
    },
    actionChecklist,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  PRESET_SCENARIOS,
  runOperationalSimulation,
};
