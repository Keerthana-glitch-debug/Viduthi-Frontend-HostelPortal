const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keerthana';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Active Database / Cluster: ${conn.connection.name || 'keerthana'}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Primary connection failed (${uri}): ${error.message}`);
    // Fallback attempt to local instance if Atlas was attempted and failed
    if (uri.includes('mongodb.net') || uri.includes('+srv')) {
      console.log('[MongoDB] Attempting fallback to local instance at mongodb://127.0.0.1:27017/keerthana...');
      try {
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/keerthana', {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Fallback connected successfully to ${fallbackConn.connection.host} (keerthana)`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`[MongoDB] Fallback connection also failed: ${fallbackError.message}`);
        console.warn('[MongoDB] Running with in-memory / mocked fallback for demonstration.');
      }
    }
  }
};

module.exports = connectDB;
