const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function inspectVidudhi() {
  const uri = 'mongodb+srv://keerthana:keer@cluster0.92rctps.mongodb.net/vidudhi?retryWrites=true&w=majority';
  const conn = await mongoose.connect(uri);
  console.log('--- SAMPLE USERS IN ATLAS VIDUDHI ---');
  const users = await conn.connection.db.collection('users').find().toArray();
  console.log(users);
  await mongoose.connection.close();
}

inspectVidudhi();
