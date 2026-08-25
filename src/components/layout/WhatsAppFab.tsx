'use client';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFab({ phoneNumber, defaultMessage = 'Hello EduBridge Agency, I would like more information about an opportunity I found on your website.' }: { phoneNumber?: string, defaultMessage?: string }) {
  const pathname = usePathname();
  
  if (!phoneNumber) return null;

  // Attempt to customize message based on URL
  let message = defaultMessage;
  if (pathname.includes('/scholarships/')) {
    message = `Hello EduBridge Agency, I would like more information about the scholarship I found here: https://edubridge-agency.com${pathname}`;
  } else if (pathname.includes('/jobs/')) {
    message = `Hello EduBridge Agency, I would like more information about the job opportunity I found here: https://edubridge-agency.com${pathname}`;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
