'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    whatsapp_default_message: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    footer_text: ''
  });

  useEffect(() => {
    // Fetch current settings
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(json.error || 'Failed to save settings');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (fetching) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Platform Settings</h1>
        <p className="text-text-muted text-sm mt-1">Configure global website settings and integrations.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> WhatsApp Integration
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Input 
                label="WhatsApp Number" 
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleChange}
                placeholder="e.g. +250788000000" 
                helperText="Include country code, no spaces or special characters"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">Default Message</label>
                <textarea 
                  name="whatsapp_default_message"
                  value={settings.whatsapp_default_message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]"
                  placeholder="Hello EduBridge Agency..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Facebook URL" 
                name="facebook_url"
                value={settings.facebook_url}
                onChange={handleChange}
                type="url" 
                placeholder="https://facebook.com/..." 
              />
              <Input 
                label="Twitter/X URL" 
                name="twitter_url"
                value={settings.twitter_url}
                onChange={handleChange}
                type="url" 
                placeholder="https://twitter.com/..." 
              />
              <Input 
                label="LinkedIn URL" 
                name="linkedin_url"
                value={settings.linkedin_url}
                onChange={handleChange}
                type="url" 
                placeholder="https://linkedin.com/..." 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Footer Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Footer Text</label>
              <textarea 
                name="footer_text"
                value={settings.footer_text}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]"
                placeholder="Copyright text..."
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" size="lg" loading={loading}>
              <Save className="w-4 h-4 mr-2" /> Save Settings
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
