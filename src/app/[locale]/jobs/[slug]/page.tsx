import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import Link from 'next/link';
import { MapPin, Briefcase, Calendar, ChevronLeft, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReportButton } from '@/components/common/ReportButton';

export default async function JobDetailPage({ params }: { params: { slug: string; locale: string } }) {
  await connectToDatabase();
  
  const job = await Job.findOne({ slug: params.slug }).lean();
  
  if (!job) {
    return notFound();
  }

  const title = job.title?.[params.locale as 'en' | 'fr'] || job.title?.en;
  const description = job.description?.[params.locale as 'en' | 'fr'] || job.description?.en;
  const instructions = job.applicationInstructions?.[params.locale as 'en' | 'fr'] || job.applicationInstructions?.en;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div className="min-h-screen bg-surface-alt py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Link */}
        <Link href="/jobs" className="inline-flex items-center text-text-muted hover:text-primary transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Jobs
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border mb-8 relative overflow-hidden">
          {isExpired && (
             <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-2xl font-bold tracking-wide">
               EXPIRED
             </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
              {job.companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.companyLogo} alt={job.company} className="w-16 h-16 object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-300" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">{title}</h1>
              <div className="text-xl text-primary font-medium mb-6">{job.company}</div>
              
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">{job.employmentType.join(', ')}</span>
                </div>
                {job.deadline && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isExpired ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100'}`}>
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-6">Job Description</h2>
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
              
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Key Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    {job.responsibilities.map((req: string, i: number) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
              
              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    {job.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-6">How to Apply</h2>
              <div className="prose prose-slate max-w-none mb-6" dangerouslySetInnerHTML={{ __html: instructions }} />
              
              <div className="flex flex-col sm:flex-row gap-4">
                {job.applicationUrl && (
                  <Button size="lg" className="flex-1 text-base h-14" asChild disabled={isExpired}>
                    <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply on Official Website <ExternalLink className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                )}
                {job.applicationEmail && (
                  <Button variant="outline" size="lg" className="flex-1 text-base h-14" asChild disabled={isExpired}>
                    <a href={`mailto:${job.applicationEmail}`}>
                      Apply via Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-6">Job Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Company</p>
                  <p className="font-medium">{job.company}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Category</p>
                  <p className="font-medium">{job.category.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Experience Level</p>
                  <p className="font-medium capitalize">{job.experienceLevel.replace('_', ' ')}</p>
                </div>
                {job.salary && (
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Salary</p>
                    <p className="font-medium text-green-600">{job.salary}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mt-4">
              <ReportButton jobId={job._id.toString()} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
