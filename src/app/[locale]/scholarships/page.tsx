import { getTranslations } from 'next-intl/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ScholarshipFilters } from '@/components/scholarships/ScholarshipFilters';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Search } from 'lucide-react';
import type { IOpportunity } from '@/types';

export const metadata = {
  title: 'Find Scholarships',
  description: 'Search and filter thousands of verified scholarships for international students.',
};

export default async function ScholarshipsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations('scholarships');
  
  await connectToDatabase();

  const page = Math.max(1, parseInt(searchParams.page as string || '1'));
  const pageSize = 12;
  const query = searchParams.query as string || '';
  
  // Build filter query from URL params
  const filter: Record<string, any> = { status: 'published' };
  
  if (query) {
    filter.$text = { $search: query };
  }
  
  ['type', 'degree', 'field', 'country', 'fundingType'].forEach(key => {
    const val = searchParams[key];
    if (val) {
      filter[key] = { $in: Array.isArray(val) ? val : [val] };
    }
  });

  const skip = (page - 1) * pageSize;
  
  // Sort
  const sortBy = searchParams.sortBy as string || 'newest';
  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    deadline: { deadline: 1 },
    views: { 'metrics.views': -1 },
    saves: { 'metrics.saves': -1 },
    recommended: { isFeatured: -1, 'verification.status': -1, createdAt: -1 }
  };

  const [docs, totalCount] = await Promise.all([
    Opportunity.find(filter)
      .sort(sortMap[sortBy] || sortMap.newest)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Opportunity.countDocuments(filter)
  ]);
  
  // Convert ObjectIds to strings
  const opportunities = JSON.parse(JSON.stringify(docs));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-surface-alt pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Search */}
          <div className="bg-primary rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
            
            <h1 className="heading-2 mb-2 relative z-10">{t('title')}</h1>
            <p className="text-blue-100 mb-6 relative z-10">{t('subtitle')}</p>
            
            <form className="relative max-w-2xl z-10" action="/scholarships" method="GET">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-text-muted" />
                <input 
                  type="text" 
                  name="query"
                  defaultValue={query}
                  placeholder={t('searchLabel')}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
                />
                <button type="submit" className="absolute right-2 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors">
                  Search
                </button>
              </div>
              
              {/* Preserve other filters as hidden inputs */}
              {Object.entries(searchParams).map(([k, v]) => {
                if (k === 'query' || k === 'page') return null;
                if (Array.isArray(v)) {
                  return v.map(val => <input key={`${k}-${val}`} type="hidden" name={k} value={val} />);
                }
                return <input key={k} type="hidden" name={k} value={v} />;
              })}
            </form>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-border p-4 sticky top-24">
                <ScholarshipFilters />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-sm font-medium text-text-secondary">
                  {t('resultsCount', { count: totalCount, plural: totalCount === 1 ? '' : 's' })}
                </p>
                
                {/* Sort Dropdown */}
                <form action="/scholarships" method="GET" className="flex items-center gap-2">
                  {/* Hidden inputs to preserve state */}
                  {Object.entries(searchParams).map(([k, v]) => {
                    if (k === 'sortBy') return null;
                    if (Array.isArray(v)) {
                      return v.map(val => <input key={`${k}-${val}`} type="hidden" name={k} value={val} />);
                    }
                    return <input key={k} type="hidden" name={k} value={v} />;
                  })}
                  
                  <label htmlFor="sortBy" className="text-sm text-text-muted">{t('sort.label')}</label>
                  <select 
                    id="sortBy"
                    name="sortBy" 
                    defaultValue={sortBy}
                    className="text-sm bg-white border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="newest">{t('sort.newest')}</option>
                    <option value="deadline">{t('sort.deadline')}</option>
                    <option value="recommended">{t('sort.recommended')}</option>
                    <option value="views">{t('sort.views')}</option>
                  </select>
                  <button type="submit" className="text-xs bg-surface-alt border border-border px-2.5 py-1.5 rounded-lg font-medium hover:bg-border transition-colors">
                    Sort
                  </button>
                </form>
              </div>

              {opportunities.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                      <ScholarshipCard 
                        key={opp._id.toString()} 
                        opportunity={opp} 
                        featured={opp.isFeatured}
                      />
                    ))}
                  </div>
                  
                  <Pagination currentPage={page} totalPages={totalPages} />
                </>
              ) : (
                <EmptyState 
                  title={t('noResults')}
                  description={t('noResultsDesc')}
                  icon="search"
                  actionLabel={t('clearFilters')}
                  actionHref="/scholarships"
                />
              )}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
