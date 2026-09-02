import { getTranslations } from 'next-intl/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Job from '@/lib/db/models/Job';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Briefcase, Calendar } from 'lucide-react';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';
import { JobFiltersSidebar } from '@/components/jobs/JobFiltersSidebar';

export default async function JobsPage(props: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations('common');
  
  await connectToDatabase();
  
  const matchQuery: Record<string, any> = {
    status: 'published'
  };
  
  // Apply Search Query
  const query = searchParams.q as string;
  if (query) {
    matchQuery.$text = { $search: query };
  }
  
  // Apply Location/Province Filter
  const locations = searchParams.location;
  if (locations) {
    const locArray = Array.isArray(locations) ? locations : [locations];
    // We check both province and location fields since users might search for either
    matchQuery.$or = [
      { province: { $in: locArray } },
      { location: { $in: locArray } }
    ];
  }
  
  // Apply Employment Type Filter
  const types = searchParams.type;
  if (types) {
    const typeArray = Array.isArray(types) ? types : [types];
    matchQuery.employmentType = { $in: typeArray };
  }
  
  try {
    const jobsDocs = await Job.find(matchQuery).sort({ isFeatured: -1, createdAt: -1 }).lean();
    const jobs = JSON.parse(JSON.stringify(jobsDocs));
    
    return (
      <div className="min-h-screen bg-surface-alt">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4 relative overflow-hidden">
        <Image src="/hero-bg.jpg" alt="Background" fill unoptimized={true} className="object-cover object-center opacity-30 mix-blend-overlay z-0" />
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold">Jobs in Rwanda</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Discover career opportunities from top companies, NGOs, and organizations in Rwanda.
          </p>
          
          <JobSearchBar />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <JobFiltersSidebar />

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
