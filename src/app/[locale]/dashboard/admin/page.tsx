import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Opportunity from '@/lib/db/models/Opportunity';
import Application from '@/lib/db/models/Application';
import Page from '@/lib/db/models/Page';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, GraduationCap, FileText, LayoutTemplate, ArrowRight, Eye, Bookmark } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();

  const [
    totalUsers,
    totalOpportunities,
    totalApplications,
    totalPages,
    recentOpportunities
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Opportunity.countDocuments(),
    Application.countDocuments(),
    Page.countDocuments(),
    Opportunity.find().sort({ createdAt: -1 }).limit(5).lean()
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-primary text-white rounded-xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <h1 className="text-3xl font-bold mb-2 relative z-10">Admin Dashboard</h1>
        <p className="text-blue-100 relative z-10">Manage EduBridge Agency platform, scholarships, and content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Students</p>
              <h3 className="text-2xl font-bold text-text">{totalUsers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Opportunities</p>
              <h3 className="text-2xl font-bold text-text">{totalOpportunities}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Applications Tracked</p>
              <h3 className="text-2xl font-bold text-text">{totalApplications}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Static Pages</p>
              <h3 className="text-2xl font-bold text-text">{totalPages}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-between" asChild>
              <Link href="/dashboard/admin/scholarships/new">
                Add New Scholarship <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button className="w-full justify-between" variant="secondary" asChild>
              <Link href="/dashboard/admin/pages">
                Manage Static Pages <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button className="w-full justify-between" variant="outline" asChild>
              <Link href="/scholarships" target="_blank">
                View Public Site <Eye className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recently Added Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOpportunities.length > 0 ? (
              <div className="space-y-3 mt-4">
                {recentOpportunities.map((opp: any) => (
                  <div key={opp._id.toString()} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-surface-alt hover:bg-surface transition-colors gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text truncate">{opp.title.en}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5">{opp.provider}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        opp.status === 'published' ? 'bg-green-100 text-green-700' :
                        opp.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {opp.status.toUpperCase()}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/scholarships/${opp.slug}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-text-muted">No opportunities found in the database.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
