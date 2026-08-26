'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(json.error || 'Failed to send message');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="heading-1 text-primary">Contact Us</h1>
            <p className="text-text-muted">Have a question or need assistance? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text">Email</h3>
                <p className="text-sm text-text-muted">karundi2004@gmail.com</p>
              </Card>

              <Card className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-green-50 text-accent rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text">WhatsApp</h3>
                <p className="text-sm text-text-muted">+250791367715</p>
              </Card>

              <Card className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text">Location</h3>
                <p className="text-sm text-text-muted">Kigali, Rwanda</p>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="md:col-span-2 p-8">
              <h2 className="text-2xl font-bold text-text mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                  label="Full Name" 
                  name="name"
                  placeholder="John Doe" 
                  required 
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input 
                    label="Email Address" 
                    name="email"
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                  />
                  <Input 
                    label="Phone / WhatsApp" 
                    name="phone"
                    type="text" 
                    placeholder="+250..." 
                  />
                </div>
                
                <Input 
                  label="Subject" 
                  name="subject"
                  type="text" 
                  placeholder="I need help with..." 
                  required 
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-secondary">Message</label>
                  <textarea 
                    name="message"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[150px]"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto" loading={loading}>
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </Card>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
