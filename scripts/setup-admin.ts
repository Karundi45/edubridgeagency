import { connectToDatabase } from '../src/lib/db/mongoose';
import User from '../src/lib/db/models/User';
import bcrypt from 'bcryptjs';

async function setupAdmin() {
  await connectToDatabase();
  
  const adminEmail = 'karundi2004@gmail.com';
  const adminPassword = 'kadege@1';
  
  // 1. Demote all existing admins to student (except the target email)
  const demoteRes = await User.updateMany(
    { email: { $ne: adminEmail }, role: { $in: ['admin', 'superadmin', 'editor'] } },
    { $set: { role: 'student' } }
  );
  console.log(`Demoted ${demoteRes.modifiedCount} other admins to student.`);

  // 2. Hash the new password
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  
  // 3. Find or create the admin user
  let adminUser = await User.findOne({ email: adminEmail });
  
  if (adminUser) {
    adminUser.passwordHash = passwordHash;
    adminUser.role = 'superadmin';
    await adminUser.save();
    console.log(`Updated existing user ${adminEmail} to superadmin with new password.`);
  } else {
    adminUser = await User.create({
      name: 'Admin Kadege',
      email: adminEmail,
      passwordHash,
      role: 'superadmin',
      emailVerified: true,
    });
    console.log(`Created new superadmin user ${adminEmail}.`);
  }

  process.exit(0);
}

setupAdmin().catch(console.error);
