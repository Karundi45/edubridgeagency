import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import Message from '@/lib/db/models/Message';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function AdminMessagesPage() {
  const session = await auth();
  
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return notFound();
  }

  await connectToDatabase();
  const messages = await Message.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Messages Inbox</h1>
        <p className="text-text-muted text-sm mt-1">View messages sent from the Contact Us page.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border divide-y divide-border overflow-hidden">
        {messages.length > 0 ? messages.map((msg: any) => (
          <div key={msg._id.toString()} className={`p-6 transition-colors ${msg.read ? 'bg-white' : 'bg-blue-50/30'}`}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.read ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                  {msg.read ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-primary/20" />}
                </div>
                <div>
                  <h3 className={`text-base ${msg.read ? 'font-medium text-text' : 'font-bold text-primary'}`}>{msg.subject}</h3>
                  <p className="text-sm font-medium text-text-muted">{msg.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-surface-alt p-4 rounded-xl border border-border/50 text-sm text-text-secondary leading-relaxed mb-4">
              {msg.message}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                <Mail className="w-4 h-4" /> {msg.email}
              </a>
              {msg.phone && (
                <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {msg.phone}
                </a>
              )}
            </div>
          </div>
        )) : (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-text-muted">No messages found in your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
}
