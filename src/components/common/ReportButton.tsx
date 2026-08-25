'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Flag, X } from 'lucide-react';
import { toast } from 'sonner';

export function ReportButton({ opportunityId, jobId }: { opportunityId?: string, jobId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('expired');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { reason, description };
      if (opportunityId) payload.opportunityId = opportunityId;
      if (jobId) payload.jobId = jobId;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || "Report submitted successfully!");
        setIsOpen(false);
      } else {
        throw new Error(json.error || 'Failed to submit report');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="text-text-muted hover:text-red-600 transition-colors">
        <Flag className="w-4 h-4 mr-1.5" /> Report Issue
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-1">Report an Issue</h3>
            <p className="text-sm text-text-muted mb-6">Help us keep EduBridge Agency clean and accurate.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Reason for reporting</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="expired">Post has expired</option>
                  <option value="broken_link">Broken or incorrect link</option>
                  <option value="incorrect_info">Incorrect information</option>
                  <option value="suspicious">Suspicious / Scam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Additional Details</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Please provide any additional context..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" loading={loading} className="bg-red-600 hover:bg-red-700 text-white">Submit Report</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
