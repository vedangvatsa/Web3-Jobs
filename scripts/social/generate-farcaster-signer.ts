import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import neynarClient from "../../src/lib/neynarClient";
import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
import { bytesToHex, hexToBytes } from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

async function main() {
  console.log("==========================================");
  console.log(" Farcaster Managed Signer Setup (Neynar)");
  console.log("==========================================");

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    console.error("❌ NEYNAR_API_KEY is missing in .env.local");
    process.exit(1);
  }

  const mnemonic = process.env.FARCASTER_DEVELOPER_MNEMONIC;
  const privateKey = process.env.FARCASTER_DEVELOPER_PRIVATE_KEY;

  if (!mnemonic && !privateKey) {
    console.log("\n⚠️  FARCASTER_DEVELOPER_MNEMONIC is not set yet in .env.local.");
    console.log("\nTo generate a managed signer with Warpcast approval URL:");
    console.log("1. Open Warpcast on your phone (logged into @hashtagweb3 or your account)");
    console.log("2. Tap Settings -> Advanced -> Recovery Phrase");
    console.log("3. Add the 12 words to .env.local as:");
    console.log("   FARCASTER_DEVELOPER_MNEMONIC=\"word1 word2 word3 ... word12\"");
    console.log("   (Or FARCASTER_DEVELOPER_PRIVATE_KEY=0x... if using an Ethereum custody private key)");
    console.log("\nThen re-run this script to get an instant Warpcast approval link!");
    process.exit(1);
  }

  let account;
  if (privateKey) {
    const formatted = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;
    account = privateKeyToAccount(formatted);
  } else {
    account = mnemonicToAccount(mnemonic!.trim());
  }

  console.log("Custody Address:", account.address);

  let fid = process.env.FARCASTER_FID ? Number(process.env.FARCASTER_FID) : 3350013;
  console.log(`Using Farcaster account: @hashtagweb3 (FID: ${fid})`);

  console.log("Creating new Neynar signer...");
  const createSigner = await neynarClient.createSigner();
  console.log("Signer UUID:", createSigner.signer_uuid);
  console.log("Public Key :", createSigner.public_key);

  const appAccountKey = new ViemLocalEip712Signer(account as any);
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24h
  const uintAddress = hexToBytes(createSigner.public_key as `0x${string}`);

  console.log("Generating EIP-712 signed key request...");
  const signature = await appAccountKey.signKeyRequest({
    requestFid: BigInt(fid),
    key: uintAddress,
    deadline: BigInt(deadline),
  });

  if (signature.isErr()) {
    console.error("❌ Signature generation failed");
    process.exit(1);
  }

  const sigHex = bytesToHex(signature.value);

  console.log("Registering signed key with Neynar...");
  const signedKey = await neynarClient.registerSignedKey({
    signerUuid: createSigner.signer_uuid,
    appFid: fid,
    deadline,
    signature: sigHex,
    sponsor: {
      sponsored_by_neynar: true,
    },
  });

  console.log("\n==========================================");
  console.log("  SIGNER CREATED - APPROVAL REQUIRED");
  console.log("==========================================");
  console.log("Status:", signedKey.status);
  console.log("\nOpen this link on your phone (or in Warpcast) to approve:");
  console.log(signedKey.signer_approval_url);
  console.log("==========================================\n");

  console.log("Waiting for Warpcast approval (polling every 3s)...");
  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const statusRes = await neynarClient.lookupSigner({ signerUuid: createSigner.signer_uuid });
      if (statusRes.status === "approved") {
        console.log("\n🎉 SUCCESS! Signer approved by user.");
        console.log("Signer UUID:", statusRes.signer_uuid);

        // Update .env.local
        let envContent = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
        if (envContent.includes("FARCASTER_SIGNER_UUID=")) {
          envContent = envContent.replace(/FARCASTER_SIGNER_UUID=.*/g, `FARCASTER_SIGNER_UUID=${statusRes.signer_uuid}`);
        } else {
          envContent += `\nFARCASTER_SIGNER_UUID=${statusRes.signer_uuid}\n`;
        }
        fs.writeFileSync(".env.local", envContent);
        console.log("✓ Saved FARCASTER_SIGNER_UUID to .env.local!");
        break;
      } else if (statusRes.status === "revoked") {
        console.error("❌ Signer was revoked or rejected.");
        break;
      } else {
        process.stdout.write(".");
      }
    } catch (e: any) {
      process.stdout.write("x");
    }
  }
}

main().catch(console.error);
