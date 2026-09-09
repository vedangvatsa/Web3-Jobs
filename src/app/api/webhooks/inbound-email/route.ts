import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Optional shared-secret gate (set INBOUND_WEBHOOK_SECRET and configure
    // the Resend webhook URL as .../inbound-email?secret=<value>). Unset =
    // open (legacy behavior) so existing forwards never break silently.
    const hookSecret = process.env.INBOUND_WEBHOOK_SECRET;
    if (hookSecret) {
      const provided =
        request.nextUrl.searchParams.get('secret') ||
        (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
      if (provided !== hookSecret) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Unauthorized.', hint: 'Provide the webhook secret.', docUrl: 'https://hashtagweb3.com/developers' } },
          { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    const payload = await request.json();
    
    // Resend webhooks put email details in the "data" object
    const emailData = payload.data || payload;
    
    const from = emailData.from || '';
    const to = Array.isArray(emailData.to) ? emailData.to : [emailData.to || ''];
    const subject = emailData.subject || '(No Subject)';
    const text = emailData.text || '';
    const html = emailData.html || '';

    // Forwarding disabled — just acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
