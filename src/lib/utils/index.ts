import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns';

// ============================================================
// CSS Class Utilities
// ============================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// Date & Deadline Utilities
// ============================================================

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  try {
    return format(new Date(date), pattern);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeDate(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

export type DeadlineUrgency = 'expired' | 'critical' | 'soon' | 'normal';

export interface DeadlineInfo {
  daysLeft: number;
  label: string;
  urgency: DeadlineUrgency;
}

export function formatDeadline(deadline: string | Date | undefined | null): DeadlineInfo {
  if (!deadline) {
    return { daysLeft: 0, label: 'No deadline', urgency: 'normal' };
  }

  const d = new Date(deadline);
  if (isNaN(d.getTime())) {
    return { daysLeft: 0, label: 'Invalid date', urgency: 'normal' };
  }

  if (isPast(d)) {
    return { daysLeft: 0, label: 'Deadline passed', urgency: 'expired' };
  }

  const daysLeft = differenceInDays(d, new Date());

  if (daysLeft === 0) return { daysLeft: 0, label: 'Closing today!', urgency: 'critical' };
  if (daysLeft === 1) return { daysLeft: 1, label: 'Closing tomorrow', urgency: 'critical' };
  if (daysLeft <= 7) return { daysLeft, label: `${daysLeft} days remaining`, urgency: 'critical' };
  if (daysLeft <= 14) return { daysLeft, label: `${daysLeft} days remaining`, urgency: 'soon' };
  if (daysLeft <= 30) return { daysLeft, label: `${daysLeft} days remaining`, urgency: 'soon' };

  return {
    daysLeft,
    label: format(d, 'MMM d, yyyy'),
    urgency: 'normal',
  };
}

// ============================================================
// String Utilities
// ============================================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// ============================================================
// Number Utilities
// ============================================================

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ============================================================
// Country & Flag Utilities
// ============================================================

const COUNTRY_FLAGS: Record<string, string> = {
  Rwanda: '🇷🇼',
  Kenya: '🇰🇪',
  Uganda: '🇺🇬',
  Tanzania: '🇹🇿',
  Ethiopia: '🇪🇹',
  Nigeria: '🇳🇬',
  Ghana: '🇬🇭',
  'South Africa': '🇿🇦',
  Egypt: '🇪🇬',
  Morocco: '🇲🇦',
  Germany: '🇩🇪',
  France: '🇫🇷',
  'United Kingdom': '🇬🇧',
  Netherlands: '🇳🇱',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Switzerland: '🇨🇭',
  Belgium: '🇧🇪',
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Japan: '🇯🇵',
  China: '🇨🇳',
  'South Korea': '🇰🇷',
  Australia: '🇦🇺',
  'New Zealand': '🇳🇿',
  India: '🇮🇳',
  Singapore: '🇸🇬',
  Turkey: '🇹🇷',
  'Saudi Arabia': '🇸🇦',
  UAE: '🇦🇪',
  Qatar: '🇶🇦',
  Brazil: '🇧🇷',
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🌍';
}

// ============================================================
// API Helper
// ============================================================

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) {
      return { error: json.error || json.message || 'Request failed' };
    }
    return { data: json.data ?? json };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}
