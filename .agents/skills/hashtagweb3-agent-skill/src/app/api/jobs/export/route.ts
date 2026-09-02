import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const jobId = `export_${Date.now()}`;
  const statusLocation = `https://hashtagweb3.com/api/jobs/export/${jobId}`;

  return NextResponse.json(
    {
      job_id: jobId,
      status: 'queued',
      message: 'Job export initiated. Poll the status URL in Location header for the completed export.',
      status_url: statusLocation,
    },
    {
      status: 202,
      headers: {
        'Content-Type': 'application/json',
        'Location': statusLocation,
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      description: 'Asynchronous Web3 job export endpoint. POST to initiate an async export task.',
      format: 'POST /api/jobs/export returns 202 Accepted with job_id and Location header.',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Idempotency-Key',
    },
  });
}
