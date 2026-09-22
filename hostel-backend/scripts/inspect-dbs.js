const mongoose = require('mongoose');

async function inspect() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017');
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const dbs = await admin.listDatabases();
    console.log('--- DATABASES ON LOCAL MONGODB ---');
    for (const d of dbs.databases) {
      const db = mongoose.connection.useDb(d.name);
      const cols = await db.db.listCollections().toArray();
      console.log(`Database: ${d.name} (${cols.length} collections)`);
      for (const c of cols) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`   - ${c.name}: ${count} documents`);
      }
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error('Inspect error:', err.message);
  }
}

inspect();
