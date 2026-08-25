import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import { UserCircle, Mail, ShieldAlert } from 'lucide-react';

export default async function AdminUsersPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();

  const users = await User.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Manage Users</h1>
        <p className="text-text-muted text-sm mt-1">View and manage registered students and platform users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user: any) => (
                <tr key={user._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                        ) : <UserCircle className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div>
                        <div className="font-bold text-text">{user.name}</div>
                        <div className="text-xs text-text-muted flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.suspended ? (
                      <span className="inline-flex items-center text-red-600 font-medium text-xs">
                        <ShieldAlert className="w-4 h-4 mr-1" /> Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium text-xs">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
