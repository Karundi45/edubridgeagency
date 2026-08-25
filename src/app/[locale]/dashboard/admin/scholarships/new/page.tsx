'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { STUDY_FIELDS, COUNTRIES_BY_REGION } from '@/types';

export default function CreateScholarshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleFr: '',
    provider: '',
    organization: '',
    descriptionEn: '',
    descriptionFr: '',
    type: 'scholarship',
    degree: 'undergraduate',
    studyMode: 'on_campus',
    officialUrl: '',
    country: '',
    deadline: '',
    googleFormLink: '',
    whatsappNumber: '',
    logo: '',
    funding: {
      tuition: false,
      accommodation: false,
      stipend: false,
      travel: false,
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFundingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      funding: {
        ...prev.funding,
        [e.target.name]: e.target.checked
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setFormData(prev => ({ ...prev, logo: result.url }));
      toast.success('Poster uploaded successfully');
    } catch (err: any) {
      toast.error('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let instructionsEn = '';
      if (formData.googleFormLink || formData.whatsappNumber) {
        instructionsEn += '<div style="background:#F0FDF4;border:1px solid #10B981;border-radius:8px;padding:20px;margin-top:20px;">';
        instructionsEn += '<h3 style="color:#065F46;margin-top:0;margin-bottom:12px;font-weight:700;">🤝 Need Help Applying?</h3><ul style="margin:0;padding-left:20px;color:#064E3B;line-height:1.8;">';
        if (formData.googleFormLink) instructionsEn += `<li><a href="${formData.googleFormLink}" target="_blank" style="color:#10B981;text-decoration:underline;font-weight:500;">Click here to fill out our Google Form for application assistance</a></li>`;
        if (formData.whatsappNumber) instructionsEn += `<li><strong>WhatsApp Support:</strong> <a href="https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, '')}" target="_blank" style="color:#10B981;text-decoration:underline;font-weight:500;">Message us on WhatsApp</a></li>`;
        instructionsEn += '</ul></div>';
      }

      const payload = {
        title: { en: formData.titleEn, fr: formData.titleFr || formData.titleEn },
        description: { en: formData.descriptionEn, fr: formData.descriptionFr || formData.descriptionEn },
        eligibility: { en: '', fr: '' },
        applicationInstructions: { en: instructionsEn, fr: instructionsEn },
        provider: formData.provider,
        organization: formData.organization,
        type: formData.type,
        studyMode: formData.studyMode,
        officialUrl: formData.officialUrl,
        country: formData.country,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        degree: [formData.degree],
        field: ['Other'],
        fundingType: ['fully_funded'],
        funding: formData.funding,
        nationality: ['Any'],
        logo: formData.logo,
        status: 'published',
        isFeatured: false,
        isDemo: false,
        verification: { status: 'verified' }
      };

      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      
      toast.success('Scholarship created successfully!');
      router.push(`/scholarships/${data.data.slug}`);
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Create Scholarship</h1>
        <p className="text-text-muted mt-1">Publish a new opportunity to the platform.</p>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Title (English) *" 
              name="titleEn" 
              value={formData.titleEn} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Mastercard Foundation Scholars Program"
            />
            <Input 
              label="Title (French) *" 
              name="titleFr" 
              value={formData.titleFr} 
              onChange={handleChange} 
              required 
            />
            
            <Input 
              label="Provider *" 
              name="provider" 
              value={formData.provider} 
              onChange={handleChange} 
              required 
              placeholder="e.g. University of Toronto"
            />
            <Input 
              label="Organization (Sponsor)" 
              name="organization" 
              value={formData.organization} 
              onChange={handleChange} 
              placeholder="e.g. Mastercard Foundation"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Type *</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="scholarship">Scholarship</option>
                <option value="fellowship">Fellowship</option>
                <option value="grant">Grant</option>
                <option value="internship">Internship</option>
                <option value="job_vacancy">Job Vacancy</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Level of Opportunity *</label>
              <select 
                name="degree" 
                value={formData.degree} 
                onChange={handleChange} 
                className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="undergraduate">Undergraduate / Bachelors</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
                <option value="diploma">Diploma / Associate</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Study Mode *</label>
              <select 
                name="studyMode" 
                value={formData.studyMode} 
                onChange={handleChange} 
                className="w-full h-10 px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="on_campus">On Campus / On Site</option>
                <option value="online">Online / Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <Input 
              label="Official URL (Link to Apply) *" 
              name="officialUrl" 
              type="url"
              value={formData.officialUrl} 
              onChange={handleChange} 
              required 
              placeholder="https://..."
            />
            
            <Input 
              label="Destination Country *" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Rwanda"
            />
            
            <Input 
              label="Deadline" 
              name="deadline" 
              type="date"
              value={formData.deadline} 
              onChange={handleChange} 
            />
            
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">Poster / Logo Upload</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {uploading && <span className="text-sm text-accent animate-pulse">Uploading...</span>}
              </div>
              {formData.logo && (
                <div className="mt-2 relative w-32 h-32 rounded overflow-hidden border border-border">
                  <img src={formData.logo} alt="Poster preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <Input 
              label="Google Form Link (For students seeking help)" 
              name="googleFormLink" 
              type="url"
              value={formData.googleFormLink} 
              onChange={handleChange} 
              placeholder="https://forms.gle/..."
            />
            
            <Input 
              label="WhatsApp Support Number" 
              name="whatsappNumber" 
              type="tel"
              value={formData.whatsappNumber} 
              onChange={handleChange} 
              placeholder="+250 788..."
            />
          </div>
          
          <div className="space-y-3 pt-6 border-t border-border">
            <h3 className="font-bold text-text mb-2">What's Covered (Funding)</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="tuition" checked={formData.funding.tuition} onChange={handleFundingChange} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-text-secondary">Tuition Fees</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="accommodation" checked={formData.funding.accommodation} onChange={handleFundingChange} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-text-secondary">Accommodation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="stipend" checked={formData.funding.stipend} onChange={handleFundingChange} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-text-secondary">Monthly Stipend</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="travel" checked={formData.funding.travel} onChange={handleFundingChange} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-text-secondary">Travel Allowance</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Description (English) *</label>
              <textarea 
                name="descriptionEn" 
                value={formData.descriptionEn} 
                onChange={handleChange} 
                required 
                rows={5}
                className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Description (French) *</label>
              <textarea 
                name="descriptionFr" 
                value={formData.descriptionFr} 
                onChange={handleChange} 
                required 
                rows={5}
                className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-6">
            <Button type="submit" loading={loading} size="lg">Publish Scholarship</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
