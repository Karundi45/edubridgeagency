import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GraduationCap, LayoutDashboard, User, Bookmark, FileText, Bell, Sparkles, LogOut, Settings, Briefcase, ShieldAlert } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const NAV_ITEMS = [
    { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/saved', label: 'Saved Opportunities', icon: Bookmark },
    { href: '/dashboard/applications', label: 'My Applications', icon: GraduationCap },
    { href: '/dashboard/ai', label: 'AI Matchmaker', icon: Sparkles, special: true },
  ];

  if (['admin', 'superadmin', 'editor'].includes(session.user.role)) {
    NAV_ITEMS.push({ href: '/dashboard/admin', label: 'Admin Overview', icon: Settings });
    NAV_ITEMS.push({ href: '/dashboard/admin/scholarships/new', label: 'Post Opportunity', icon: FileText });
    NAV_ITEMS.push({ href: '/dashboard/admin/jobs', label: 'Manage Jobs', icon: Briefcase });
    NAV_ITEMS.push({ href: '/dashboard/admin/jobs/new', label: 'Post Job', icon: Briefcase });
    NAV_ITEMS.push({ href: '/dashboard/admin/applications', label: 'All Applications', icon: GraduationCap });
    NAV_ITEMS.push({ href: '/dashboard/admin/users', label: 'Manage Users', icon: User });
    NAV_ITEMS.push({ href: '/dashboard/admin/pages', label: 'Edit Content Pages', icon: FileText });
    NAV_ITEMS.push({ href: '/dashboard/admin/reports', label: 'User Reports', icon: ShieldAlert });
    NAV_ITEMS.push({ href: '/dashboard/admin/messages', label: 'Messages', icon: Bell });
    NAV_ITEMS.push({ href: '/dashboard/admin/settings', label: 'Settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border shrink-0 flex flex-col h-auto md:min-h-screen sticky top-0 md:static z-20">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-text group-hover:text-primary transition-colors">EduBridge</span>
          </Link>
          {/* Mobile menu toggle would go here */}
        </div>

        <div className="p-4 flex-1 overflow-y-auto hidden md:block space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.special 
                  ? 'text-accent-dark bg-accent/10 hover:bg-accent/20' 
                  : 'text-text-secondary hover:text-primary hover:bg-blue-50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.special ? 'text-accent' : ''}`} />
              {item.label}
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-border">
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-blue-50 transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <form action={async () => {
              'use server';
              const { signOut } = await import('@/auth');
              await signOut({ redirectTo: '/' });
            }}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors mt-1">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Horizontal Nav (scrollable) */}
        <div className="md:hidden flex overflow-x-auto p-2 border-b border-border bg-white no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors mr-2 ${
                item.special 
                  ? 'text-accent-dark bg-accent/10' 
                  : 'text-text-secondary hover:bg-surface-alt bg-white border border-border'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* Topbar (Desktop) */}
        <header className="hidden md:flex h-16 bg-white border-b border-border items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-text">Dashboard</h2>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="relative p-2 text-text-muted hover:text-primary bg-surface-alt rounded-full transition-colors">
              <Bell className="w-4 h-4" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface-alt"></span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-text leading-none">{session.user.name}</p>
                <p className="text-xs text-text-muted mt-1">{session.user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {session.user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
