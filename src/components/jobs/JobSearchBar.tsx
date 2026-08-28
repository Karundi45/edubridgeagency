'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function JobSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto mt-8 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job titles, companies, or keywords..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-900 border-none focus:ring-2 focus:ring-accent outline-none"
        />
      </div>
      <Button type="submit" size="lg" className="px-8 rounded-xl bg-accent text-white hover:bg-accent-dark shrink-0">
        Search
      </Button>
    </form>
  );
}
