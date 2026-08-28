require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const jobs = await db.collection('jobs').find({}).toArray();
  console.log(JSON.stringify(jobs, null, 2));
  process.exit(0);
});
