import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function AdminJobsPage({ searchParams }: { searchParams: { query?: string } }) {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();

  const query = searchParams.query || '';
  const filter: any = {};
  if (query) {
    filter.$text = { $search: query };
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Manage Jobs</h1>
          <p className="text-text-muted text-sm mt-1">Create, edit, and publish job opportunities in Rwanda.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/jobs/new">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50">
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              name="query"
              defaultValue={query}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company & Location</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length > 0 ? jobs.map((job: any) => {
                const isExpired = job.deadline && new Date(job.deadline) < new Date();
                const displayStatus = isExpired ? 'expired' : job.status;
                
                return (
                  <tr key={job._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text">
                      {job.title?.en}
                      {job.isFeatured && <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase font-bold">Featured</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text">{job.company}</div>
                      <div className="text-text-muted text-xs">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        displayStatus === 'published' ? 'bg-green-100 text-green-700' :
                        displayStatus === 'draft' ? 'bg-slate-100 text-slate-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {displayStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/admin/jobs/${job._id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No jobs found. Click "Post New Job" to create one.
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
