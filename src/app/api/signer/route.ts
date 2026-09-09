import { getSignedKey } from "@/utils/getSignedKey";
import neynarClient from "@/lib/neynarClient";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };
const DOC_URL = 'https://hashtagweb3.com/developers';

function apiError(code: string, message: string, hint: string, status: number) {
  return NextResponse.json({ error: { code, message, hint, docUrl: DOC_URL } }, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' },
  });
}

export async function POST() {
  try {
    const signedKey = await getSignedKey();
    return NextResponse.json(signedKey, { status: 200, headers: CORS_HEADERS });
  } catch (error: any) {
    console.error("Signer creation error:", error);
    return apiError("SIGNER_ERROR", error?.message || "An error occurred", "Retry the request.", 500);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const signerUuid = searchParams.get("signer_uuid");

  if (!signerUuid) {
    return apiError("MISSING_UUID", "signer_uuid query parameter required.", "GET /api/signer?signer_uuid=<uuid>.", 400);
  }

  try {
    const signer = await neynarClient.lookupSigner({ signerUuid });
    return NextResponse.json(signer, { status: 200, headers: CORS_HEADERS });
  } catch (error: any) {
    return apiError("LOOKUP_FAILED", error?.message || "Lookup failed.", "Verify the signer UUID.", 500);
  }
}
