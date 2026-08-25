'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GraduationCap, Facebook, Linkedin, Twitter, MessageCircle, Instagram, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORM_LINKS = [
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About Us' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(data.error || 'Subscription failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-text text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold leading-none">EduBridge Agency</div>
                <div className="text-xs text-blue-300 leading-none mt-0.5">Discover Opportunities. Build Your Future.</div>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Helping students in Rwanda, Africa, and internationally discover verified scholarships and educational opportunities.
            </p>
            {/* Mini Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Get scholarship alerts"
                className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a href="https://wa.me/250000000000" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="X / Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:info@edubridge-agency.com" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold text-white mt-6 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EduBridge Agency. All rights reserved.
            <span className="ml-4">
              <Link href="/login?callbackUrl=/dashboard/admin" className="hover:text-white transition-colors">Admin Login</Link>
            </span>
          </p>
          <p className="text-xs text-slate-600 text-center">
            EduBridge Agency provides scholarship information only. Always verify on official provider websites.
          </p>
        </div>
      </div>
    </footer>
  );
}
