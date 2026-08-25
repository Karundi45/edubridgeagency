'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageUrl(page));
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  let visiblePages = pages;
  
  if (totalPages > 5) {
    if (currentPage <= 3) {
      visiblePages = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 2) {
      visiblePages = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      visiblePages = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {visiblePages.map((page, i) => {
        if (page === -1) {
          return <span key={`ellipsis-${i}`} className="px-2 text-text-muted">...</span>;
        }
        
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-alt'
            }`}
          >
            {page}
          </button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
