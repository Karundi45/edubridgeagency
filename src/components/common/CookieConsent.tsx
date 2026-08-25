'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-text-secondary flex-1">
        <p><strong>We value your privacy</strong></p>
        <p className="mt-1">We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. <a href="#" className="text-primary hover:underline">Read more</a>.</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
        <Button variant="outline" className="flex-1 md:flex-none" onClick={handleAccept}>Essential Only</Button>
        <Button className="flex-1 md:flex-none" onClick={handleAccept}>Accept All</Button>
      </div>
    </div>
  );
}
