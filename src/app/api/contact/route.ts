import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import Message from '@/lib/db/models/Message';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ success: false, error: 'All required fields must be filled' }, { status: 400 });
    }
    
    await Message.create(data);
    
    // Send email notification to admin
    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'karundi2004@gmail.com',
      subject: `New Contact Form Submission: ${data.subject}`,
      html: `
        <h2>New Message from EduBridge Agency Contact Form</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr />
        <p><strong>Message:</strong><br />${data.message.replace(/\n/g, '<br/>')}</p>
      `
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Contact Form Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
