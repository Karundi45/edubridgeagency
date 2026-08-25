import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Application from '@/lib/db/models/Application';
import SavedOpportunity from '@/lib/db/models/SavedOpportunity';
import StudentProfile from '@/lib/db/models/StudentProfile';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Bookmark, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { IApplication, ISavedOpportunity } from '@/types';

export default async function DashboardHome() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === 'admin' || session.user.role === 'superadmin') {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard/admin');
  }

  await connectToDatabase();

  const [applications, savedOpps, profile] = await Promise.all([
    Application.find({ userId: session.user.id })
      .populate('opportunityId', 'title slug provider')
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean(),
    SavedOpportunity.find({ userId: session.user.id })
      .populate('opportunityId', 'title slug deadline')
      .sort({ savedAt: -1 })
      .limit(3)
      .lean(),
    StudentProfile.findOne({ userId: session.user.id }).lean(),
  ]);

  const profileCompleteness = (profile as any)?.profileCompleteness || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Welcome & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-hero-gradient text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <h1 className="text-2xl font-bold mb-2 relative z-10">Welcome back, {session.user.name?.split(' ')[0]}!</h1>
          <p className="text-blue-100 mb-6 relative z-10">Ready to find your next opportunity?</p>
          
          {profileCompleteness < 100 && (
            <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm relative z-10">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Profile Completeness</span>
                <span>{profileCompleteness}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000" 
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
              <Link href="/dashboard/profile" className="inline-block mt-3 text-xs font-semibold text-accent-light hover:underline">
                Complete your profile to get better AI matches &rarr;
              </Link>
            </div>
          )}
        </div>

        <Card className="flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-text">{savedOpps.length}</h3>
          <p className="text-sm font-medium text-text-muted mt-1">Saved</p>
        </Card>
        
        <Card className="flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-white to-amber-50 border-amber-100">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-text">{applications.length}</h3>
          <p className="text-sm font-medium text-text-muted mt-1">Applications</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/dashboard/applications" className="text-sm text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4 mt-4">
                {applications.map((app: any) => (
                  <div key={app._id.toString()} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-text truncate">{app.opportunityId.title.en}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5">{app.opportunityId.provider}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        app.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'interviewing' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <p className="text-[10px] text-text-muted mt-1.5">{new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-text-muted mb-4">You haven't tracked any applications yet.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/scholarships">Browse Scholarships</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations Teaser */}
        <Card className="border-accent-light overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-10"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-6">
              Our AI analyzes your profile and matches you with scholarships you're most likely to win.
            </p>
            <Button className="w-full group" variant="accent" asChild>
              <Link href="/dashboard/ai">
                Get Personalized Matches 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <div className="mt-6 p-4 bg-surface-alt rounded-lg border border-border border-dashed">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                  Tip: Keep your education history and target countries updated in your profile to improve match accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
