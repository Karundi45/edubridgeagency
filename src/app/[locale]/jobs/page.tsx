import { getTranslations } from 'next-intl/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import Link from 'next/link';
import { MapPin, Briefcase, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function JobsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations('common');
  
  await connectToDatabase();
  
  // Fetch all published jobs (we can show expired badge on the UI instead of hiding them completely)
  const matchQuery = {
    status: 'published'
  };
  
  try {
    const jobsDocs = await Job.find(matchQuery).sort({ isFeatured: -1, createdAt: -1 }).lean();
    const jobs = JSON.parse(JSON.stringify(jobsDocs));
    
    // Test if jobs mapping throws
    jobs.map((job: any) => {
      const type = job.employmentType?.join(', ') || 'Full-time';
      const title = job.title?.[locale as 'en' | 'fr'] || job.title?.en;
    });

    return (
      <div className="min-h-screen bg-surface-alt">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Jobs in Rwanda</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover career opportunities from top companies, NGOs, and organizations in Rwanda.
          </p>
          
          <div className="max-w-3xl mx-auto mt-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search job titles, companies, or keywords..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-900 border-none focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <Button size="lg" className="px-8 rounded-xl bg-accent text-white hover:bg-accent-dark">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
            <h3 className="font-bold text-lg mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-text-muted mb-2">Location</h4>
                <div className="space-y-2">
                  {['Kigali', 'Remote', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'].map(loc => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-text-muted mb-2">Employment Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{jobs.length} Opportunities Found</h2>
          </div>
          
          {jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job: any) => (
                <Link key={job._id.toString()} href={`/jobs/${job.slug}`} className="block group">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start">
                    
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      {job.companyLogo ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={job.companyLogo} alt={job.company} className="w-12 h-12 object-contain" />
                      ) : (
                        <Briefcase className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors truncate">
                            {job.title?.[locale as 'en' | 'fr'] || job.title?.en}
                          </h3>
                          <p className="text-primary font-medium mt-1">{job.company}</p>
                        </div>
                        {job.isFeatured && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.employmentType?.join(', ') || 'Full-time'}</span>
                        </div>
                        {job.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-border text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Jobs Found</h3>
              <p className="text-text-muted max-w-md mx-auto">
                We couldn't find any job opportunities matching your criteria at the moment. Please check back later.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
  } catch (error) { 
    console.error("REAL ERROR:", error); 
    return <div className="p-20 text-center text-red-500">Error loading jobs. Check server console for the real error!</div>; 
  }
}
