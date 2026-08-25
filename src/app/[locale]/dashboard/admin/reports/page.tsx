import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Report from '@/lib/db/models/Report';
import { notFound } from 'next/navigation';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function AdminReportsPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();

  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .populate('opportunityId', 'title.en slug')
    .populate('jobId', 'title.en slug')
    .lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">User Reports</h1>
        <p className="text-text-muted text-sm mt-1">Review flagged opportunities, broken links, and expired posts.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Target Opportunity</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.length > 0 ? reports.map((report: any) => {
                const user = report.userId;
                const opportunity = report.opportunityId;
                const job = report.jobId;
                
                return (
                  <tr key={report._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">{user?.name || 'Anonymous User'}</div>
                      <div className="text-xs text-text-muted">{user?.email || 'N/A'}</div>
                      <div className="text-xs text-slate-400 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-text">
                      {opportunity ? (
                        <Link href={`/scholarships/${opportunity.slug}`} target="_blank" className="text-primary hover:underline">
                          {opportunity.title?.en || 'View Post'} (Scholarship)
                        </Link>
                      ) : job ? (
                        <Link href={`/jobs/${job.slug}`} target="_blank" className="text-amber-600 hover:underline">
                          {job.title?.en || 'View Post'} (Job)
                        </Link>
                      ) : (
                        <span className="text-text-muted">Item Deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold capitalize text-slate-700">{report.reason.replace('_', ' ')}</div>
                      {report.description && (
                        <div className="text-xs text-text-muted mt-1 max-w-xs truncate">{report.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        report.status === 'rejected' ? 'bg-slate-100 text-slate-700' :
                        report.status === 'investigating' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status !== 'resolved' && (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 mr-2">
                          <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    No reports submitted yet.
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
