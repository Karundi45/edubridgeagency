import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Application from '@/lib/db/models/Application';
import Opportunity from '@/lib/db/models/Opportunity';
import Job from '@/lib/db/models/Job';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import { Search, GraduationCap, Building2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function AdminApplicationsPage({ searchParams }: { searchParams: { query?: string } }) {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();

  const applications = await Application.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name email image')
    .populate('opportunityId', 'title')
    .populate('jobId', 'title company')
    .lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Application Tracker (Admin)</h1>
          <p className="text-text-muted text-sm mt-1">Monitor all user applications across scholarships and jobs.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Applied For</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Tracked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length > 0 ? applications.map((app: any) => {
                const user = app.userId;
                const opportunity = app.opportunityId;
                const job = app.jobId;
                
                return (
                  <tr key={app._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          {user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                          ) : <UserCircle className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <div className="font-medium text-text">{user?.name || 'Unknown User'}</div>
                          <div className="text-xs text-text-muted">{user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-text">
                      {opportunity ? (
                        opportunity.title?.en || 'Unknown Scholarship'
                      ) : job ? (
                        <div className="flex flex-col">
                          <span>{job.title?.en || 'Unknown Job'}</span>
                          <span className="text-xs text-primary font-normal">{job.company}</span>
                        </div>
                      ) : 'Item Deleted'}
                    </td>
                    <td className="px-6 py-4">
                      {opportunity ? (
                        <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          <GraduationCap className="w-3.5 h-3.5 mr-1" /> Scholarship
                        </span>
                      ) : job ? (
                        <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                          <Building2 className="w-3.5 h-3.5 mr-1" /> Job
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No applications tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
