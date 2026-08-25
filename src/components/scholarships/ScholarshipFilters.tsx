'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { COUNTRIES_BY_REGION, STUDY_FIELDS } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

export function ScholarshipFilters() {
  const t = useTranslations('scholarships.filters');
  const typeT = useTranslations('typeLabels');
  const degreeT = useTranslations('degreeLabels');
  const fundingT = useTranslations('fundingLabels');
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // For arrays (multiple selection)
    if (['type', 'degree', 'field', 'country', 'fundingType'].includes(key)) {
      const current = params.getAll(key);
      if (current.includes(value)) {
        params.delete(key);
        current.filter(v => v !== value).forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      // For single values
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    
    // Reset page to 1 when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const clearFilters = () => {
    router.push(pathname);
  };
  
  const hasActiveFilters = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'query').length > 0;
  
  const FilterGroup = ({ title, options, filterKey, translatePrefix }: { title: string, options: string[], filterKey: string, translatePrefix?: any }) => {
    const [expanded, setExpanded] = useState(true);
    const selected = searchParams.getAll(filterKey);
    
    return (
      <div className="border-b border-border py-4 last:border-0">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-sm font-semibold text-text mb-2"
        >
          <span>{title}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </button>
        
        {expanded && (
          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {options.map(opt => {
              const isChecked = selected.includes(opt);
              const label = translatePrefix ? translatePrefix(opt) : opt;
              
              return (
                <label key={opt} className="flex items-start gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={isChecked}
                      onChange={() => updateFilter(filterKey, opt)}
                    />
                    <div className={`w-4 h-4 rounded border transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-border-strong group-hover:border-primary'}`}>
                      {isChecked && <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                  <span className={`text-sm ${isChecked ? 'text-text font-medium' : 'text-text-secondary'}`}>{label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full justify-between" 
          onClick={() => setIsOpen(true)}
        >
          <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> {t('title')}</span>
          {hasActiveFilters && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'query').length}</span>}
        </Button>
      </div>

      {/* Desktop sidebar & Mobile slide-over */}
      <div className={`
        fixed inset-0 z-50 lg:static lg:block lg:z-auto
        ${isOpen ? 'block' : 'hidden'}
      `}>
        {/* Mobile backdrop */}
        <div 
          className="absolute inset-0 bg-text/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
        
        {/* Filter container */}
        <div className={`
          absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl lg:shadow-none lg:w-full lg:static
          flex flex-col h-full transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-border flex items-center justify-between lg:hidden">
            <h2 className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4" /> {t('title')}</h2>
            <button onClick={() => setIsOpen(false)} className="p-1 text-text-muted hover:bg-surface-alt rounded"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text hidden lg:block">{t('title')}</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                  {t('clearAll')}
                </button>
              )}
            </div>
            
            <FilterGroup 
              title={t('type')} 
              filterKey="type" 
              options={['scholarship', 'fellowship', 'grant', 'internship', 'summer_program', 'job_vacancy']}
              translatePrefix={typeT}
            />
            
            <FilterGroup 
              title={t('degree')} 
              filterKey="degree" 
              options={['undergraduate', 'masters', 'phd', 'postdoctoral', 'certificate']}
              translatePrefix={degreeT}
            />
            
            <FilterGroup 
              title={t('funding')} 
              filterKey="fundingType" 
              options={['fully_funded', 'partially_funded', 'tuition_waiver', 'monthly_stipend']}
              translatePrefix={fundingT}
            />
            
            <FilterGroup 
              title={t('field')} 
              filterKey="field" 
              options={STUDY_FIELDS.slice(0, 10)}
            />
            
            <FilterGroup 
              title={t('destination')} 
              filterKey="country" 
              options={['Rwanda', 'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'South Korea', 'China']}
            />
          </div>
          
          <div className="p-4 border-t border-border lg:hidden">
            <Button className="w-full" onClick={() => setIsOpen(false)}>Show Results</Button>
          </div>
        </div>
      </div>
    </>
  );
}
