import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: google97f4fa3f483349a2.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
