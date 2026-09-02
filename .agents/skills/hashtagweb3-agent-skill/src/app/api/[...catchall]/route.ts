import { NextResponse } from 'next/server';

function makeNotFoundResponse() {
  return NextResponse.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API endpoint does not exist or has been moved.',
        hint: 'Verify the route path. Make sure to consult the OpenAPI specification at /openapi.json or the API catalog at /.well-known/api-catalog for valid endpoints.',
        docUrl: 'https://hashtagweb3.com/developers',
      },
    },
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      },
    }
  );
}

export async function GET() { return makeNotFoundResponse(); }
export async function POST() { return makeNotFoundResponse(); }
export async function PUT() { return makeNotFoundResponse(); }
export async function DELETE() { return makeNotFoundResponse(); }
export async function PATCH() { return makeNotFoundResponse(); }
export async function OPTIONS() { return makeNotFoundResponse(); }
export async function HEAD() { return makeNotFoundResponse(); }
