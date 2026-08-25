'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  GraduationCap,
  Search,
  Menu,
  X,
  Bell,
  Bookmark,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Globe,
  BookOpen,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled ? 'bg-white border-b border-border shadow-sm' : 'bg-white/95 backdrop-blur-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-text leading-none">EduBridge</div>
              <div className="text-xs text-primary font-semibold leading-none">Agency</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/scholarships"
              className="p-2 text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Language Switcher */}
            <button className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </button>

            {session?.user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Saved */}
                <Link
                  href="/dashboard/saved"
                  className="hidden sm:flex p-2 text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
                  aria-label="Saved"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* Admin Link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-surface-alt transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-text max-w-24 truncate">
                      {session.user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-border shadow-lg z-20 py-1">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-sm font-semibold text-text truncate">{session.user.name}</p>
                          <p className="text-xs text-text-muted truncate">{session.user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-alt">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-alt">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link href="/dashboard/saved" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-alt">
                          <Bookmark className="w-4 h-4" /> Saved
                        </Link>
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/' }); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Hidden public auth buttons (Admin login moved to footer or hidden URL) */}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-alt rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <div className="border-t border-border pt-3 mt-3 space-y-1">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-alt rounded-lg">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/dashboard/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-alt rounded-lg">
                  <Bell className="w-4 h-4" /> Notifications
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg">
                    <Shield className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50 rounded-lg w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-border pt-3 mt-3 flex gap-2 justify-center">
                <span className="text-xs text-text-muted">Welcome to EduBridge Agency</span>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
