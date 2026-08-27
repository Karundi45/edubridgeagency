import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Search, GraduationCap, Globe, ChevronRight, ShieldCheck, Zap, Briefcase } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TrendingMarquee } from '@/components/home/TrendingMarquee';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import Job from '@/lib/db/models/Job';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';

export default async function Home() {
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  
  await connectToDatabase();
  
  // Fetch featured opportunities (Scholarships)
  const docs = await Opportunity.find({ 
    status: 'published', 
    isFeatured: true,
    $or: [{ deadline: { $gte: new Date() } }, { deadline: null }]
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  // Fetch featured Jobs
  const jobDocs = await Job.find({ 
    status: 'published', 
    isFeatured: true,
    $or: [{ deadline: { $gte: new Date() } }, { deadline: null }]
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  const trendingDocs = await Opportunity.find({ 
    status: 'published' 
  })
  .sort({ 'metrics.views': -1, createdAt: -1 })
  .limit(8)
  .lean();

  // Convert ObjectIds and Dates to strings
  const featuredOpportunities = JSON.parse(JSON.stringify(docs));
  const featuredJobs = JSON.parse(JSON.stringify(jobDocs));
  const trendingOpportunities = JSON.parse(JSON.stringify(trendingDocs));

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-blue-950">
            <Image 
              src="/hero-bg.png"
              alt="Hero Background"
              fill
              priority
              className="object-cover object-center animate-slow-zoom"
            />
          </div>
          {/* Removed Overlay as per user request */}
          
          <div className="max-w-7xl mx-auto relative z-20 text-center drop-shadow-md">
            <h1 className="heading-1 mb-6 max-w-4xl mx-auto animate-fade-in-up">
              {t('hero.headline')}
            </h1>
            <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('hero.subheadline')}
            </p>
            
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 flex items-center shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 flex items-center pl-4">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
              <Button size="lg" className="rounded-xl px-4 sm:px-8 shrink-0">
                <span className="hidden sm:inline">{tCommon('search')}</span>
                <Search className="w-5 h-5 sm:hidden" />
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-blue-200 font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-light" />
                {t('hero.trust2')}
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gold-light" />
                {t('hero.trust1')}
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-300" />
                {t('hero.trust3')}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Scholarships */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="heading-2 text-text">{t('featured.title')}</h2>
                <p className="text-text-muted mt-2">{t('featured.subtitle')}</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/scholarships">{t('featured.viewAll')} <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>

            {featuredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredOpportunities.map((opp: any) => (
                  <ScholarshipCard key={opp._id.toString()} opportunity={opp} featured={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-alt rounded-2xl">
                <p className="text-text-muted">No featured scholarships available right now.</p>
              </div>
            )}
            
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild className="w-full">
                <Link href="/scholarships">{t('featured.viewAll')}</Link>
              </Button>
            </div>
          </div>
          
          {/* Featured Jobs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="heading-2 text-text">Featured Jobs in Rwanda</h2>
                <p className="text-text-muted mt-2 text-lg">Top career opportunities from trusted organizations.</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/jobs">View All Jobs <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>

            {featuredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job: any) => (
                  <Link key={job._id.toString()} href={`/jobs/${job.slug}`} className="group bg-white rounded-2xl shadow-sm border border-border p-6 hover:border-primary hover:shadow-md transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {job.companyLogo ? (
                           // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.companyLogo} alt={job.company} className="w-8 h-8 object-contain" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider shrink-0">
                        Featured
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors mb-1 line-clamp-2">
                      {job.title?.en}
                    </h3>
                    <p className="text-primary font-medium mb-4">{job.company}</p>
                    
                    <div className="mt-auto pt-4 border-t border-border flex flex-wrap gap-3 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {job.location}</span>
                      {job.salary && <span className="flex items-center gap-1.5 text-green-600 font-medium"><Zap className="w-4 h-4" /> {job.salary}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-alt rounded-2xl">
                <p className="text-text-muted">No featured jobs available right now.</p>
              </div>
            )}
            
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild className="w-full">
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trending & Recently Updated Scholarships (Marquee) */}
        {trendingOpportunities.length > 0 && (
          <section className="py-12 bg-white overflow-hidden border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
                <h2 className="text-xl font-bold text-text">Trending & Updated Opportunities</h2>
              </div>
            </div>
            
            <TrendingMarquee opportunities={trendingOpportunities} />
          </section>
        )}

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-alt">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="heading-2 text-text mb-2">{t('howItWorks.title')}</h2>
            <p className="text-text-muted mb-16">{t('howItWorks.subtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative max-w-4xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[25%] right-[25%] h-0.5 bg-border-strong border-dashed border-t-2 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center mb-6 text-primary">
                  <span className="text-3xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{t('howItWorks.step1Title')}</h3>
                <p className="text-sm text-text-muted">{t('howItWorks.step1Desc')}</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center mb-6 text-accent">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-bold text-text mb-2">{t('howItWorks.step2Title')}</h3>
                <p className="text-sm text-text-muted">{t('howItWorks.step2Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden relative shadow-xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent opacity-20 rounded-full blur-3xl"></div>
            
            <h2 className="heading-2 mb-6 relative z-10">Ready to start your journey?</h2>
            <p className="text-blue-100 mb-10 text-lg relative z-10 max-w-2xl mx-auto">
              Create your free account today to get personalized scholarship recommendations and track your applications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Button size="xl" variant="white" asChild>
                <Link href="/scholarships">Browse Scholarships</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
