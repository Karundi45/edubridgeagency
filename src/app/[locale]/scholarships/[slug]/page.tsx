import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Opportunity from '@/lib/db/models/Opportunity';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShareButton } from '@/components/scholarships/ShareButton';
import { ReportButton } from '@/components/common/ReportButton';
import { getCountryFlag, formatDeadline } from '@/lib/utils';
import { 
  MapPin, Building2, GraduationCap, Calendar, 
  ExternalLink, CheckCircle, AlertTriangle, Clock, 
  Share2, Bookmark, Flag, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import type { IOpportunity } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();
  const opportunity = await Opportunity.findOne({ slug }).lean();
  
  if (!opportunity) return { title: 'Not Found' };
  
  const title = (opportunity as any).title?.en || 'Scholarship Details';
  
  return {
    title,
    description: (opportunity as any).description?.en?.substring(0, 160) || '',
  };
}

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations('scholarships.detail');
  
  await connectToDatabase();
  const opp = await Opportunity.findOne({ slug, status: 'published' }).lean();
  
  if (!opp) {
    notFound();
  }

  // Record view (fire and forget)
  Opportunity.findByIdAndUpdate(opp._id, { $inc: { 'metrics.views': 1 } }).exec();

  const opportunity = opp as unknown as IOpportunity;
  const deadlineInfo = formatDeadline(opportunity.deadline);
  
  // Safely extract localized strings
  const title = opportunity.title?.en || '';
  const description = opportunity.description?.en || '';
  const eligibility = opportunity.eligibility?.en || '';
  const applicationInstructions = opportunity.applicationInstructions?.en || '';

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/scholarships" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Scholarships
          </Link>

          {opportunity.isDemo && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <p className="text-sm">{t('demoNotice')}</p>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-border mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary" className="capitalize">{opportunity.type.replace('_', ' ')}</Badge>
              {opportunity.funding?.tuition && opportunity.funding?.stipend && (
                <Badge variant="success">Fully Funded</Badge>
              )}
              {opportunity.verification?.status === 'verified' && (
                <Badge variant="info" className="bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> {t('verifiedBy')}
                </Badge>
              )}
            </div>

            {opportunity.logo && (
              <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-sm max-h-[400px]">
                <img src={opportunity.logo} alt={title} className="w-full h-full object-contain bg-surface-alt" />
              </div>
            )}

            <h1 className="heading-2 mb-4 text-text">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-text-secondary mb-8">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-text">{opportunity.provider}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-text-muted" />
                <span>{getCountryFlag(opportunity.country)} {opportunity.country}</span>
              </div>
              {opportunity.degree && opportunity.degree.length > 0 && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-text-muted" />
                  <span className="capitalize">{opportunity.degree.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-border">
              <Button size="lg" className="w-full sm:w-auto text-base" asChild>
                <a href={opportunity.officialUrl} target="_blank" rel="noopener noreferrer">
                  {t('applyNow')} <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <div className="flex w-full sm:w-auto gap-2">
                <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                  <Bookmark className="w-4 h-4 mr-2" /> Save
                </Button>
                <div className="flex-1 sm:flex-none">
                  <ShareButton title={title} />
                </div>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3 text-center sm:text-left flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {t('applyWarning')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Overview */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
                <h2 className="text-xl font-bold text-text mb-4 border-b border-border pb-4">{t('overview')}</h2>
                <div className="prose-content whitespace-pre-wrap">{description}</div>
              </div>
              
              {/* Eligibility */}
              {(eligibility || (opportunity.requirements && opportunity.requirements.length > 0)) && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
                  <h2 className="text-xl font-bold text-text mb-4 border-b border-border pb-4">{t('eligibility')}</h2>
                  {eligibility && <div className="prose-content whitespace-pre-wrap mb-4">{eligibility}</div>}
                  
                  {opportunity.requirements && opportunity.requirements.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2 text-text-secondary mt-4">
                      {opportunity.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Application Process */}
              {(applicationInstructions || opportunity.documents) && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
                  <h2 className="text-xl font-bold text-text mb-4 border-b border-border pb-4">{t('process')}</h2>
                  {applicationInstructions && (
                    <div 
                      className="prose-content" 
                      dangerouslySetInnerHTML={{ __html: applicationInstructions }} 
                    />
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-slate-50 rounded-2xl p-6 text-sm text-text-muted border border-border italic">
                {t('disclaimer')}
              </div>
              
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Deadline Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-text mb-4">Important Dates</h3>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-alt mb-2">
                  <Calendar className={`w-6 h-6 shrink-0 mt-0.5 ${
                    deadlineInfo.urgency === 'critical' || deadlineInfo.urgency === 'expired' ? 'text-danger' : 
                    deadlineInfo.urgency === 'soon' ? 'text-warning' : 'text-primary'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Application Deadline</p>
                    <p className={`font-bold ${
                      deadlineInfo.urgency === 'critical' || deadlineInfo.urgency === 'expired' ? 'text-danger' : 
                      deadlineInfo.urgency === 'soon' ? 'text-warning' : 'text-text'
                    }`}>
                      {deadlineInfo.label}
                    </p>
                    {deadlineInfo.urgency !== 'expired' && opportunity.deadline && (
                      <p className="text-xs text-text-muted mt-1">{new Date(opportunity.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Funding Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-text mb-4">{t('fundingCovered')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${opportunity.funding?.tuition ? 'text-success' : 'text-slate-200'}`} />
                    <span className={opportunity.funding?.tuition ? 'text-text' : 'text-text-muted line-through'}>{t('tuition')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${opportunity.funding?.stipend ? 'text-success' : 'text-slate-200'}`} />
                    <span className={opportunity.funding?.stipend ? 'text-text' : 'text-text-muted line-through'}>{t('stipend')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${opportunity.funding?.accommodation ? 'text-success' : 'text-slate-200'}`} />
                    <span className={opportunity.funding?.accommodation ? 'text-text' : 'text-text-muted line-through'}>{t('accommodation')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${opportunity.funding?.travel ? 'text-success' : 'text-slate-200'}`} />
                    <span className={opportunity.funding?.travel ? 'text-text' : 'text-text-muted line-through'}>{t('travel')}</span>
                  </li>
                </ul>
              </div>

              {/* Action */}
              <div className="flex justify-center mt-2">
                <ReportButton opportunityId={opportunity._id.toString()} />
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
