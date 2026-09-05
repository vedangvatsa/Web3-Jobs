import { getSignedKey } from "@/utils/getSignedKey";
import neynarClient from "@/lib/neynarClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  try {
    const signedKey = await getSignedKey();
    return NextResponse.json(signedKey, { status: 200 });
  } catch (error: any) {
    console.error("Signer creation error:", error);
    return NextResponse.json({ error: error?.message || "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const signerUuid = searchParams.get("signer_uuid");

  if (!signerUuid) {
    return NextResponse.json({ error: "signer_uuid query parameter required" }, { status: 400 });
  }

  try {
    const signer = await neynarClient.lookupSigner({ signerUuid });
    return NextResponse.json(signer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Lookup failed" }, { status: 500 });
  }
}
