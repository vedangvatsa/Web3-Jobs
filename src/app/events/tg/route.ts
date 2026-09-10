import { NextResponse } from 'next/server';

export function GET(request: Request) {
  return NextResponse.redirect(new URL('/events?utm_source=telegram&utm_medium=social&utm_campaign=events_button', request.url));
}
