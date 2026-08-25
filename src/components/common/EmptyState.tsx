import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchX, FileSearch, BookmarkX, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'document' | 'bookmark' | 'bell';
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = 'document',
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const IconMap = {
    search: SearchX,
    document: FileSearch,
    bookmark: BookmarkX,
    bell: BellOff,
  };

  const Icon = IconMap[icon];

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      
      {(actionLabel && actionHref) && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      
      {(actionLabel && onAction && !actionHref) && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
