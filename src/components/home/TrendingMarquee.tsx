'use client';

import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import type { IOpportunity } from '@/types';

export function TrendingMarquee({ opportunities }: { opportunities: IOpportunity[] }) {
  if (!opportunities || opportunities.length === 0) return null;

  // Duplicate the array to create a seamless infinite scroll effect
  const duplicated = [...opportunities, ...opportunities];

  return (
    <div className="w-full overflow-hidden py-8">
      {/* Container that handles the infinite sliding animation */}
      <div className="flex gap-6 w-max animate-marquee">
        {duplicated.map((opp, idx) => (
          <div key={`${opp._id.toString()}-${idx}`} className="w-[350px] shrink-0">
            <ScholarshipCard opportunity={opp} featured={true} />
          </div>
        ))}
      </div>
    </div>
  );
}
