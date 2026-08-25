'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    
    // Replace the current locale in the URL
    // This is a simple implementation since we use 'as-needed' prefix routing
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    
    // For standard un-prefixed paths (default locale)
    if (newPath === pathname && locale === 'en') {
      router.push(`/${nextLocale}${pathname}`);
    } else {
      router.push(newPath || '/');
    }
    
    router.refresh();
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-text-muted hover:text-primary hover:bg-surface-alt rounded-md transition-colors"
      aria-label="Switch Language"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{locale === 'en' ? 'fr' : 'en'}</span>
    </button>
  );
}
