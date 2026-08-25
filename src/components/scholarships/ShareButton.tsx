'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Share2, Facebook, MessageCircle, Link2, Instagram, X as CloseIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `Check out this opportunity: ${title}`;

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    // Instagram doesn't have a direct share link, but we can copy the URL so they can paste it in IG
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EduBridge Agency',
          text,
          url,
        });
        return;
      } catch (err) {
        // Fallback to menu if user cancels or it fails
      }
    }
    setIsOpen(!isOpen);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard! You can paste it on Instagram or anywhere else.');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="lg" 
        className="w-full sm:flex-none"
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4 mr-2" /> Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-border shadow-lg rounded-xl z-50 w-56 flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-border">
              <span className="text-sm font-semibold text-text">Share to...</span>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            
            <a 
              href={shareLinks.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            
            <a 
              href={shareLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Facebook className="w-4 h-4" /> Facebook
            </a>
            
            <button 
              onClick={copyLink}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-pink-50 hover:text-pink-600 transition-colors w-full text-left"
            >
              <Instagram className="w-4 h-4" /> Copy for Instagram
            </button>
            
            <button 
              onClick={copyLink}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors w-full text-left"
            >
              <Link2 className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
