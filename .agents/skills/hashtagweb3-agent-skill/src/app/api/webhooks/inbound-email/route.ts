import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Resend webhooks put email details in the "data" object
    const emailData = payload.data || payload;
    
    const from = emailData.from || '';
    const to = Array.isArray(emailData.to) ? emailData.to : [emailData.to || ''];
    const subject = emailData.subject || '(No Subject)';
    const text = emailData.text || '';
    const html = emailData.html || '';

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Resend API key not configured on server' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.EMAIL_FROM || 'alerts@hashtagweb3.com';

    // Construct forward metadata header
    const receivedDate = payload.created_at || new Date().toISOString();
    const forwardHeaderHtml = `
      <div style="border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 20px; color: #475569; font-family: sans-serif; font-size: 13px; line-height: 1.5;">
        <strong style="color: #1e1b4b; font-size: 14px;">---------- Forwarded message ---------</strong><br>
        <strong>From:</strong> ${escapeHtml(from)}<br>
        <strong>Date:</strong> ${receivedDate}<br>
        <strong>Subject:</strong> ${escapeHtml(subject)}<br>
        <strong>To:</strong> ${to.map(escapeHtml).join(', ')}
      </div>
    `;

    const forwardHeaderTxt = `
---------- Forwarded message ---------
From: ${from}
Date: ${receivedDate}
Subject: ${subject}
To: ${to.join(', ')}
--------------------------------------

`;

    // Forward the email to the user's personal address
    const result = await resend.emails.send({
      from: fromAddress,
      to: 'vatsvedang@gmail.com',
      reply_to: from, // Setting reply_to lets the user hit "Reply" in Gmail and message the sender directly
      subject: `[Fwd: ${to[0] || 'hi@hashtagweb3.com'}] ${subject}`,
      text: forwardHeaderTxt + (text || ''),
      html: html ? forwardHeaderHtml + html : undefined,
    });

    if (result.error) {
      console.error('Failed to forward email:', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
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
