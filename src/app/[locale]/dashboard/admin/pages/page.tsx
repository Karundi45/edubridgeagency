'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminPagesList() {
  const [pages, setPages] = useState<{ slug: string; title: string; updatedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Default pages that should exist
  const DEFAULT_PAGES = [
    { slug: 'about', title: 'About Us' },
    { slug: 'contact', title: 'Contact Us' },
    { slug: 'faq', title: 'FAQ' },
    { slug: 'privacy', title: 'Privacy Policy' },
    { slug: 'terms', title: 'Terms of Service' },
    { slug: 'disclaimer', title: 'Disclaimer' },
    { slug: 'cookies', title: 'Cookie Policy' },
  ];

  useEffect(() => {
    fetch('/api/admin/pages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPages(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading pages...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-2 text-text">Content Pages Manager</h1>
          <p className="text-text-muted mt-1">Edit the static pages of your website without changing code.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {DEFAULT_PAGES.map((defaultPage) => {
          const existing = pages.find(p => p.slug === defaultPage.slug);
          return (
            <Card key={defaultPage.slug} className="p-4 flex items-center justify-between hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text">{existing?.title || defaultPage.title}</h3>
                  <p className="text-xs text-text-muted font-mono">/{defaultPage.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {existing && (
                  <span className="text-xs text-text-muted hidden sm:block">
                    Updated: {new Date(existing.updatedAt).toLocaleDateString()}
                  </span>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/admin/pages/${defaultPage.slug}`}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
