'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "Is EduBridge Agency free to use?",
    answer: "Yes, browsing opportunities on EduBridge Agency is completely free for all students. We believe in providing open access to educational information."
  },
  {
    question: "Do you provide the scholarships directly?",
    answer: "No. EduBridge Agency is a discovery platform. We connect you with verified scholarships, but the actual funding and selection processes are handled by the respective universities or organizations."
  },
  {
    question: "How do I apply for a scholarship?",
    answer: "Each opportunity on our platform has an 'Official URL' link. Clicking this link will take you directly to the official provider's website where you can follow their specific application instructions."
  },
  {
    question: "Are all the scholarships verified?",
    answer: "Yes. Our team manually reviews every opportunity posted on our platform to ensure it is legitimate and sourced from an official provider."
  },
  {
    question: "Can I get help with my application?",
    answer: "Some opportunities posted by our admins include a dedicated Google Form or WhatsApp contact link where you can reach out for guidance and support during your application process."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="heading-1 text-primary">Frequently Asked Questions</h1>
            <p className="text-text-muted">Find answers to common questions about our platform.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="p-5 flex justify-between items-center bg-white">
                  <h3 className="font-semibold text-text">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
                {openIndex === index && (
                  <div className="p-5 pt-0 bg-white border-t border-slate-50 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
