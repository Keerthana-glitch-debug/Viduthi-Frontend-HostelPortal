const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix Windows SRV DNS resolution for MongoDB Atlas
const mongoose = require('mongoose');

async function testAtlas() {
  const uri = 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/keerthana?retryWrites=true&w=majority';
  console.log('Testing Atlas connection with username: keerthana...');
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS! Connected to Atlas cluster:', conn.connection.host);
    const cols = await conn.connection.db.listCollections().toArray();
    console.log('Collections in Atlas:', cols.map(c => c.name));
    await mongoose.connection.close();
  } catch (err) {
    console.error('Atlas connection error:', err.message);
  }
}

testAtlas();
