import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import SystemSettings from '@/lib/db/models/SystemSettings';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const settingsDocs = await SystemSettings.find().lean();
    
    const settingsMap = settingsDocs.reduce((acc: any, doc: any) => {
      acc[doc.key] = doc.value;
      return acc;
    }, {});
    
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const data = await req.json();
    
    const promises = Object.entries(data).map(([key, value]) => {
      return SystemSettings.findOneAndUpdate(
        { key },
        { key, value, updatedBy: session.user.id },
        { upsert: true, new: true }
      );
    });
    
    await Promise.all(promises);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
