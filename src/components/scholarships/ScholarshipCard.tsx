'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatRelativeDate, getCountryFlag, truncate } from '@/lib/utils';
import { Building2, Calendar, MapPin, CheckCircle, GraduationCap, Clock } from 'lucide-react';
import type { IOpportunity } from '@/types';

interface ScholarshipCardProps {
  opportunity: Partial<IOpportunity>;
  locale?: 'en' | 'fr';
  featured?: boolean;
}

export function ScholarshipCard({ opportunity, locale = 'en', featured = false }: ScholarshipCardProps) {
  const t = useTranslations('scholarships.card');
  
  const title = opportunity.title?.[locale] || opportunity.title?.en || '';
  const description = opportunity.description?.[locale] || opportunity.description?.en || '';
  const isDemo = opportunity.isDemo;

  // Deadline logic
  const now = new Date();
  const deadlineDate = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const isExpired = deadlineDate ? deadlineDate < now : false;
  
  let deadlineDisplay = null;
  if (deadlineDate) {
    if (isExpired) {
      deadlineDisplay = (
        <span className="flex items-center gap-1 text-danger font-medium">
          <Clock className="w-3.5 h-3.5" />
          {t('deadline_passed')}
        </span>
      );
    } else {
      const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft === 0) {
        deadlineDisplay = <span className="flex items-center gap-1 text-danger font-bold"><Clock className="w-3.5 h-3.5" /> {t('closingToday')}</span>;
      } else if (daysLeft === 1) {
        deadlineDisplay = <span className="flex items-center gap-1 text-warning font-bold"><Clock className="w-3.5 h-3.5" /> {t('closingTomorrow')}</span>;
      } else if (daysLeft <= 14) {
        deadlineDisplay = <span className="flex items-center gap-1 text-warning font-semibold"><Clock className="w-3.5 h-3.5" /> {t('daysLeft', { days: daysLeft })}</span>;
      } else {
        deadlineDisplay = <span className="flex items-center gap-1 text-text-muted"><Calendar className="w-3.5 h-3.5" /> {new Date(opportunity.deadline!).toLocaleDateString()}</span>;
      }
    }
  }

  return (
    <Link href={`/scholarships/${opportunity.slug}`} className="block h-full group">
      <Card className={`h-full flex flex-col transition-all duration-300 overflow-hidden ${featured ? 'border-primary shadow-md hover:shadow-xl hover:-translate-y-1' : 'hover:border-border-strong hover:shadow-md'}`}>
        
        {/* Poster Image */}
        {opportunity.logo && (
          <div className="w-full h-40 bg-surface-alt relative overflow-hidden border-b border-border">
            <img 
              src={opportunity.logo} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          {/* Header Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {opportunity.funding?.tuition && opportunity.funding?.stipend && (
              <Badge variant="success" size="sm">{t('fullyFunded')}</Badge>
            )}
            {opportunity.verification?.status === 'verified' && (
              <Badge variant="primary" size="sm" className="bg-blue-50 text-primary border border-blue-100">
                <CheckCircle className="w-3 h-3 mr-1" /> {t('verified')}
              </Badge>
            )}
            {isDemo && <Badge variant="danger" size="sm">{t('demo')}</Badge>}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Building2 className="w-4 h-4 text-text-muted shrink-0" />
              <span className="truncate">{opportunity.provider}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span className="truncate">{getCountryFlag(opportunity.country || '')} {opportunity.country}</span>
              </div>
              
              {opportunity.degree && opportunity.degree.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="truncate capitalize">{opportunity.degree[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-muted line-clamp-3 mb-4 flex-1">
            {truncate(description, 150)}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs">
            <div>{deadlineDisplay || <span className="text-text-muted">No deadline</span>}</div>
            <span className="text-primary font-medium flex items-center group-hover:underline">
              {t('viewDetails')} &rarr;
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
