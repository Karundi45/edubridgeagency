'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrls, setFileUrls] = useState({
    companyLogo: '',
    requirementDocumentUrl: '',
    officialAnnouncementUrl: ''
  });
  
  const { register, handleSubmit } = useForm();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'companyLogo' | 'requirementDocumentUrl' | 'officialAnnouncementUrl') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setFileUrls(prev => ({ ...prev, [fieldName]: result.url }));
      toast.success('File uploaded successfully');
    } catch (err: any) {
      toast.error('Failed to upload file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    // Transform flat form data to match IJob structure
    const payload = {
      title: { en: data.title },
      company: data.company,
      location: data.location,
      province: data.province,
      employmentType: [data.employmentType],
      category: [data.category],
      experienceLevel: data.experienceLevel,
      salary: data.salary,
      deadline: data.deadline || null,
      description: { en: data.description },
      applicationInstructions: { en: data.applicationInstructions },
      applicationUrl: data.applicationUrl,
      applicationEmail: data.applicationEmail,
      status: data.status,
      isFeatured: data.isFeatured === 'true',
      
      companyLogo: fileUrls.companyLogo,
      requirementDocumentUrl: fileUrls.requirementDocumentUrl,
      officialAnnouncementUrl: fileUrls.officialAnnouncementUrl,
      
      // Split newline-separated text areas into arrays
      responsibilities: data.responsibilities ? data.responsibilities.split('\n').filter(Boolean) : [],
      requirements: data.requirements ? data.requirements.split('\n').filter(Boolean) : [],
      skills: data.skills ? data.skills.split('\n').filter(Boolean) : [],
      benefits: data.benefits ? data.benefits.split('\n').filter(Boolean) : [],
      educationRequirement: { en: data.educationRequirement },
    };

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success('Job posted successfully!');
        router.push('/dashboard/admin/jobs');
        router.refresh();
      } else {
        throw new Error(json.error || 'Failed to post job');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link href="/dashboard/admin/jobs" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
      </Link>
      
      <div>
        <h1 className="text-2xl font-bold">Post New Job</h1>
        <p className="text-text-muted">Fill out the details below to publish a new job opportunity in Rwanda.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Job Title *" placeholder="e.g. Senior Frontend Developer" required {...register('title')} />
              <Input label="Company Name *" placeholder="e.g. EduBridge Agency" required {...register('company')} />
              <Input label="Location *" placeholder="e.g. Kigali, KG 7 Ave" required {...register('location')} />
              
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Province *</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" required {...register('province')}>
                  <option value="Kigali">Kigali</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Western Province">Western Province</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Employment Type *</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required {...register('employmentType')}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Category *</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required {...register('category')}>
                  <option value="IT">IT & Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="NGO">NGO</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Requirements & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Experience Level *</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required {...register('experienceLevel')}>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <Input label="Education Requirement *" placeholder="e.g. Bachelor's in Computer Science" required {...register('educationRequirement')} />
              <Input label="Salary (Optional)" placeholder="e.g. 500,000 RWF - 800,000 RWF" {...register('salary')} />
              <Input label="Application Deadline" type="date" {...register('deadline')} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Description & Details</h3>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Full Job Description *</label>
              <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none min-h-[150px]" required {...register('description')}></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Responsibilities (One per line)</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" {...register('responsibilities')}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Requirements (One per line)</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" {...register('requirements')}></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Media & Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">Company Logo (Image)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'companyLogo')} 
                  disabled={uploading}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {fileUrls.companyLogo && (
                  <div className="mt-2 relative w-16 h-16 rounded overflow-hidden border border-border">
                    <img src={fileUrls.companyLogo} alt="Logo preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">Requirement Document (PDF/Doc)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'requirementDocumentUrl')} 
                  disabled={uploading}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {fileUrls.requirementDocumentUrl && <p className="text-sm text-success mt-1">✓ Document uploaded</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">Official Announcement (PDF/Doc)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'officialAnnouncementUrl')} 
                  disabled={uploading}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {fileUrls.officialAnnouncementUrl && <p className="text-sm text-success mt-1">✓ Document uploaded</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Application</h3>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Application Instructions *</label>
              <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" required placeholder="How should candidates apply?" {...register('applicationInstructions')}></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Application URL" type="url" placeholder="https://..." {...register('applicationUrl')} />
              <Input label="Application Email" type="email" placeholder="jobs@company.com" {...register('applicationEmail')} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-border pb-2">Publishing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Status</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none" {...register('status')}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Featured Job</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none" {...register('isFeatured')}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" size="lg" loading={isLoading}>
              Publish Job
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
