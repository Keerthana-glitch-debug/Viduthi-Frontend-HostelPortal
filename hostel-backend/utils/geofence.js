/**
 * utils/geofence.js
 * 
 * Non-CRUD Algorithmic Service: Spherical Haversine Geofencing Engine
 * Calculates geodesic distance between user device GPS coordinates and
 * Vidudhi Hostel perimeter reference point (13.0827° N, 80.2707° E).
 */

const HOSTEL_DEFAULT_LAT = parseFloat(process.env.HOSTEL_LAT || '13.0827');
const HOSTEL_DEFAULT_LNG = parseFloat(process.env.HOSTEL_LNG || '80.2707');
const GEOFENCE_DEFAULT_RADIUS = parseFloat(process.env.GEOFENCE_RADIUS_METERS || '300');

/**
 * Calculates geodesic distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in meters rounded to 2 decimal places
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's mean radius in meters
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Verifies if a given device GPS coordinate falls within the approved hostel perimeter.
 * @param {number} userLat Device latitude
 * @param {number} userLng Device longitude
 * @param {number} [customRadius] Optional custom radius override in meters
 * @returns {Object} Geofence validation result with mathematical metadata
 */
function verifyCampusGeofence(userLat, userLng, customRadius = GEOFENCE_DEFAULT_RADIUS) {
  if (typeof userLat !== 'number' || typeof userLng !== 'number') {
    throw new Error('Valid numerical latitude and longitude coordinates are required.');
  }

  const distanceMeters = calculateHaversineDistance(
    userLat,
    userLng,
    HOSTEL_DEFAULT_LAT,
    HOSTEL_DEFAULT_LNG
  );

  const isInside = distanceMeters <= customRadius;

  return {
    isInside,
    distanceMeters,
    allowedRadiusMeters: customRadius,
    hostelCoordinates: {
      lat: HOSTEL_DEFAULT_LAT,
      lng: HOSTEL_DEFAULT_LNG,
    },
    userCoordinates: {
      lat: userLat,
      lng: userLng,
    },
    accuracyBuffer: 15, // 15 meters GPS jitter margin
    boundaryMargin: Math.round((customRadius - distanceMeters) * 100) / 100,
  };
}

module.exports = {
  calculateHaversineDistance,
  verifyCampusGeofence,
  HOSTEL_DEFAULT_LAT,
  HOSTEL_DEFAULT_LNG,
  GEOFENCE_DEFAULT_RADIUS,
};
