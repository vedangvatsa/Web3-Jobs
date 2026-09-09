import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };
const DOC_URL = 'https://hashtagweb3.com/developers';

function apiError(code: string, message: string, hint: string, status: number) {
  return NextResponse.json({ error: { code, message, hint, docUrl: DOC_URL } }, { status, headers: CORS_HEADERS });
}

function apiOk(data: Record<string, unknown>) {
  return NextResponse.json(data, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const expectedSecret = process.env.AGENT_API_KEY || process.env.CRON_SECRET;
    if (!expectedSecret || token !== expectedSecret) {
      return apiError('UNAUTHORIZED', 'Unauthorized.', 'Provide a valid Authorization: Bearer token.', 401);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return apiError('INVALID_BODY', 'Request body must be valid JSON.', 'POST { "to": "...", "subject": "...", "text": "..." }.', 400);
    }
    const { to, subject, text, html } = body;

    if (!to || !subject || (!text && !html)) {
      return apiError('MISSING_FIELDS', 'Missing required fields: to, subject, and either text or html.', 'Include all required fields in the JSON body.', 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return apiError('EMAIL_NOT_CONFIGURED', 'Resend API key not configured on server.', 'Set RESEND_API_KEY in the environment.', 500);
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.EMAIL_FROM || 'hi@hashtagweb3.com';

    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      text,
      html,
      replyTo: 'hi@hashtagweb3.com',
    });

    if (result.error) {
      return apiError('EMAIL_SEND_FAILED', result.error.message, 'Verify sender domain and recipient address.', 500);
    }

    return apiOk({ success: true, id: result.data?.id });
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Internal Server Error.', 'Retry the request.', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
