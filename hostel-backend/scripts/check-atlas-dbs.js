const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function checkAllDatabasesInAtlas() {
  const uri = 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/?retryWrites=true&w=majority';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const admin = new mongoose.mongo.Admin(conn.connection.db);
    const dbs = await admin.listDatabases();
    console.log('--- ALL DATABASES IN USER ATLAS CLUSTER ---');
    for (const d of dbs.databases) {
      const db = conn.connection.useDb(d.name);
      const cols = await db.db.listCollections().toArray();
      console.log(`Database: ${d.name} (${cols.length} collections)`);
      for (const c of cols) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`   - ${c.name}: ${count} docs`);
      }
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkAllDatabasesInAtlas();
