'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const LOCATIONS = ['Kigali', 'Remote', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'];
const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' }
];

export function JobFiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleToggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    
    if (current.includes(value)) {
      params.delete(key);
      current.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      params.append(key, value);
    }
    
    // Reset page on filter
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedLocations = searchParams.getAll('location');
  const selectedTypes = searchParams.getAll('type');

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
        <h3 className="font-bold text-lg mb-4">Filters</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-text-muted mb-2">Location</h4>
            <div className="space-y-2">
              {LOCATIONS.map(loc => (
                <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedLocations.includes(loc)}
                    onChange={() => handleToggle('location', loc)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{loc}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-text-muted mb-2">Employment Type</h4>
            <div className="space-y-2">
              {EMPLOYMENT_TYPES.map(type => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(type.value)}
                    onChange={() => handleToggle('type', type.value)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
