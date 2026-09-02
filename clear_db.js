require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log("Deleting all jobs...");
  const jobsResult = await db.collection('jobs').deleteMany({});
  console.log(`Deleted ${jobsResult.deletedCount} jobs.`);
  
  console.log("Deleting all opportunities (scholarships)...");
  const oppsResult = await db.collection('opportunities').deleteMany({});
  console.log(`Deleted ${oppsResult.deletedCount} opportunities.`);
  
  process.exit(0);
}).catch(err => {
  console.error("Database connection failed:", err);
  process.exit(1);
});
