import { connectToDatabase } from '../src/lib/db/mongoose';
import User from '../src/lib/db/models/User';

async function makeAdmin() {
  await connectToDatabase();
  const res = await User.updateMany({}, { role: 'admin' });
  console.log('Updated users to admin:', res);
  process.exit(0);
}
makeAdmin();
