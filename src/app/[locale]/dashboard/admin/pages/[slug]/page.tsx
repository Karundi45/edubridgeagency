'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { use } from 'react';

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/pages/${resolvedParams.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTitle(data.data.title);
          setContent(data.data.content);
        } else {
          // Defaults if not created yet
          setTitle(resolvedParams.slug.charAt(0).toUpperCase() + resolvedParams.slug.slice(1));
          setContent('<div class="prose-content max-w-none">\n  <h2>Heading</h2>\n  <p>Write your content here...</p>\n</div>');
        }
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${resolvedParams.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Page saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="px-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="heading-2 text-text">Edit Page: {resolvedParams.slug}</h1>
          <p className="text-text-muted text-sm">You can write plain text or HTML.</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">Page Title</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. About Us" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-2 flex justify-between">
            <span>Page Content (HTML supported)</span>
            <span className="text-xs text-text-muted font-normal">Use standard Tailwind classes like 'text-2xl', 'font-bold', 'mb-4'</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] p-4 bg-surface font-mono text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="<div>...</div>"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSave} loading={saving} size="lg">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
