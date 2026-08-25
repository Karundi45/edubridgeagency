'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  hideCloseButton = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-text/50 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl animate-fade-in-up',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || description || !hideCloseButton) && (
          <div className="px-6 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-white z-10">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text">
                  {title}
                </h2>
              )}
              {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 -mt-1.5 text-text-muted hover:text-text hover:bg-surface-alt rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
