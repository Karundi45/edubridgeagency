'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { UserCircle, GraduationCap, Globe, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    nationality: '',
    educationLevel: 'undergraduate',
    institution: '',
    field: '',
    gpa: '',
    graduationYear: '',
    preferredCountries: [] as string[],
    englishLevel: 'intermediate',
    frenchLevel: 'beginner'
  });

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // ensure arrays and optional fields are mapped
          setProfile(prev => ({
            ...prev,
            ...data.data,
            gpa: data.data.gpa?.toString() || '',
            graduationYear: data.data.graduationYear?.toString() || ''
          }));
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCountriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
    setProfile(prev => ({ ...prev, preferredCountries: countries }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...profile,
        gpa: profile.gpa ? parseFloat(profile.gpa) : undefined,
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear) : undefined
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(json.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-text-muted">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-muted text-sm mt-1">
          Complete your academic profile so our AI Matchmaker can recommend the best scholarships and jobs for you.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
               {session?.user?.image ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
               ) : (
                 <UserCircle className="w-8 h-8" />
               )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">{session?.user?.name}</h2>
              <p className="text-text-muted text-sm">{session?.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nationality" 
                name="nationality"
                value={profile.nationality}
                onChange={handleChange}
                placeholder="e.g. Rwandan" 
                required
              />
              <Input 
                label="Preferred Study Destinations (Comma separated)" 
                name="preferredCountries"
                value={profile.preferredCountries.join(', ')}
                onChange={handleCountriesChange}
                placeholder="e.g. Canada, Germany, UK" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Background
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Current Education Level</label>
                <select 
                  name="educationLevel" 
                  value={profile.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="undergraduate">Undergraduate (Bachelor's)</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
              <Input 
                label="Field of Study" 
                name="field"
                value={profile.field}
                onChange={handleChange}
                placeholder="e.g. Computer Science" 
              />
              <Input 
                label="Current/Previous Institution" 
                name="institution"
                value={profile.institution}
                onChange={handleChange}
                placeholder="e.g. University of Rwanda" 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="GPA / Grade" 
                  name="gpa"
                  type="number"
                  step="0.01"
                  value={profile.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.8" 
                />
                <Input 
                  label="Graduation Year" 
                  name="graduationYear"
                  type="number"
                  value={profile.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g. 2025" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Language Proficiency
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">English Level</label>
                <select 
                  name="englishLevel" 
                  value={profile.englishLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="upper_intermediate">Upper Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="native">Native / Bilingual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">French Level</label>
                <select 
                  name="frenchLevel" 
                  value={profile.frenchLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="upper_intermediate">Upper Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="native">Native / Bilingual</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" size="lg" loading={loading}>
              Save Profile
            </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
